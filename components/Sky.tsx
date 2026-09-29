import LitImage from './LitImage'
import PortraitFrame from './PortraitFrame'
import Sparkles from './Sparkles'
import s from './Sky.module.css'

export default function Sky() {
  return (
    <>
      <LitImage className={s.bg} src="/images/hero-bg.jpg" />
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
