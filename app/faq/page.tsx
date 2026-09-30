import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Candle from '@/components/Candle'
import FaqTabs from '@/components/FaqTabs'
import LivingOwl from '@/components/LivingOwl'
import { galleryOwl } from '@/lib/owls'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './faq.module.css'

export const metadata: Metadata = { title: 'FAQ, Wizardify' }

export default function FaqPage() {
  return (
    <PageShell sky={<NightSky scene="chamber" />} minHeight={1400}>
      <Nav active="faq" />
      <section className={`${layout.container} ${s.section}`}>
        <h1 className={`${ui.shimmer} ${s.title}`} data-reveal="0">
          BEFORE YOU STEP THROUGH...
        </h1>
        <p className={s.lede} data-reveal="1">
          Here are some common questions about your Wizardify portrait and the journey to bring it home.
        </p>
        <FaqTabs />
        <Candle className={s.candleL} scale={0.66} delay={0} />
        <Candle className={s.candleR} scale={0.46} delay={0.8} />
        <LivingOwl owl={galleryOwl} className={s.decoRight} />
      </section>
      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
