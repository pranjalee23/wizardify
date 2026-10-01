import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Stepper from '@/components/Stepper'
import Arrow from '@/components/Arrow'
import MagicTiles from '@/components/create/MagicTiles'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import c from '@/components/create/create.module.css'

export const metadata: Metadata = { title: 'Create your portrait, step 2: your magic' }

export default function CreateStep2() {
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1000}>
      <Nav active="create" />
      <Stepper step={2} />
      <main className={`${layout.container} ${c.main} ${c.centered}`}>
        <div className={c.eyebrow} data-reveal="0">
          STEP 2 OF 5
        </div>
        <h1 className={`${ui.shimmer} ${c.title}`} data-reveal="1">
          TELL US ABOUT YOUR MAGIC
        </h1>
        <p className={c.lede} data-reveal="2">
          What would you like to be known for?
        </p>
        <div className={c.block} data-reveal="3">
          <MagicTiles />
        </div>
        <div className={`${c.actions} ${c.actionsMagic}`} data-reveal="4">
          <Link href={routes.create(1)} className={`${ui.pill} ${ui.outline} ${c.back}`}>
            <Arrow dir="left" />
            BACK
          </Link>
          <Link href={routes.create(3)} className={`${ui.pill} ${ui.paper} ${c.next}`}>
            CONTINUE
            <Arrow />
          </Link>
        </div>
      </main>
    </PageShell>
  )
}
