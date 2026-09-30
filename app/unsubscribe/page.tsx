import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import AlertsForm from '@/components/reserve/AlertsForm'
import { routes } from '@/lib/routes'
import { readUnsubscribeToken, reservationNumber } from '@/lib/server/reservations'
import { db } from '@/lib/server/supabase'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import r from '@/components/reserve/reserve.module.css'

export const metadata: Metadata = { title: 'Your drop alerts, Wizardify', robots: { index: false } }

type Props = { searchParams: Promise<{ t?: string | string[] }> }

// Opened from the unsubscribe link in our emails. Opening it changes nothing (email scanners open
// links too); the member chooses and saves.
export default async function UnsubscribePage({ searchParams }: Props) {
  const { t } = await searchParams
  const token = typeof t === 'string' ? t : ''
  const id = readUnsubscribeToken(token)
  const { data: member } = id
    ? await db().from('reservations').select('number, alerts_email, alerts_whatsapp').eq('id', id).maybeSingle()
    : { data: null }

  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={900}>
      <Nav active="home" />
      <main className={`${layout.container} ${r.main}`}>
        <h1 className={`${ui.shimmer} ${r.title}`}>YOUR DROP ALERTS</h1>
        {member ? (
          <>
            <p className={r.lede}>Choose how we let you know when the doors reopen. Reservation {reservationNumber(member.number)}.</p>
            <AlertsForm token={token} email={member.alerts_email} whatsapp={member.alerts_whatsapp} />
          </>
        ) : (
          <p className={r.lede}>
            This link isn&apos;t valid any more. Please use the link from one of our emails, or write to us at{' '}
            <a href="mailto:hello@wizardify.me">hello@wizardify.me</a>. <Link href={routes.home}>Back to home</Link>
          </p>
        )}
      </main>
    </PageShell>
  )
}
