import styles from './NightSky.module.css'

let seed = 7
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const pct = (x: number) => `${((x / 1440) * 100).toFixed(3)}%`

const stars = Array.from({ length: 260 }, () => {
  const y = Math.pow(rnd(), 1.4) * 760
  return {
    x: Number((rnd() * 1440).toFixed(1)),
    y: y.toFixed(1),
    r: (0.5 + rnd() * 1.3).toFixed(2),
    c: rnd() > 0.85 ? '#FFE9B8' : '#F2F0FF',
    dur: (2 + rnd() * 4).toFixed(2),
    delay: (rnd() * 6).toFixed(2),
  }
})

const glints = Array.from({ length: 16 }, () => {
  const x = rnd() * 1440
  const y = rnd() * 520
  const s = 5 + rnd() * 9
  return {
    x,
    y,
    d: `M0 ${-s} L${s * 0.18} ${-s * 0.18} L${s} 0 L${s * 0.18} ${s * 0.18} L0 ${s} L${-s * 0.18} ${s * 0.18} L${-s} 0 L${-s * 0.18} ${-s * 0.18} Z`,
    dur: (3 + rnd() * 3).toFixed(2),
    delay: (rnd() * 5).toFixed(2),
  }
})

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

type Props = { scene?: 'sky' | 'chamber' | 'study'; castle?: boolean; moon?: boolean }

export default function NightSky({ scene = 'sky', castle = false, moon = true }: Props) {
  const chamber = scene === 'chamber' || scene === 'study'
  const chamberSrc = scene === 'study' ? '/images/sky-study.jpg' : '/images/sky-chamber.jpg'
  const starList = chamber ? [] : castle ? stars.filter((s) => Number(s.y) < 360) : stars
  const showMilky = !chamber && !castle
  const showMoon = !chamber && !castle && moon

  return (
    <div className={styles.sky}>
      {showMilky && <div className={styles.milky} />}
      {showMoon && (
        <>
          <div className={styles.moonGlow} />
          <div className={styles.moon} />
        </>
      )}
      {chamber && (
        <>
          <img className={`${styles.img} ${styles.chamberImg}`} src={chamberSrc} alt="" />
          <div className={styles.chamberShade} />
          <div className={styles.chamberFade} />
        </>
      )}
      {castle && (
        <>
          <img className={`${styles.img} ${styles.castleImg}`} src="/images/sky-castle.jpg" alt="" />
          <div className={styles.castleShade} />
        </>
      )}
      <svg className={styles.svg} width="100%" height="1000" aria-hidden="true">
        {(chamber ? bokeh : []).map((k, i) => (
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
        {starList.map((s, i) => (
          <circle
            key={`s${i}`}
            className={styles.tw}
            cx={pct(s.x)}
            cy={s.y}
            r={s.r}
            fill={s.c}
            style={{ animationDuration: `${s.dur}s`, animationDelay: `-${s.delay}s` }}
          />
        ))}
        {(chamber ? [] : glints).map((g, i) => (
          <svg key={`g${i}`} x={pct(g.x)} y={g.y} width="1" height="1" overflow="visible">
            <path
              className={styles.glint}
              d={g.d}
              fill="#FFF6D8"
              style={{ animationDuration: `${g.dur}s`, animationDelay: `-${g.delay}s` }}
            />
          </svg>
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
      {!chamber && <div className={styles.shoot} />}
    </div>
  )
}
