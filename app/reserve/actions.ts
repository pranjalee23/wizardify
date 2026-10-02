'use server'

import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { after } from 'next/server'
import { z } from 'zod'
import { houses, type HouseId } from '@/lib/houses'
import { MAX_PHOTOS, MAX_PHOTO_MB, photoTypes, type PhotoType } from '@/lib/photos'
import { MAX_PREVIEWS } from '@/lib/previews'
import { companionOptions, knownForOptions, roleOptions, settingOptions, skyballOptions } from '@/lib/preferences'
import { routes } from '@/lib/routes'
import { notifyProblem, notifyTeam } from '@/lib/server/alerts'
import { emailProblem } from '@/lib/server/emailCheck'
import { sendConfirmation, sendContinueLink } from '@/lib/server/reservationEmails'
import { currentReservation, heldReservationId, holdReservation, reservationNumber } from '@/lib/server/reservations'
import { db, PHOTO_BUCKET, type Database } from '@/lib/server/supabase'
import { humanCheck } from '@/lib/server/turnstile'

// Every step of reserving, from /drop to /reserve/3. Each one works on the reservation in the
// visitor's cookie only, and checks everything it's given: these can be called by anyone, not just
// through the site's forms.

// confirmEmail: the address a "did you mean…?" asked about, so pressing Reserve again keeps it
export type FormState = { error?: string; notice?: string; confirmEmail?: string } | null

const trouble = { error: 'Something went wrong on our side. Please try again in a moment.' }

// If the database or storage can't be reached, the form says so instead of the page breaking, and
// the team hears about it. Redirects pass through.
async function safely<T>(step: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run()
  } catch (e) {
    unstable_rethrow(e)
    console.error('[reserve]', e)
    const message = e instanceof Error ? e.message : String(e)
    after(() => notifyProblem(step, `A member couldn't ${step}: ${message}`))
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
  return safely('reserve', () => reserve(form), trouble)
}

// Where the visitor is, roughly, from their internet connection (Vercel adds it to each request),
// and their IP address. Good for knowing where members are and spotting spam; too rough to ship to,
// as mobile networks often place people in a city far from where they are.
async function roughLocation() {
  const h = await headers()
  const read = (name: string) => {
    try {
      const v = h.get(name)
      return v ? decodeURIComponent(v).slice(0, 100) : null
    } catch {
      return null
    }
  }
  const country = read('x-vercel-ip-country')
  const ip = (h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0] ?? '').trim().slice(0, 64)
  return {
    ip: ip || null,
    approx_city: read('x-vercel-ip-city'),
    approx_region: read('x-vercel-ip-country-region'),
    approx_country: country && /^[A-Z]{2}$/.test(country) ? country : null,
  }
}

async function reserve(form: FormData): Promise<FormState> {
  const name = z.string().trim().min(1).max(100).safeParse(field(form, 'name'))
  if (!name.success) return { error: 'Please tell us your name.' }
  const email = emailAddress.safeParse(field(form, 'email'))
  if (!email.success) return { error: 'Please enter a valid email address.' }
  const emailIssue = await emailProblem(email.data, field(form, 'emailConfirmed') === email.data)
  if (emailIssue && 'error' in emailIssue) return { error: emailIssue.error }
  if (emailIssue) return { error: emailIssue.check, confirmEmail: email.data }
  const whatsapp = indianMobile(field(form, 'whatsapp'))
  if (!whatsapp) return { error: 'Please enter a valid 10-digit WhatsApp number.' }
  const house = houseId.parse(field(form, 'house') || null)
  const check = await humanCheck(field(form, 'cf-turnstile-response'))
  if (check === 'unchecked' && process.env.TURNSTILE_SECRET_KEY) {
    after(() => notifyProblem('turnstile-down', "Cloudflare's bot check couldn't be reached, so reservations are going through unchecked for now."))
  }
  if (check === 'bot') {
    after(() => notifyProblem('bots', 'Cloudflare stopped a likely bot from reserving on the drop form.'))
    return { error: "We couldn't confirm you're not a robot. If you see “Verify you are human” below, tick it, then try again." }
  }

  const find = async () => {
    const { data, error } = await db().from('reservations').select('id, number, email, name, priority, continue_sent_at').eq('email', email.data).maybeSingle()
    if (error) throw error
    return data
  }
  // Looking first, so only new members use up a reservation number (a failed insert still would)
  let existing = await find()
  if (!existing) {
    const location = await roughLocation()
    const { data: created, error } = await db()
      .from('reservations')
      .insert({ email: email.data, whatsapp, name: name.data, ...location, ...(house && { house }) })
      .select('id, number, email, name')
      .single()
    if (created) {
      await holdReservation(created.id)
      await sendConfirmation(created)
      after(async () => {
        const { count } = await db().from('reservations').select('*', { count: 'exact', head: true })
        const houseName = houses.find((h) => h.id === house)?.name
        const { approx_city: city, ip } = location
        const where = city ? `, from ${city}` : ''
        await notifyTeam(`🪄 New reservation: ${reservationNumber(created.number)}${houseName ? `, ${houseName}` : ''}${where}. ${count ?? '?'} members in all.`)
        // Lots of reservations from one address in a short time looks like spam
        if (ip) {
          const { count: fromIp } = await db()
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('ip', ip)
            .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          if ((fromIp ?? 0) >= 5) await notifyProblem(`ip-${ip}`, `${fromIp} reservations from one IP address (${ip}) in the last hour. That might be spam; check them in the admin.`)
        }
      })
      redirect(routes.reserve(1))
    }
    // Anything but the same email arriving twice at once is a real failure
    if (error.code !== '23505') throw error
    existing = await find()
    if (!existing) throw error
  }

  // Their own reservation, from this browser: bring the details up to date and carry on
  if (existing.id === (await heldReservationId())) {
    await update({ whatsapp, name: name.data, ...(house && { house }) })
    redirect(routes.reserve(1))
  }
  // Someone else's, or theirs from another device: only the inbox's owner can pick it back up
  await sendContinueLink(existing)
  return { notice: "You're already on the list. We've emailed you a link to continue your reservation." }
}

