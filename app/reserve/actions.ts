'use server'

import { randomUUID } from 'node:crypto'
import { redirect, unstable_rethrow } from 'next/navigation'
import { z } from 'zod'
import { houses, type HouseId } from '@/lib/houses'
import { MAX_PHOTOS, MAX_PHOTO_MB, photoTypes, type PhotoType } from '@/lib/photos'
import { knownForOptions, settingOptions } from '@/lib/preferences'
import { routes } from '@/lib/routes'
import { sendConfirmation, sendContinueLink } from '@/lib/server/reservationEmails'
import { currentReservation, heldReservationId, holdReservation, reservationNumber } from '@/lib/server/reservations'
import { db, PHOTO_BUCKET, type Database } from '@/lib/server/supabase'
import { isHuman } from '@/lib/server/turnstile'

// Every step of reserving, from /drop to /reserve/4. Each one works on the reservation in the
// visitor's cookie only, and checks everything it's given: these can be called by anyone, not just
// through the site's forms.

export type FormState = { error?: string; notice?: string } | null

const trouble = { error: 'Something went wrong on our side. Please try again in a moment.' }

// If the database or storage can't be reached, the form says so instead of the page breaking.
// Redirects pass through.
async function safely<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run()
  } catch (e) {
    unstable_rethrow(e)
    console.error('[reserve]', e)
    return fallback
  }
}

const emailAddress = z.string().trim().toLowerCase().pipe(z.email().max(254))
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((t) => t || null)
const houseId = z
  .string()
  .refine((id): id is HouseId => houses.some((h) => h.id === id))
  .nullable()
  .catch(null)
const oneOf = (options: readonly string[]) =>
  z
    .string()
    .refine((o) => options.includes(o))
    .nullable()
    .catch(null)

const field = (form: FormData, name: string) => {
  const v = form.get(name)
  return typeof v === 'string' ? v : ''
}

// Indian mobile numbers as people type them (with spaces, a leading 0 or 91), as +91XXXXXXXXXX
function indianMobile(raw: string) {
  let digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : undefined
}

async function update(patch: Database['public']['Tables']['reservations']['Update']) {
  const id = await heldReservationId()
  if (!id) redirect(routes.drop)
  const { data, error } = await db().from('reservations').update(patch).eq('id', id).select('id').maybeSingle()
  if (error) throw error
  // The cookie names a reservation that's gone
  if (!data) redirect(routes.drop)
}

// /drop: reserve a place with an email and WhatsApp number
export async function startReservation(_: FormState, form: FormData) {
  return safely(() => reserve(form), trouble)
}

async function reserve(form: FormData): Promise<FormState> {
  const email = emailAddress.safeParse(field(form, 'email'))
  if (!email.success) return { error: 'Please enter a valid email address.' }
  const whatsapp = indianMobile(field(form, 'whatsapp'))
  if (!whatsapp) return { error: 'Please enter a valid 10-digit WhatsApp number.' }
  const house = houseId.parse(field(form, 'house') || null)
  if (!(await isHuman(field(form, 'cf-turnstile-response')))) {
    return { error: "We couldn't confirm you're not a robot. Please try again." }
  }

  const find = async () => {
    const { data, error } = await db().from('reservations').select('id, number, email, continue_sent_at').eq('email', email.data).maybeSingle()
    if (error) throw error
    return data
  }
  // Looking first, so only new members use up a reservation number (a failed insert still would)
  let existing = await find()
  if (!existing) {
    const { data: created, error } = await db()
      .from('reservations')
      .insert({ email: email.data, whatsapp, ...(house && { house }) })
      .select('id, number, email')
      .single()
    if (created) {
      await holdReservation(created.id)
      await sendConfirmation(created)
      redirect(routes.reserve(1))
    }
    // Anything but the same email arriving twice at once is a real failure
    if (error.code !== '23505') throw error
    existing = await find()
    if (!existing) throw error
  }

  // Their own reservation, from this browser: bring the details up to date and carry on
  if (existing.id === (await heldReservationId())) {
    await update({ whatsapp, ...(house && { house }) })
    redirect(routes.reserve(1))
  }
  // Someone else's, or theirs from another device: only the inbox's owner can pick it back up
  await sendContinueLink(existing)
  return { notice: "You're already on the list. We've emailed you a link to continue your reservation." }
}

