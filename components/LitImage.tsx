import type { CSSProperties, ReactNode } from 'react'
import { imageFlames } from '@/lib/flames'
import s from './LitImage.module.css'

type Props = { src: string; className?: string; bleed?: boolean; children?: ReactNode }

// A decorative photograph whose candle flames flicker. It fills its box the way object-fit: cover does
// (set --ox and --oy in the className, 0 to 1, for object-position), but as a real box the size of the
// cropped image, so the flames can be placed on it in the image's own proportions. An uncropped image
// can `bleed`, letting the glow spread past its edges. Children are drawn over the image in the same box,
// for other things in the photo brought to life.
export default function LitImage({ src, className, bleed = false, children }: Props) {
  const lit = imageFlames[src]
  const ratio = lit ? lit.w / lit.h : undefined
  const classes = [s.cover, bleed && s.bleed, className].filter(Boolean).join(' ')
  return (
    <div className={classes} style={ratio ? ({ '--ar': ratio } as CSSProperties) : undefined}>
      <div className={s.box}>
        <img className={s.img} src={src} alt="" />
        {lit && <Flicker src={src} />}
        {children}
      </div>
    </div>
  )
}

// Repeatable scatter, so every flame keeps its own rhythm between renders
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}
const pct = (v: number) => `${v.toFixed(3)}%`

function Flicker({ src }: { src: string }) {
  const { w: W, h: H, flames } = imageFlames[src]
  return (
    <div className={s.layer} aria-hidden="true">
      {flames.map(([cx, cy, size], i) => {
        // A warm glow that breathes around the flame
        const d = size * 3.2
        const glow = {
          left: pct((cx / W) * 100),
          top: pct((cy / H) * 100),
          width: pct((d / W) * 100),
          animationDuration: `${(1.7 + rnd(i, 1) * 1.6).toFixed(2)}s`,
          animationDelay: `-${(rnd(i, 2) * 3).toFixed(2)}s`,
        }
        // The flame itself, lifted from the photo and set swaying from its base. The patch is kept just
        // wider than the flame, so the wall behind stays still. Tiny flames only glow.
        let flame: CSSProperties | null = null
        if (size >= 12) {
          const bw = size * 0.44, bh = size * 1.5
          const left = cx - bw / 2, top = cy + size * 0.62 - bh
          flame = {
            left: pct((left / W) * 100),
            top: pct((top / H) * 100),
            width: pct((bw / W) * 100),
            height: pct((bh / H) * 100),
            backgroundImage: `url('${src}')`,
            backgroundSize: `${pct((W / bw) * 100)} ${pct((H / bh) * 100)}`,
            backgroundPosition: `${pct((left / (W - bw)) * 100)} ${pct((top / (H - bh)) * 100)}`,
            transformOrigin: `50% ${pct(((cy + size * 0.5 - top) / bh) * 100)}`,
            animationDuration: `${(0.9 + rnd(i, 3) * 0.7).toFixed(2)}s`,
            animationDelay: `-${(rnd(i, 4) * 2).toFixed(2)}s`,
          }
        }
        return (
          <span key={i}>
            {flame && <span className={s.flame} style={flame} />}
            <span className={s.glow} style={glow} />
          </span>
        )
      })}
    </div>
  )
}
