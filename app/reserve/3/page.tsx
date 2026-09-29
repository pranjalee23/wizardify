import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import ReserveHeader from '@/components/reserve/ReserveHeader'
import PreferencesForm from '@/components/reserve/PreferencesForm'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import r from '@/components/reserve/reserve.module.css'
import s from './preferences.module.css'

export const metadata: Metadata = { title: 'Portrait preferences, Wizardify' }

export default function ReserveStep3() {
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1240}>
      <Nav active="home" />
      <main className={`${layout.container} ${r.main}`}>
        <ReserveHeader step={2} label="PORTRAIT PREFERENCES" note="Optional" back={routes.reserve(2)} wide />
        <h1 className={`${ui.shimmer} ${r.title}`}>BE FIRST IN LINE</h1>
        <div className={s.note}>
          <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true" className={s.star}>
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#8A6526" />
          </svg>
          <p className={s.noteText}>
            Members whose portrait preferences are on record will be the first to receive their portraits when the doors reopen.
          </p>
        </div>
        <PreferencesForm />
      </main>
    </PageShell>
  )
}