// /reserve/2: portrait preferences (optional)
export async function savePreferences(_: FormState, form: FormData) {
  return safely('save their preferences', async (): Promise<FormState> => {
    await update({
      house: houseId.parse(field(form, 'house') || null),
      known_for: oneOf(knownForOptions).parse(field(form, 'knownFor') || null),
      role: oneOf(roleOptions).parse(field(form, 'role') || null),
      skyball: oneOf(skyballOptions).parse(field(form, 'skyball') || null),
      companion: oneOf(companionOptions).parse(field(form, 'companion') || null),
      setting: oneOf(settingOptions).parse(field(form, 'setting') || null),
    })
    redirect(routes.reserve(3))
  }, trouble)
}

// /reserve/3: photos go straight from the browser to storage. This hands out a signed upload link
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
  return safely('upload photos', () => uploadLinks(files), trouble as UploadLinks)
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
  return safely('save their photos and wishes', async (): Promise<FormState> => {
    const r = await currentReservation()
    if (!r) redirect(routes.drop)
    const wish = optionalText(500).safeParse(field(form, 'wish'))
    if (!wish.success) return { error: 'Please keep your wishes under 500 characters.' }
    const photos = Math.min(await photosIn(reservationNumber(r.number)), MAX_PHOTOS)
    await update({ wish: wish.data, photos })
    if (photos > r.photos) {
      const added = photos - r.photos
      after(() => notifyTeam(`📷 ${reservationNumber(r.number)} added ${added} photo${added === 1 ? '' : 's'} (${photos} in all).`))
    }
    redirect(routes.reserve(4))
  }, trouble)
}

// /reserve/preview: the member approves their preview, or asks for changes (up to MAX_PREVIEWS - 1
// rounds). Both work on the latest preview of the reservation in their cookie, if it's waiting.

async function waitingPreview() {
  const r = await currentReservation()
  if (!r) redirect(routes.drop)
  const { data: latest } = await db().from('previews').select('id, round, status').eq('reservation_id', r.id).order('round', { ascending: false }).limit(1).maybeSingle()
  return { r, latest: latest?.status === 'sent' ? latest : null }
}

export async function approvePreview(_: FormState) {
  return safely('approve their preview', async (): Promise<FormState> => {
    const { r, latest } = await waitingPreview()
    if (!latest) return { error: 'There is no preview waiting for you.' }
    const now = new Date().toISOString()
    await db().from('previews').update({ status: 'approved', decided_at: now }).eq('id', latest.id)
    await update({ preview_status: 'approved', approved_at: now })
    after(() => notifyTeam(`✅ ${reservationNumber(r.number)} approved their preview${latest.round > 1 ? ` (round ${latest.round})` : ''}.`))
    redirect(routes.preview)
  }, trouble)
}

export async function requestChanges(_: FormState, form: FormData) {
  return safely('ask for changes', async (): Promise<FormState> => {
    const feedback = z.string().trim().min(5).max(1000).safeParse(field(form, 'feedback'))
    if (!feedback.success) return { error: "Please tell us what you'd like changed (up to 1,000 characters)." }
    const { r, latest } = await waitingPreview()
    if (!latest) return { error: 'There is no preview waiting for you.' }
    if (latest.round >= MAX_PREVIEWS) return { error: 'That was your last round of changes. Please write to us at hello@wizardify.me.' }
    await db().from('previews').update({ status: 'changes', feedback: feedback.data, decided_at: new Date().toISOString() }).eq('id', latest.id)
    await update({ preview_status: 'changes' })
    after(() => notifyTeam(`✏️ ${reservationNumber(r.number)} asked for changes to their preview (round ${latest.round}). Their notes are in the admin.`))
    redirect(routes.preview)
  }, trouble)
}
