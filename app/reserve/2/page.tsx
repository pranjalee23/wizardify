import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import ReserveHeader from '@/components/reserve/ReserveHeader'
import PreferencesForm from '@/components/reserve/PreferencesForm'
import { houseById } from '@/lib/houses'
import { routes } from '@/lib/routes'
import { requireReservation } from '@/lib/server/reservations'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import r from '@/components/reserve/reserve.module.css'
import s from './preferences.module.css'

export const metadata: Metadata = { title: 'Portrait preferences, Wizardify' }

export default async function ReserveStep2() {
  const reservation = await requireReservation()
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1240}>
      <Nav active="home" />
      <main className={`${layout.container} ${r.main}`}>
        <ReserveHeader step={1} label="PORTRAIT PREFERENCES" note="Optional" back={routes.reserve(1)} wide />
        <h1 className={`${ui.shimmer} ${r.title}`}>BE FIRST IN LINE</h1>
        <div className={s.note}>
          <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true" className={s.star}>
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#8A6526" />
          </svg>
          <p className={s.noteText}>
            Members who complete all six portrait preferences will be the first to receive their portraits when the doors reopen.
          </p>
        </div>
        <PreferencesForm
          house={houseById(reservation.house ?? undefined)?.id ?? null}
          knownFor={reservation.known_for}
          role={reservation.role}
          skyball={reservation.skyball}
          companion={reservation.companion}
          setting={reservation.setting}
        />
      </main>
    </PageShell>
  )
}
