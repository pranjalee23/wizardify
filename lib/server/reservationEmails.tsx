import 'server-only'
import type { ReactElement } from 'react'
import { after } from 'next/server'
import ContinueReservation from '@/emails/ContinueReservation'
import DropAlert from '@/emails/DropAlert'
import PhotoReminder from '@/emails/PhotoReminder'
import ReservationConfirmed from '@/emails/ReservationConfirmed'
import { db } from './supabase'
import { sendBatch, sendEmail, type Email } from './email'
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
  return sendEmail(bulk(site, r, subject, make))
}

function bulk(site: string, r: Held, subject: string, make: (site: string, unsubscribeUrl: string) => ReactElement): Email {
  const token = unsubscribeToken(r.id)
  return {
    to: r.email,
    subject,
    react: make(site, `${site}/unsubscribe?t=${token}`),
    headers: {
      'List-Unsubscribe': `<${site}/api/unsubscribe?t=${token}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }
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
export async function sendContinueLink(r: Held & { priority: 'first' | 'standard'; continue_sent_at: string | null }) {
  if (r.continue_sent_at && Date.now() - Date.parse(r.continue_sent_at) < 10 * 60 * 1000) return
  const { error } = await db().from('reservations').update({ continue_sent_at: new Date().toISOString() }).eq('id', r.id)
  if (error) throw error
  const number = reservationNumber(r.number)
  const first = firstName(r.name)
  // First in line: all six portrait preferences on record, as on the certificate
  const firstInLine = r.priority === 'first'
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

// "The doors are open", to many members at once (from /admin/alerts). Says which went, in order.
export async function sendDropAlerts(members: Held[]) {
  const site = await siteUrl()
  return sendBatch(
    members.map((r) => {
      const first = firstName(r.name)
      return bulk(site, r, first ? `The doors are open, ${first} ✨` : 'The doors are open ✨', (site, unsubscribeUrl) => (
        <DropAlert number={reservationNumber(r.number)} firstName={first} portraitUrl={continueUrl(site, r.id)} site={site} unsubscribeUrl={unsubscribeUrl} />
      ))
    }),
  )
}
