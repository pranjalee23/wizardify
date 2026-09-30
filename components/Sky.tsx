import HeroScene from './HeroScene'
import LitImage from './LitImage'
import PortraitFrame from './PortraitFrame'
import { heroRoom } from '@/lib/hero-scene'
import Sparkles from './Sparkles'
import s from './Sky.module.css'

export default function Sky() {
  return (
    <>
      <LitImage className={s.bg} src={heroRoom.src} ratio={heroRoom.w / heroRoom.h}>
        <HeroScene />
      </LitImage>
      <div className={s.shade} />
      <div className={s.fade} />
      <div className={s.inner}>
        <div className={s.portrait}>
          <PortraitFrame width={400} height={536} />
        </div>
      </div>
      <div className={s.sparkles}>
        <Sparkles />
      </div>
    </>
  )
}
