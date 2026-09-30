import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { routes } from '@/lib/routes'
import { db, type ReservationRow } from './supabase'

// A visitor's reservation is theirs by a cookie holding its id, set when they reserve (or when they
// open a "continue your reservation" link from their email). Every action checks it; nothing takes an
// id from the browser.
const COOKIE = 'wz_reservation'
const YEAR = 60 * 60 * 24 * 365

export type Reservation = ReservationRow

export const reservationNumber = (n: number) => `WZ-${String(n).padStart(4, '0')}`

export async function holdReservation(id: string) {
  ;(await cookies()).set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: YEAR,
  })
}

export async function heldReservationId() {
  const id = (await cookies()).get(COOKIE)?.value
  return id && /^[0-9a-f-]{36}$/.test(id) ? id : undefined
}

// The reservation this visitor holds, if any; read once per request
export const currentReservation = cache(async (): Promise<Reservation | null> => {
  const id = await heldReservationId()
  if (!id) return null
  const { data, error } = await db().from('reservations').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
})

// For the /reserve pages: without a reservation, there's nothing to show, so start at /drop
export async function requireReservation() {
  const r = await currentReservation()
  if (!r) redirect(routes.drop)
  return r
}

// Links in emails: the reservation id and an expiry, signed so they can't be forged or altered. Each
// kind of link is signed for its purpose, so an unsubscribe link can't be used to open a reservation.
type Purpose = 'continue' | 'unsubscribe'

function sign(purpose: Purpose, payload: string) {
  const secret = process.env.RESERVATION_SECRET
  if (!secret) throw new Error('RESERVATION_SECRET is not set (see .env.example)')
  return createHmac('sha256', secret).update(`${purpose}.${payload}`).digest('base64url')
}

function linkToken(purpose: Purpose, id: string, days: number) {
  const payload = `${id}.${Math.floor(Date.now() / 1000) + days * 86400}`
  return `${payload}.${sign(purpose, payload)}`
}

function readLinkToken(purpose: Purpose, token: string) {
  const [id, expires, sig] = token.split('.')
  if (!id || !expires || !sig) return undefined
  const expected = Buffer.from(sign(purpose, `${id}.${expires}`))
  const given = Buffer.from(sig)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return undefined
  if (Number(expires) * 1000 < Date.now()) return undefined
  return id
}

// Brings a member back to their reservation on any device, for 30 days
export const continueToken = (id: string) => linkToken('continue', id, 30)
export const readContinueToken = (token: string) => readLinkToken('continue', token)

// Changes which drop alerts a member gets; works for as long as the emails are kept
export const unsubscribeToken = (id: string) => linkToken('unsubscribe', id, 3650)
export const readUnsubscribeToken = (token: string) => readLinkToken('unsubscribe', token)

// Where links in emails point: the live site in production, this deployment on previews, and the
// dev server locally
export async function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_ENV === 'production') return 'https://www.wizardify.me'
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://${(await headers()).get('host') ?? 'localhost:3000'}`
}
