import type { CSSProperties } from 'react'
import LitImage from './LitImage'
import s from './CastleNight.module.css'

// A castle under the night sky, as a page's background, with its own sky brought to life: the moon
// glows, the Milky Way shimmers, stars twinkle, sparkles glitter and shooting stars streak across.
// Everything is placed on the photograph itself, so it stays put however the photograph is cropped.
//
// The photograph fills its box like object-fit: cover: give PageShell `castleNightArea` as its
// skyClassName. A black gradient darkens the photograph, the moon and the Milky Way for reading,
// while the stars and shooting stars shine above it. A page can adjust the gradient (`shade`).

type Point = [number, number]
type NightScene = {
  src: string
  w: number
  h: number
  moon: Point
  // centre, then width and height as % of the photograph, then angle
  milky: [number, number, number, number, number]
  // how far down the photograph (in %) its sky reaches, for the stars
  skyTo: number
}

// designs/backgrounds/castle-night.png: the castle on the right, the moon on the left
const castleNight: NightScene = {
  src: '/images/castle-night.webp',
  w: 2048,
  h: 768,
  moon: [427, 200],
  milky: [1150, 210, 34, 26, 32],
  skyTo: 38,
}

export const castleNightArea = s.area

const vars = (o: Record<string, unknown>) => o as CSSProperties

// Repeatable scatter, so the sky is the same on every visit; y is a share of the scene's sky
let seed = 11
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const spark = (r: number) =>
  `M0 ${-r} L${r * 0.16} ${-r * 0.16} L${r} 0 L${r * 0.16} ${r * 0.16} L0 ${r} L${-r * 0.16} ${r * 0.16} L${-r} 0 L${-r * 0.16} ${-r * 0.16} Z`

// Stars that twinkle all over the sky, a few of them warm
const stars = Array.from({ length: 180 }, () => ({
  x: (rnd() * 100).toFixed(2),
  y: Math.pow(rnd(), 1.15),
  r: (0.4 + rnd() * 1).toFixed(2),
  warm: rnd() > 0.85,
  dur: (1.8 + rnd() * 4).toFixed(2),
  delay: (rnd() * 6).toFixed(2),
}))
// Glittering stars: four-point sparkles in a soft glow that flash bright now and then
const glitters = Array.from({ length: 22 }, () => ({
  x: (3 + rnd() * 94).toFixed(2),
  y: 0.04 + rnd() * 0.9,
  r: 3 + rnd() * 6,
  dur: (4 + rnd() * 6).toFixed(2),
  delay: (rnd() * 10).toFixed(2),
}))
// Shooting stars, all falling from the upper right towards the lower left, one at a time: where
// each starts (photograph pixels), its angle (180 is straight left, so ~155 falls left and down),
// how far it travels (in its own lengths), its length (% of the photograph's width), and its cycle
// and offset in seconds. They start in the middle of the sky, which every crop shows, and keep clear
// of the two painted into the photograph.
const meteors: { at: Point; angle: number; travel: number; len: number; dur: number; delay: number }[] = [
  { at: [1300, 30], angle: 152, travel: 380, len: 6, dur: 10, delay: 1 },
  { at: [1150, 80], angle: 158, travel: 340, len: 5, dur: 14, delay: 6 },
  { at: [1380, 110], angle: 148, travel: 300, len: 4, dur: 17, delay: 11 },
  { at: [1000, 20], angle: 155, travel: 360, len: 5, dur: 12, delay: 3.5 },
  { at: [1240, 150], angle: 154, travel: 320, len: 4, dur: 15, delay: 9 },
  { at: [1450, 55], angle: 150, travel: 400, len: 5, dur: 19, delay: 15 },
]

type Props = { shade?: string }

export default function CastleNight({ shade }: Props) {
  const scene = castleNight
  const { w: W, h: H } = scene
  const at = ([x, y]: Point) => ({ left: `${((x / W) * 100).toFixed(2)}%`, top: `${((y / H) * 100).toFixed(2)}%` }) as CSSProperties
  const [mx, my, mw, mh, mdeg] = scene.milky
  return (
    <div className={s.scene} aria-hidden="true">
      <LitImage className={`${s.cover} ${s.photo}`} src={scene.src} ratio={W / H}>
        <div className={s.alive}>
          <div className={s.milky} style={{ ...at([mx, my]), width: `${mw}%`, height: `${mh}%`, rotate: `${mdeg}deg` }} />
          <div className={s.moon} style={at(scene.moon)} />
        </div>
        <div className={shade ? `${s.shade} ${shade}` : s.shade} />
        <div className={s.alive}>
          <svg className={s.stars} width="100%" height="100%">
            <defs>
              <radialGradient id="cn-glow">
                <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.55" />
                <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
              </radialGradient>
            </defs>
            {stars.map((st, i) => (
              <circle
                key={i}
                className={s.twinkle}
                cx={`${st.x}%`}
                cy={`${(st.y * scene.skyTo).toFixed(2)}%`}
                r={st.r}
                fill={st.warm ? '#FFE9B8' : '#F2F0FF'}
                style={{ animationDuration: `${st.dur}s`, animationDelay: `-${st.delay}s` }}
              />
            ))}
            {glitters.map((g, i) => (
              <svg key={`g${i}`} x={`${g.x}%`} y={`${(g.y * scene.skyTo).toFixed(2)}%`} width="1" height="1" overflow="visible">
                <g className={s.glitter} style={{ animationDuration: `${g.dur}s`, animationDelay: `-${g.delay}s` }}>
                  <circle r={g.r * 2.2} fill="url(#cn-glow)" />
                  <path d={spark(g.r)} fill="#FFF8E2" />
                </g>
              </svg>
            ))}
          </svg>
          {meteors.map((m, i) => (
            <div
              key={i}
              className={s.meteor}
              style={vars({
                ...at(m.at),
                width: `${m.len}%`,
                '--angle': `${m.angle}deg`,
                '--travel': `${m.travel}%`,
                animationDuration: `${m.dur}s`,
                animationDelay: `-${m.delay}s`,
              })}
            />
          ))}
        </div>
      </LitImage>
    </div>
  )
}
