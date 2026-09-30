import 'server-only'
import type { ReactElement } from 'react'
import { after } from 'next/server'
import ContinueReservation from '@/emails/ContinueReservation'
import PhotoReminder from '@/emails/PhotoReminder'
import ReservationConfirmed from '@/emails/ReservationConfirmed'
import { db } from './supabase'
import { sendEmail } from './email'
import { continueToken, reservationNumber, siteUrl, unsubscribeToken } from './reservations'

type Held = { id: string; number: number; email: string }

const continueUrl = (site: string, id: string, to?: 'photos') => `${site}/reserve/continue?t=${continueToken(id)}${to ? `&to=${to}` : ''}`

// Every email to a member carries a way to stop drop alerts: a link in the footer to the page where
// they choose, and the headers Gmail, Yahoo and Apple Mail use for their own one-click Unsubscribe
async function toMember(r: Held, subject: string, make: (site: string, unsubscribeUrl: string) => ReactElement) {
  const site = await siteUrl()
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
  after(() =>
    toMember(r, `Your place is held: ${number}`, (site, unsubscribeUrl) => (
      <ReservationConfirmed number={number} continueUrl={continueUrl(site, r.id)} site={site} unsubscribeUrl={unsubscribeUrl} />
    )),
  )
}

// At most one every 10 minutes per reservation, so the form can't be used to flood someone's inbox
export async function sendContinueLink(r: Held & { continue_sent_at: string | null }) {
  if (r.continue_sent_at && Date.now() - Date.parse(r.continue_sent_at) < 10 * 60 * 1000) return
  const { error } = await db().from('reservations').update({ continue_sent_at: new Date().toISOString() }).eq('id', r.id)
  if (error) throw error
  const number = reservationNumber(r.number)
  after(() =>
    toMember(r, `Continue your reservation: ${number}`, (site, unsubscribeUrl) => (
      <ContinueReservation number={number} continueUrl={continueUrl(site, r.id)} site={site} unsubscribeUrl={unsubscribeUrl} />
    )),
  )
}

// Sent by the daily job (lib/server/daily.ts), which waits for it and records it
export function sendPhotoReminder(r: Held, last: boolean) {
  return toMember(r, last ? 'Last reminder: add your photos' : 'Add your photos to be first in line', (site, unsubscribeUrl) => (
    <PhotoReminder
      number={reservationNumber(r.number)}
      photosUrl={continueUrl(site, r.id, 'photos')}
      site={site}
      unsubscribeUrl={unsubscribeUrl}
      last={last}
    />
  ))
}
