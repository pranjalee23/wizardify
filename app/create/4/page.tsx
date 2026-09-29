import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Stepper from '@/components/Stepper'
import Arrow from '@/components/Arrow'
import PhotoUpload from '@/components/create/PhotoUpload'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import c from '@/components/create/create.module.css'

export const metadata: Metadata = { title: 'Create your portrait, step 4: photos' }

export default function CreateStep4() {
  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1060}>
      <Nav active="create" />
      <Stepper step={4} />
      <main className={`${layout.container} ${c.main}`}>
        <div className={c.eyebrow} data-reveal="0">
          STEP 4 OF 5
        </div>
        <h1 className={`${ui.shimmer} ${c.title} ${c.center}`} data-reveal="1">
          LET'S PUT YOU IN THE FRAME.
        </h1>
        <p className={`${c.lede} ${c.center}`} data-reveal="2">
          Upload a few photos of yourself. We'll use them to create your personalised moving portrait.
        </p>
        <div className={c.block} data-reveal="3">
          <PhotoUpload />
        </div>
        <div className={`${c.actions} ${c.actionsPhotos}`} data-reveal="4">
          <Link href={routes.create(3)} className={`${ui.pill} ${ui.outline} ${c.back}`}>
            <Arrow dir="left" />
            BACK
          </Link>
          <Link href={routes.create(5)} className={`${ui.pill} ${ui.paper} ${ui.glow} ${c.next}`}>
            CONTINUE
            <Arrow />
          </Link>
        </div>
      </main>
    </PageShell>
  )
}
