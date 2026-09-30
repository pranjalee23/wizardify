import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import ReserveHeader from '@/components/reserve/ReserveHeader'
import WishesForm from '@/components/reserve/WishesForm'
import { routes } from '@/lib/routes'
import { requireReservation } from '@/lib/server/reservations'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import r from '@/components/reserve/reserve.module.css'

export const metadata: Metadata = { title: 'Photos and wishes, Wizardify' }

export default async function ReserveStep4() {
  const reservation = await requireReservation()
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1200}>
      <Nav active="home" />
      <main className={`${layout.container} ${r.main}`}>
        <ReserveHeader step={3} label="PHOTOS AND WISHES" note="Both optional" back={routes.reserve(3)} wide />
        <h1 className={`${ui.shimmer} ${r.title}`}>ALMOST THERE</h1>
        <WishesForm wish={reservation.wish} photos={reservation.photos} />
      </main>
    </PageShell>
  )
}