// /reserve/2
export async function saveProfile(_: FormState, form: FormData) {
  return safely(async (): Promise<FormState> => {
    const profile = z.object({ name: optionalText(100), city: optionalText(100) }).safeParse({ name: field(form, 'name'), city: field(form, 'city') })
    if (!profile.success) return { error: 'Please keep your name and city under 100 characters.' }
    await update(profile.data)
    redirect(routes.reserve(3))
  }, trouble)
}

// /reserve/3
export async function savePreferences(_: FormState, form: FormData) {
  return safely(async (): Promise<FormState> => {
    await update({
      house: houseId.parse(field(form, 'house') || null),
      known_for: oneOf(knownForOptions).parse(field(form, 'knownFor') || null),
      setting: oneOf(settingOptions).parse(field(form, 'setting') || null),
    })
    redirect(routes.reserve(4))
  }, trouble)
}

// /reserve/4: photos go straight from the browser to storage. This hands out a signed upload link
// for each, into the reservation's own folder (named by its number, e.g. WZ-0001/).

type UploadLinks = { uploads: { url: string; path: string }[] } | { error: string }

const photoList = z
  .array(
    z.object({
      type: z.enum(Object.keys(photoTypes) as [PhotoType, ...PhotoType[]]),
      size: z
        .number()
        .int()
        .positive()
        .max(MAX_PHOTO_MB * 1024 * 1024),
    }),
  )
  .min(1)
  .max(MAX_PHOTOS)

async function photosIn(folder: string) {
  const { data, error } = await db().storage.from(PHOTO_BUCKET).list(folder, { limit: 100 })
  if (error) throw error
  return data.filter((o) => o.id && !o.name.startsWith('.')).length
}

export async function photoUploadLinks(files: { type: string; size: number }[]) {
  return safely(() => uploadLinks(files), trouble as UploadLinks)
}

async function uploadLinks(files: { type: string; size: number }[]): Promise<UploadLinks> {
  const r = await currentReservation()
  if (!r) redirect(routes.drop)
  const list = photoList.safeParse(files)
  if (!list.success) return { error: `Photos need to be JPEG, PNG, WebP or HEIC images under ${MAX_PHOTO_MB} MB each.` }
  const folder = reservationNumber(r.number)
  const left = MAX_PHOTOS - (await photosIn(folder))
  if (list.data.length > left) {
    return { error: left > 0 ? `You can add ${left} more photo${left === 1 ? '' : 's'}.` : `You've already added ${MAX_PHOTOS} photos.` }
  }
  const bucket = db().storage.from(PHOTO_BUCKET)
  const uploads = await Promise.all(
    list.data.map(async (f) => {
      const path = `${folder}/${randomUUID()}.${photoTypes[f.type]}`
      const { data, error } = await bucket.createSignedUploadUrl(path)
      if (error) throw error
      return { url: data.signedUrl, path }
    }),
  )
  return { uploads }
}

// Saves the wish, and counts the photos now in the reservation's folder
export async function saveWishes(_: FormState, form: FormData) {
  return safely(async (): Promise<FormState> => {
    const r = await currentReservation()
    if (!r) redirect(routes.drop)
    const wish = optionalText(500).safeParse(field(form, 'wish'))
    if (!wish.success) return { error: 'Please keep your wishes under 500 characters.' }
    const photos = Math.min(await photosIn(reservationNumber(r.number)), MAX_PHOTOS)
    await update({ wish: wish.data, photos })
    redirect(routes.reserve(5))
  }, trouble)
}
