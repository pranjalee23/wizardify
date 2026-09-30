import type { CSSProperties } from 'react'
import s from './HeroOwl.module.css'

// The snowy owl in the home hero's photo (hero-bg.jpg, 1672 x 941): it blinks now and then, and ruffles
// its wing. Drawn inside that photo's LitImage box, so these positions, in the photo's own pixels,
// hold at every crop.
const W = 1672
const H = 941
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`

// Each eyelid is made of the photo's own feathers from just below that eye (from sx, sy), so it matches
// the face around it, lit or in shadow.
const eyes = [
  { x: 1463, y: 346, w: 27, h: 20, sx: 1450, sy: 357 },
  { x: 1504, y: 344, w: 28, h: 20, sx: 1490, sy: 355 },
]

// The wing is lifted from the photo, masked to a hand-traced outline just inside its edge
// (scripts/owl/build.mjs), and turns a fraction of a degree about the shoulder.
const wing = { x: 1478, y: 372, w: 190, h: 256, pivotX: 1530, pivotY: 400 }

export default function HeroOwl() {
  const wingStyle: CSSProperties = {
    left: pct(wing.x, W),
    top: pct(wing.y, H),
    width: pct(wing.w, W),
    height: pct(wing.h, H),
    backgroundSize: `${pct(W, wing.w)} ${pct(H, wing.h)}`,
    backgroundPosition: `${pct(wing.x, W - wing.w)} ${pct(wing.y, H - wing.h)}`,
    transformOrigin: `${pct(wing.pivotX - wing.x, wing.w)} ${pct(wing.pivotY - wing.y, wing.h)}`,
  }
  return (
    <div className={s.owl} aria-hidden="true">
      <span className={s.wing} style={wingStyle} />
      {eyes.map((e) => (
        <span
          key={e.x}
          className={s.eye}
          style={{ left: pct(e.x, W), top: pct(e.y, H), width: pct(e.w, W), height: pct(e.h, H) }}
        >
          <span
            className={s.lid}
            style={{
              backgroundSize: `100% 100%, ${pct(W, e.w)} ${pct(H, e.h)}`,
              backgroundPosition: `0 0, ${pct(e.sx, W - e.w)} ${pct(e.sy, H - e.h)}`,
            }}
          />
        </span>
      ))}
    </div>
  )
}
