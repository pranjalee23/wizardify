import styles from './Sparkles.module.css'

let seed = 42
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const pct = (x: number) => `${((x / 1440) * 100).toFixed(3)}%`

const bokeh = Array.from({ length: 18 }, () => ({
  x: Number((rnd() * 1440).toFixed(0)),
  y: (420 + rnd() * 460).toFixed(0),
  r: (4 + rnd() * 14).toFixed(1),
  blur: (2 + rnd() * 5).toFixed(1),
  dur: (3 + rnd() * 4).toFixed(1),
  delay: (rnd() * 6).toFixed(1),
}))

const dust = Array.from({ length: 40 }, () => ({
  x: Number((rnd() * 1440).toFixed(0)),
  y: (380 + rnd() * 520).toFixed(0),
  r: (0.7 + rnd() * 1.6).toFixed(2),
  dur: (6 + rnd() * 7).toFixed(1),
  delay: (rnd() * 12).toFixed(1),
}))

const spots: [number, number][] = [
  [1270, 150], [1330, 230], [1300, 330], [1360, 180], [760, 120], [1150, 150],
  [940, 90], [700, 420], [1190, 500], [560, 300], [1250, 420], [880, 60],
]

const glints = spots.map(([x, y]) => {
  const s = 4 + rnd() * 7
  return {
    x,
    y,
    d: `M0 ${-s} L${s * 0.18} ${-s * 0.18} L${s} 0 L${s * 0.18} ${s * 0.18} L0 ${s} L${-s * 0.18} ${s * 0.18} L${-s} 0 L${-s * 0.18} ${-s * 0.18} Z`,
    dur: (2.5 + rnd() * 3).toFixed(1),
    delay: (rnd() * 5).toFixed(1),
  }
})

export default function Sparkles() {
  return (
    <div className={styles.layer}>
      <svg width="100%" height="948" aria-hidden="true" className={styles.svg}>
        {bokeh.map((k, i) => (
          <circle
            key={`b${i}`}
            className={styles.pulse}
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
            fill="#FFE2A0"
            style={{ animationDuration: `${d.dur}s`, animationDelay: `-${d.delay}s` }}
          />
        ))}
        {glints.map((g, i) => (
          <svg key={`g${i}`} x={pct(g.x)} y={g.y} width="1" height="1" overflow="visible">
            <path
              className={styles.tw}
              d={g.d}
              fill="#FFF6D8"
              style={{ animationDuration: `${g.dur}s`, animationDelay: `-${g.delay}s` }}
            />
          </svg>
        ))}
      </svg>
    </div>
  )
}
