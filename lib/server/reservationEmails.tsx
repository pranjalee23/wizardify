import 'server-only'
import { after } from 'next/server'
import ContinueReservation from '@/emails/ContinueReservation'
import ReservationConfirmed from '@/emails/ReservationConfirmed'
import { db } from './supabase'
import { sendEmail } from './email'
import { continueToken, reservationNumber, siteUrl } from './reservations'

type Held = { id: string; number: number; email: string }

const continueUrl = (site: string, id: string) => `${site}/reserve/continue?t=${continueToken(id)}`

// Both go out after the response, so the visitor isn't kept waiting on the mail service

export async function sendConfirmation(r: Held) {
  const site = await siteUrl()
  const number = reservationNumber(r.number)
  after(() =>
    sendEmail({
      to: r.email,
      subject: `Your place is held: ${number}`,
      react: <ReservationConfirmed number={number} continueUrl={continueUrl(site, r.id)} site={site} />,
    }),
  )
}

// At most one every 10 minutes per reservation, so the form can't be used to flood someone's inbox
export async function sendContinueLink(r: Held & { continue_sent_at: string | null }) {
  if (r.continue_sent_at && Date.now() - Date.parse(r.continue_sent_at) < 10 * 60 * 1000) return
  const { error } = await db().from('reservations').update({ continue_sent_at: new Date().toISOString() }).eq('id', r.id)
  if (error) throw error
  const site = await siteUrl()
  const number = reservationNumber(r.number)
  after(() =>
    sendEmail({
      to: r.email,
      subject: `Continue your reservation: ${number}`,
      react: <ContinueReservation number={number} continueUrl={continueUrl(site, r.id)} site={site} />,
    }),
  )
}
