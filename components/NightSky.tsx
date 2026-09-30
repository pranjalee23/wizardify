import LitImage from './LitImage'
import styles from './NightSky.module.css'

let seed = 7
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const pct = (x: number) => `${((x / 1440) * 100).toFixed(3)}%`

// Generated in a fixed order from one seed, so every visit shows the same room
const dust = Array.from({ length: 28 }, () => ({
  x: Number((rnd() * 1440).toFixed(0)),
  y: (500 + rnd() * 450).toFixed(0),
  r: (0.8 + rnd() * 1.6).toFixed(2),
  dur: (6 + rnd() * 6).toFixed(2),
  delay: (rnd() * 10).toFixed(2),
}))

const bokeh = Array.from({ length: 26 }, () => ({
  x: Number((rnd() * 1440).toFixed(0)),
  y: (380 + rnd() * 600).toFixed(0),
  r: (3 + rnd() * 14).toFixed(1),
  blur: (1 + rnd() * 5).toFixed(1),
  dur: (3 + rnd() * 4).toFixed(2),
  delay: (rnd() * 6).toFixed(2),
}))

// A page's backdrop: a candlelit room, either the lit room or the study, with drifting motes of light
type Props = { scene: 'chamber' | 'study' }

export default function NightSky({ scene }: Props) {
  const src = scene === 'study' ? '/images/sky-study.jpg' : '/images/room-lit.webp'

  return (
    <div className={styles.sky}>
      <LitImage className={`${styles.img} ${styles.chamberImg}`} src={src} />
      <div className={styles.chamberShade} />
      <svg className={styles.svg} width="100%" height="1000" aria-hidden="true">
        {bokeh.map((k, i) => (
          <circle
            key={`b${i}`}
            className={styles.tw}
            cx={pct(k.x)}
            cy={k.y}
            r={k.r}
            fill="#FFC46B"
            style={{ filter: `blur(${k.blur}px)`, animationDuration: `${k.dur}s`, animationDelay: `-${k.delay}s` }}
          />
        ))}
        {dust.map((d, i) => (
          <circle
            key={`d${i}`}
            className={styles.float}
            cx={pct(d.x)}
            cy={d.y}
            r={d.r}
            fill="#FFD98A"
            style={{ animationDuration: `${d.dur}s`, animationDelay: `-${d.delay}s` }}
          />
        ))}
      </svg>
    </div>
  )
}
