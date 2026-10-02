import 'server-only'
import type { ReactElement } from 'react'
import { after } from 'next/server'
import ContinueReservation from '@/emails/ContinueReservation'
import PhotoReminder from '@/emails/PhotoReminder'
import ReservationConfirmed from '@/emails/ReservationConfirmed'
import { db } from './supabase'
import { sendEmail } from './email'
import { continueToken, reservationNumber, siteUrl, unsubscribeToken } from './reservations'

type Held = { id: string; number: number; email: string; name: string | null }

// The first word of their name, capitalised if they typed it all in lowercase ("nisha sharma" is Nisha)
function firstName(name: string | null) {
  const first = name?.trim().split(/\s+/)[0]
  if (!first) return undefined
  return first === first.toLowerCase() ? first[0].toUpperCase() + first.slice(1) : first
}

const continueUrl = (site: string, id: string, to?: 'photos') => `${site}/reserve/continue?t=${continueToken(id)}${to ? `&to=${to}` : ''}`

// Emails answering something the member just did (the confirmation, the continue link) are
// transactional. Reminders and drop alerts are bulk mail, so they carry a way to stop them: a footer
// link to the page where members choose, and the headers Gmail, Yahoo and Apple Mail use for their own
// one-click Unsubscribe. Keeping those off transactional emails helps Gmail file them under Updates
// or Primary rather than Promotions.
type Kind = 'transactional' | 'bulk'

async function toMember(r: Held, kind: Kind, subject: string, make: (site: string, unsubscribeUrl?: string) => ReactElement) {
  const site = await siteUrl()
  if (kind === 'transactional') return sendEmail({ to: r.email, subject, react: make(site) })
  const token = unsubscribeToken(r.id)
  return sendEmail({
    to: r.email,
    subject,
    react: make(site, `${site}/unsubscribe?t=${token}`),
    headers: {
      'List-Unsubscribe': `<${site}/api/unsubscribe?t=${token}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}

// Both of these go out after the response, so the visitor isn't kept waiting on the mail service

export async function sendConfirmation(r: Held) {
  const number = reservationNumber(r.number)
  const first = firstName(r.name)
  after(() =>
    toMember(r, 'transactional', first ? `Your place is held, ${first} ✨` : 'Your place is held ✨', (site) => (
      <ReservationConfirmed number={number} firstName={first} continueUrl={continueUrl(site, r.id)} site={site} />
    )),
  )
}

// At most one every 10 minutes per reservation, so the form can't be used to flood someone's inbox
type Progress = { house: string | null; known_for: string | null; setting: string | null; photos: number }

export async function sendContinueLink(r: Held & Progress & { continue_sent_at: string | null }) {
  if (r.continue_sent_at && Date.now() - Date.parse(r.continue_sent_at) < 10 * 60 * 1000) return
  const { error } = await db().from('reservations').update({ continue_sent_at: new Date().toISOString() }).eq('id', r.id)
  if (error) throw error
  const number = reservationNumber(r.number)
  const first = firstName(r.name)
  // First in line: portrait preferences on record (as on the certificate)
  const firstInLine = Boolean(r.house || r.known_for || r.setting)
  after(() =>
    toMember(r, 'transactional', first ? `Back so soon, ${first}? Your place is still held` : 'Back so soon? Your place is still held', (site) => (
      <ContinueReservation number={number} firstName={first} firstInLine={firstInLine} continueUrl={continueUrl(site, r.id)} site={site} />
    )),
  )
}

// Sent by the daily job (lib/server/daily.ts), which waits for it and records it
export function sendPhotoReminder(r: Held, last: boolean) {
  return toMember(r, 'bulk', last ? 'Last reminder: add your photos' : 'Add your photos for your portrait', (site, unsubscribeUrl) => (
    <PhotoReminder
      number={reservationNumber(r.number)}
      firstName={firstName(r.name)}
      photosUrl={continueUrl(site, r.id, 'photos')}
      site={site}
      unsubscribeUrl={unsubscribeUrl}
      last={last}
    />
  ))
}
