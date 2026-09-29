import Link from 'next/link'
import LivingPicture from './LivingPicture'
import { routes } from '@/lib/routes'
import layout from './layout.module.css'
import ui from './ui.module.css'
import s from './HomeMagic.module.css'

export default function HomeMagic() {
  return (
    <section className={s.section}>
      <LivingPicture
        className={s.room}
        src="/videos/footer-main.mp4"
        poster="/images/room.jpg"
        alt="A cosy candlelit living room wall hung with gold-framed moving portraits"
      />
      <div className={s.shade} />
      <div className={`${layout.container} ${s.inner}`}>
        <div className={s.copy} data-reveal="0">
          <h2 className={`${ui.shimmer} ${s.title}`}>A LITTLE MAGIC FOR YOUR HOME.</h2>
          <p className={s.lede}>
            Bring home a portrait that moves, looks like it belongs in a world of magic, and is uniquely yours.
          </p>
          <Link href={routes.frame} className={`${ui.outlineBtn} ${s.cta}`}>
            MEET THE FRAME
          </Link>
        </div>
      </div>
    </section>
  )
}
