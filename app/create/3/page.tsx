import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Stepper from '@/components/Stepper'
import Arrow from '@/components/Arrow'
import LifeGroups from '@/components/create/LifeGroups'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import c from '@/components/create/create.module.css'

export const metadata: Metadata = { title: 'Create your portrait, step 3: magical life' }

export default function CreateStep3() {
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1100}>
      <Nav active="create" />
      <Stepper step={3} />
      <main className={`${layout.container} ${c.main} ${c.centered}`}>
        <div className={c.eyebrow} data-reveal="0">
          STEP 3 OF 5
        </div>
        <h1 className={`${ui.shimmer} ${c.title}`} data-reveal="1">
          YOUR MAGICAL LIFE
        </h1>
        <p className={c.lede} data-reveal="2">
          A few details to set the scene of your portrait.
        </p>
        <div className={c.block} data-reveal="3">
          <LifeGroups />
        </div>
        <div className={`${c.actions} ${c.actionsLife}`} data-reveal="4">
          <Link href={routes.create(2)} className={`${ui.pill} ${ui.outline} ${c.back}`}>
            <Arrow dir="left" />
            BACK
          </Link>
          <Link href={routes.create(4)} className={`${ui.pill} ${ui.paper} ${ui.glow} ${c.next}`}>
            CONTINUE
            <Arrow />
          </Link>
        </div>
      </main>
    </PageShell>
  )
}
