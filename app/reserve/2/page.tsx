import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import ReserveHeader from '@/components/reserve/ReserveHeader'
import ProfileForm from '@/components/reserve/ProfileForm'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import r from '@/components/reserve/reserve.module.css'

export const metadata: Metadata = { title: 'Your profile, Wizardify' }

export default function ReserveStep2() {
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={940}>
      <Nav active="home" />
      <main className={`${layout.container} ${r.main}`}>
        <ReserveHeader step={1} label="YOUR PROFILE" note="About 30 seconds" back={routes.reserve(1)} />
        <h1 className={`${ui.shimmer} ${r.title}`}>TELL US WHO YOU ARE</h1>
        <p className={r.lede}>So your reservation is in your name when the doors reopen.</p>
        <ProfileForm />
      </main>
    </PageShell>
  )
}
