import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Certificate from '@/components/reserve/Certificate'
import { routes } from '@/lib/routes'
import { requireReservation } from '@/lib/server/reservations'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './reserved.module.css'

export const metadata: Metadata = { title: 'Your place is reserved, Wizardify' }

export default async function ReserveStep4() {
  const r = await requireReservation()
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1100}>
      <Nav active="home" />
      <main className={`${layout.container} ${s.main}`}>
        <h1 className={`${ui.shimmer} ${s.title}`} data-reveal="0">
          YOUR PLACE IS RESERVED.
        </h1>
        <p className={s.lede} data-reveal="1">
          A confirmation is on its way to <span className={s.email}>{r.email}</span>.
        </p>
        {r.preview_status && (
          <Link href={routes.preview} className={`${ui.pill} ${ui.paper} ${s.preview}`} data-reveal="2">
            {r.preview_status === 'sent' ? 'YOUR PORTRAIT IS READY: WATCH IT' : r.preview_status === 'changes' ? 'SEE YOUR PORTRAIT' : 'YOUR APPROVED PORTRAIT'}
          </Link>
        )}
        <div data-reveal="2">
          <Certificate reservation={r} />
        </div>
        <div className={s.actions} data-reveal="3">
          <Link href={routes.houses} className={`${ui.pill} ${ui.outline} ${s.btn}`}>
            EXPLORE THE HOUSES
          </Link>
          <Link href={routes.home} className={`${ui.pill} ${ui.paper} ${s.btn}`}>
            BACK TO HOME
          </Link>
        </div>
      </main>
    </PageShell>
  )
}
