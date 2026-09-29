import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PortraitFrame from '@/components/PortraitFrame'
import Framed from '@/components/Framed'
import Candle from '@/components/Candle'
import Crest from '@/components/Crest'
import Arrow from '@/components/Arrow'
import { examplePortraits, houseById, houses } from '@/lib/houses'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './house.module.css'

type Params = { params: Promise<{ house: string }> }

export function generateStaticParams() {
  return houses.map((h) => ({ house: h.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { house } = await params
  const h = houseById(house)
  return { title: h ? `${h.title} house, Wizardify` : 'Wizardify' }
}

export default async function HousePage({ params }: Params) {
  const { house } = await params
  const h = houseById(house)
  if (!h) notFound()

  return (
    <PageShell sky={<NightSky scene="chamber" />} minHeight={1760}>
      <Nav active="houses" />

      <section className={`${layout.band} ${s.hero}`}>
        <img className={s.heroBg} src={h.img} alt="" />
        <div className={s.heroShade} />
        <div className={`${layout.container} ${s.heroInner}`}>
          <div className={s.copy}>
            <Link href={routes.houses} className={s.back} data-reveal="0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Back to Houses
            </Link>
            <div className={s.titleRow} data-reveal="1">
              <Crest house={h.id} scale={0.5} />
              <h1 className={`${ui.shimmer} ${s.title}`}>{h.name}</h1>
            </div>
            <p className={s.tagline} data-reveal="2">
              {h.traits}
            </p>
            <p className={s.desc} data-reveal="3">
              {h.description}
            </p>
          </div>
          <div className={s.stage} data-reveal="1">
            <img className={s.owl} src="/images/deco-house.png" alt="" />
            <PortraitFrame width={400} height={536} />
            <Candle className={s.candleL} scale={0.62} delay={0} />
            <Candle className={s.candleR} scale={0.5} delay={0.8} />
          </div>
        </div>
      </section>

      <section className={`${layout.container} ${s.examples}`}>
        <h2 className={s.examplesTitle} data-reveal="0">
          EXAMPLE PORTRAITS
        </h2>
        <div className={s.exGrid}>
          {examplePortraits.map((p, i) => (
            <figure key={p.src} className={s.exFig} data-reveal={String(1 + i)}>
              <Framed width={236} delay={i * 1.4}>
                <img className={ui.top} src={p.src} alt={p.alt} />
              </Framed>
            </figure>
          ))}
        </div>
        <Link href={`${routes.drop}?house=${h.id}`} className={`${ui.pill} ${ui.paper} ${ui.glow} ${s.cta}`} data-reveal="6">
          RESERVE MY {h.name} PORTRAIT
          <Arrow />
        </Link>
      </section>

      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
