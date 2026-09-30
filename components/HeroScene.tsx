import type { CSSProperties } from 'react'
import { heroFlames, heroOwl, heroRoom } from '@/lib/hero-scene'
import LivingOwl from './LivingOwl'
import s from './HeroScene.module.css'

// The home hero's candles and owl, drawn over hero-room.webp inside its LitImage box, so they stay in
// place at every crop. The room already holds the candles' wax; here the flames sway and glow, and the
// owl (components/LivingOwl) comes to life. Built by scripts/hero.
const W = heroRoom.w
const H = heroRoom.h
const pct = (v: number, of = 100) => `${((v / of) * 100).toFixed(3)}%`

// Repeatable scatter, so each flame keeps its own rhythm between renders
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function Flames() {
  const { src, w: AW, h: AH, flames } = heroFlames
  return flames.map((f, i) => {
    const [ax, ay, aw, ah] = f.atlas
    const flame: CSSProperties = {
      left: pct(f.x, W),
      top: pct(f.y, H),
      width: pct(f.w, W),
      height: pct(f.h, H),
      backgroundImage: `url('${src}')`,
      backgroundSize: `${pct(AW, aw)} ${pct(AH, ah)}`,
      backgroundPosition: `${pct(ax, AW - aw)} ${pct(ay, AH - ah)}`,
      transformOrigin: `50% ${pct(f.base, 1)}`,
      animationDuration: `${(1 + rnd(i, 3) * 0.8).toFixed(2)}s`,
      animationDelay: `-${(rnd(i, 4) * 2).toFixed(2)}s`,
    }
    const d = f.h * 3.4
    const glow: CSSProperties = {
      left: pct(f.x + f.w / 2, W),
      top: pct(f.y + f.h * 0.55, H),
      width: pct(d, W),
      animationDuration: `${(1.8 + rnd(i, 1) * 1.6).toFixed(2)}s`,
      animationDelay: `-${(rnd(i, 2) * 3).toFixed(2)}s`,
    }
    return (
      <span key={i}>
        <span className={s.flame} style={flame} />
        <span className={s.glow} style={glow} />
      </span>
    )
  })
}

export default function HeroScene() {
  return (
    <div className={s.scene} aria-hidden="true">

      {/* Flames first, so the owl stands in front of the candle behind it */}
      <Flames />
      <LivingOwl owl={heroOwl} className={s.owl} style={{ left: pct(heroOwl.x, W), top: pct(heroOwl.y, H), width: pct(heroOwl.w, W), height: pct(heroOwl.h, H) }} />
    </div>
  )
}
