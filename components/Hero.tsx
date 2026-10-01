import Link from 'next/link'
import Arrow from './Arrow'
import PortraitFrame from './PortraitFrame'
import { routes } from '@/lib/routes'
import layout from './layout.module.css'
import ui from './ui.module.css'
import s from './Hero.module.css'

export default function Hero() {
  return (
    <section aria-label="Welcome" className={`${layout.container} ${s.section}`}>
      <div className={s.copy}>
        <div className={s.eyebrow} data-reveal="0">
          LIVING PORTRAITS
        </div>
        <h1 className={`${ui.shimmer} ${s.title}`} data-reveal="1">
          PICTURES WERE NEVER MEANT TO STAY STILL.
        </h1>
        <p className={s.lede} data-reveal="2">
          Step into your own magical portrait.
        </p>
        <div className={s.actions} data-reveal="3">
          <Link href={routes.drop} className={`${ui.paperBtn}`}>
            RESERVE YOUR PORTRAIT
            <Arrow />
          </Link>
          <Link href={routes.gallery} className={ui.outlineBtn}>
            SEE THE MAGIC
          </Link>
        </div>
      </div>
      <div className={s.portrait} data-reveal="4">
        <PortraitFrame width={400} height={536} />
      </div>
    </section>
  )
}
