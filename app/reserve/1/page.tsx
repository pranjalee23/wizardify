import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Check from '@/components/Check'
import { ConfirmationEmail } from '@/components/reserve/Certificate'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './reserve.module.css'

export const metadata: Metadata = { title: 'Your place is held' }

const perks = ['Your reservation in your name', 'Your details saved for a faster order', 'An official reservation number']

export default function ReserveStep1() {
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={920}>
      <Nav active="home" />
      <main className={`${layout.container} ${s.main}`}>
        <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true" data-reveal="0">
          <path className={s.spark} d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#D9B26A" />
        </svg>
        <h1 className={`${ui.shimmer} ${s.title}`} data-reveal="1">
          YOUR PLACE IS HELD.
        </h1>
        <p className={s.lede} data-reveal="2">
          We've added <ConfirmationEmail fallback="you" /> to the list.
        </p>
        <div className={`${ui.paperCard} ${s.card}`} data-reveal="3">
          <h2 className={s.cardTitle}>SECURE YOUR PLACE IN LINE</h2>
          <p className={s.cardText}>Complete your profile so everything is ready the moment the doors reopen.</p>
          <div className={s.perks}>
            {perks.map((p) => (
              <div key={p} className={s.perk}>
                <Check size={20} />
                {p}
              </div>
            ))}
          </div>
          <Link href={routes.reserve(2)} className={`${ui.pill} ${ui.dark} ${s.cta}`}>
            COMPLETE MY PROFILE
            <span className={s.time}>30 sec</span>
          </Link>
          <Link href={routes.reserve(5)} className={s.later}>
            Maybe later
          </Link>
        </div>
      </main>
    </PageShell>
  )
}
