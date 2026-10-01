import Link from 'next/link'
import Arrow from './Arrow'
import Framed from './Framed'
import LivingPicture from './LivingPicture'
import PaperBand from './PaperBand'
import { startingPrice } from '@/lib/frames'
import { houses } from '@/lib/houses'
import { routes } from '@/lib/routes'
import layout from './layout.module.css'
import ui from './ui.module.css'
import s from './HomeHouses.module.css'

export default function HomeHouses() {
  return (
    <section className={s.section}>
      <PaperBand />
      <div className={`${layout.container} ${s.pricing}`} data-reveal="0">
        <Link href={routes.pricing} className={s.pill}>
          <span className={s.pillPrice}>From {startingPrice}</span>
          <span className={s.pillRule} aria-hidden="true" />
          <span>Tabletop and wall sizes · Antique gold or modern black</span>
          <span className={s.pillCta}>
            See pricing
            <Arrow />
          </span>
        </Link>
      </div>
      <div className={`${layout.container} ${s.inner}`}>
        <h2 className={`${ui.shimmer} ${s.title}`} data-reveal="0">
          YOUR STORY. YOUR HOUSE. YOUR PORTRAIT.
        </h2>
        <p className={s.lede} data-reveal="1">
          What if your story didn't end when you left the castle?
        </p>
        <div className={s.grid}>
          {houses.map((h, i) => (
            <Link key={h.id} href={routes.house(h.id)} className={s.card} data-reveal={String(1 + i)}>
              <Framed width={270} delay={i * 1.7}>
                <LivingPicture src={h.video} poster={h.img} alt={h.alt} />
              </Framed>
              <div className={s.name}>{h.name}</div>
              <div className={s.motto}>{h.motto}</div>
            </Link>
          ))}
        </div>
        <Link href={routes.houses} className={`${ui.paperBtn} ${s.cta}`} data-reveal="5">
          DISCOVER YOUR HOUSE
          <Arrow />
        </Link>
      </div>
    </section>
  )
}
