import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import CastleNight, { castleNightArea } from '@/components/CastleNight'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Candle from '@/components/Candle'
import DropForm from '@/components/reserve/DropForm'
import { houseById } from '@/lib/houses'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './drop.module.css'

export const metadata: Metadata = { title: 'The Drop, Wizardify' }

const icon = (children: ReactNode) => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#D9B26A" strokeWidth="1.2" aria-hidden="true">
    {children}
  </svg>
)

const expect = [
  {
    label: 'Early access for reserved members',
    icon: icon(
      <>
        <circle cx="8" cy="12" r="4" />
        <path d="M12 12h9M18 12v3M21 12v2" />
      </>,
    ),
  },
  {
    label: 'A portrait made just for you',
    icon: icon(
      <>
        <rect x="5" y="3" width="14" height="18" />
        <rect x="8" y="6" width="8" height="12" />
      </>,
    ),
  },
  {
    label: 'Every frame finished by hand',
    icon: icon(
      <>
        <path d="M18 3l3 3-9 9-3-3z" />
        <path d="M9 12c-3 0-4 2-4 4s-1 3-2 3c3 1 7 0 8-3" />
      </>,
    ),
  },
  {
    label: '6-month warranty',
    icon: icon(
      <>
        <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" />
        <path d="M8.5 12l2.5 2.5L16 9.5" />
      </>,
    ),
  },
]

type Props = { searchParams: Promise<{ house?: string | string[]; link?: string | string[] }> }

export default async function DropPage({ searchParams }: Props) {
  const { house, link } = await searchParams
  const picked = houseById(typeof house === 'string' ? house : undefined)

  return (
    <PageShell sky={<CastleNight />} skyClassName={castleNightArea} minHeight={1740}>
      <Nav active="home" />
      <section className={`${layout.container} ${s.hero}`}>
        <div className={s.stack}>
          <h1 className={`${ui.shimmer} ${s.title}`} data-reveal="0">
            THE DOORS ARE CLOSED.
          </h1>
          <div className={s.kicker} data-reveal="1">
            FIRST DROP
          </div>
          <div data-reveal="2">
            <div className={s.soldOut}>
              <span className={s.soldOutText}>SOLD OUT</span>
            </div>
          </div>
          <p className={s.copy} data-reveal="3">
            Our first collection of Wizardify portraits has found its way to homes around the world.
          </p>
          <svg width="260" height="24" viewBox="0 0 260 24" aria-hidden="true" className={s.rule}>
            <path d="M0 12 H110 M150 12 H260" stroke="#D9B26A" strokeWidth="1" />
            <path d="M130 0 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" fill="#D9B26A" />
          </svg>
          <h2 className={`${ui.shimmer} ${s.subtitle}`}>THE NEXT CHAPTER BEGINS SOON.</h2>
          <p className={s.invite}>Reserve your place and be the first to know when the doors open again.</p>
          {link === 'expired' && (
            <p className={s.linkNote} role="status">
              That link has expired. Enter your email again and we&apos;ll send you a new one.
            </p>
          )}
          <DropForm house={picked?.id} />
          <p className={s.note}>
            Free. No payment. By reserving, you agree to get drop alerts from Wizardify by email and WhatsApp.{' '}
            <Link href={routes.privacy} className={s.noteLink}>
              Privacy notice
            </Link>
          </p>
        </div>
        <Candle className={s.candle1} scale={0.8} delay={0} />
        <Candle className={s.candle2} scale={0.55} delay={0.8} />
        <Candle className={s.candle3} scale={0.7} delay={0.4} />
        <Candle className={s.candle4} scale={0.45} delay={1.2} />
      </section>

      <section className={`${layout.container} ${s.expect}`}>
        <h2 className={`${ui.shimmer} ${s.expectTitle}`} data-reveal="0">
          WHAT TO EXPECT
        </h2>
        <div className={s.grid}>
          {expect.map((e, i) => (
            <div key={e.label} className={s.card} data-reveal={String(1 + i)}>
              {e.icon}
              <div className={s.cardLabel}>{e.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
