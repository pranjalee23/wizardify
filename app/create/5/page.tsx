import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Stepper from '@/components/Stepper'
import Arrow from '@/components/Arrow'
import Crest from '@/components/Crest'
import Candle from '@/components/Candle'
import PortraitFrame from '@/components/PortraitFrame'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import c from '@/components/create/create.module.css'
import s from './preview.module.css'

export const metadata: Metadata = { title: 'Create your portrait, step 5: preview' }

const icon = (children: ReactNode) => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D9B26A" strokeWidth="1.3" aria-hidden="true">
    {children}
  </svg>
)

const summary = [
  { label: 'ROLE', value: 'Charms Student', icon: icon(<path d="M12 2l2 7 7 3-7 3-2 7-2-7-7-3 7-3z" />) },
  {
    label: 'SKYBALL',
    value: 'Not a flyer',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M5 12h14M12 5c2 2 3 4.5 3 7s-1 5-3 7M12 5c-2 2-3 4.5-3 7s1 5 3 7" />
      </>,
    ),
  },
  {
    label: 'COMPANION',
    value: 'Owl',
    icon: icon(
      <>
        <path d="M6 6l3 3M18 6l-3 3M6 10c0-3 3-5 6-5s6 2 6 5v5c0 3-3 5-6 5s-6-2-6-5z" />
        <circle cx="9.5" cy="11" r="1.5" />
        <circle cx="14.5" cy="11" r="1.5" />
        <path d="M11 15l1 1 1-1" />
      </>,
    ),
  },
  { label: 'SETTING', value: 'Castle at sunset', icon: icon(<path d="M3 21h18M5 21V10l2-2 2 2v11M15 21V8l2-3 2 3v13M9 21v-6h6v6" />) },
]

export default function CreateStep5() {
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1320}>
      <Nav active="create" />
      <Stepper step={5} />
      <main className={`${layout.container} ${c.main}`}>
        <div className={c.eyebrow} data-reveal="0">
          STEP 5 OF 5
        </div>
        <h1 className={`${ui.shimmer} ${c.title} ${c.center}`} data-reveal="1">
          YOUR PORTRAIT IS READY.
        </h1>
        <p className={`${c.lede} ${c.center}`} data-reveal="2">
          Here's a preview of your personalised moving portrait. Make any changes or proceed to order.
        </p>
        <div className={s.layout}>
          <dl className={s.summary} data-reveal="3">
            <div className={s.row}>
              <Crest house="nightbloom" scale={0.275} />
              <div>
                <dt className={s.dt}>HOUSE</dt>
                <dd className={s.dd}>Nightbloom</dd>
              </div>
            </div>
            {summary.map((item) => (
              <div key={item.label} className={s.row}>
                {item.icon}
                <div>
                  <dt className={s.dt}>{item.label}</dt>
                  <dd className={s.dd}>{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className={s.stage} data-reveal="2">
            <PortraitFrame width={400} height={536} className={s.portrait}>
              <button type="button" className={s.play} aria-label="Play preview">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5l12 7-12 7z" />
                </svg>
              </button>
            </PortraitFrame>
            <Candle className={s.candleL} scale={0.6} delay={0.2} />
            <Candle className={s.candleR} scale={0.48} delay={0.9} />
          </div>
        </div>
        <div className={`${c.actions} ${c.actionsPreview}`} data-reveal="4">
          <Link href={routes.create(1)} className={`${ui.pill} ${ui.outline} ${c.back}`}>
            <Arrow dir="left" />
            MAKE CHANGES
          </Link>
          <Link href={routes.frame} className={`${ui.pill} ${ui.paper} ${c.next}`}>
            PROCEED TO ORDER
            <Arrow />
          </Link>
        </div>
      </main>
    </PageShell>
  )
}
