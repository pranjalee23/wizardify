import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Arrow from '@/components/Arrow'
import LivingPicture from '@/components/LivingPicture'
import { houses } from '@/lib/houses'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './houses.module.css'

export const metadata: Metadata = { title: 'The Houses, Wizardify' }

export default function HousesPage() {
  return (
    <PageShell sky={<NightSky scene="chamber" />} minHeight={1880}>
      <Nav active="houses" />
      <section className={`${layout.container} ${s.section}`}>
        <h1 className={`${ui.shimmer} ${s.title}`} data-reveal="0">
          WHERE DO YOU BELONG?
        </h1>
        <p className={s.lede} data-reveal="1">
          Four houses. Endless stories. Yours to live.
        </p>
        <div className={s.grid}>
          {houses.map((h, i) => (
            <article
              key={h.id}
              className={s.card}
              data-reveal={String(1 + i)}
              style={{ borderColor: h.border, background: `radial-gradient(circle at 50% 55%, ${h.core} 0%, #07090F 85%)` }}
            >
              <LivingPicture className={s.cardImg} src={h.video} poster={h.img} alt={h.cardAlt} />
              <div className={s.cardShade} />
              <div className={s.cardText}>
                <h2 className={s.cardName}>{h.name}</h2>
                <p className={s.cardTraits}>{h.traits}</p>
              </div>
              <Link href={routes.house(h.id)} className={`${ui.pill} ${ui.paper} ${s.explore}`}>
                EXPLORE
                <Arrow />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
