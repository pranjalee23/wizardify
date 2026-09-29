import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Stepper from '@/components/Stepper'
import Arrow from '@/components/Arrow'
import Candle from '@/components/Candle'
import HousePicker from '@/components/create/HousePicker'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import c from '@/components/create/create.module.css'
import s from './house.module.css'

export const metadata: Metadata = { title: 'Create your portrait, step 1: your house' }

export default function CreateStep1() {
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1100}>
      <Nav active="create" />
      <Stepper step={1} />
      <main className={`${layout.container} ${s.main}`}>
        <div className={c.eyebrow} data-reveal="0">
          STEP 1 OF 5
        </div>
        <h1 className={`${ui.shimmer} ${c.title}`} data-reveal="1">
          WHICH HOUSE CALLS TO YOU?
        </h1>
        <p className={c.lede} data-reveal="2">
          Every great story begins with a choice.
        </p>
        <div data-reveal="3">
          <HousePicker />
        </div>
        <p className={s.hint}>Choose the house that feels like home. You can always change your mind.</p>
        <Link href={routes.create(2)} className={`${ui.pill} ${ui.paper} ${ui.glow} ${s.next}`}>
          CONTINUE
          <Arrow />
        </Link>
        <Candle className={s.candleL} scale={0.9} delay={0} />
        <Candle className={s.candleR} scale={0.72} delay={0.7} />
      </main>
    </PageShell>
  )
}
