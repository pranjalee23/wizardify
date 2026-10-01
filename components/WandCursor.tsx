'use client'

import { useEffect, useRef } from 'react'
import s from './WandCursor.module.css'

// Over things you can click, or that animate on hover (marked data-wand), the tip's glow softens and
// sheds a few sparkles, and the thing itself glows gold from behind.
const TARGETS = [
  'a[href]',
  'button:not(:disabled)',
  'label',
  'input:not([type="hidden"]):not(:disabled)',
  'select',
  'textarea',
  'summary',
  '[role="button"]',
  '[role="tab"]',
  '[role="radio"]',
  '[data-wand]',
].join(', ')

// That glow: a thin dark edge keeps text crisp against it, then a gold halo. The header's menu links
// (data-wand-halo="full") get the full halo; everything else a softer one, under half as strong.
const HALO = 'drop-shadow(0 0 1.5px rgba(12, 8, 2, 0.85)) drop-shadow(0 0 3px rgba(255, 200, 110, 0.45)) drop-shadow(0 0 9px rgba(255, 190, 90, 0.55))'
const SOFT_HALO = 'drop-shadow(0 0 1.5px rgba(12, 8, 2, 0.85)) drop-shadow(0 0 3px rgba(255, 200, 110, 0.2)) drop-shadow(0 0 6px rgba(255, 190, 90, 0.24))'
const NO_HALO = 'drop-shadow(0 0 0 rgba(12, 8, 2, 0)) drop-shadow(0 0 0 rgba(255, 200, 110, 0)) drop-shadow(0 0 0 rgba(255, 190, 90, 0))'

// A short streak of gold that follows the wand tip and draws back into it when the wand stops,
// shedding a few flecks of gold dust that glint as they fade. It only draws while there's something
// to draw, so a still wand costs nothing.
function goldTrail(canvas: HTMLCanvasElement) {
  const g = canvas.getContext('2d')
  if (!g) return null
  const LIFE = 220 // how long each point of the streak lasts, in ms
  const LONGEST = 110 // px
  const WIDTH = 3 // at the tip, px
  let pts: { x: number; y: number; t: number }[] = []
  let dust: { x: number; y: number; t: number; life: number; r: number; phase: number }[] = []
  let raf = 0
  let dpr = 1
  let toDust = 0

  const fit = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(canvas.clientWidth * dpr)
    canvas.height = Math.round(canvas.clientHeight * dpr)
  }

  const streak = (now: number) => {
    // The newest stretch of the path, up to LONGEST
    let from = pts.length - 1
    for (let len = 0; from > 0; from--) {
      len += Math.hypot(pts[from].x - pts[from - 1].x, pts[from].y - pts[from - 1].y)
      if (len > LONGEST) break
    }
    const path = pts.slice(from)
    const n = path.length
    const tail = path[0]
    const head = path[n - 1]
    if (n < 2 || Math.hypot(head.x - tail.x, head.y - tail.y) < 1) return
    // It tapers to nothing at the tail, and thins as the wand comes to rest
    const rest = Math.min(1, 1 - (now - head.t) / LIFE)
    const edge = path.map((p, i) => {
      const a = path[Math.max(0, i - 1)]
      const b = path[Math.min(n - 1, i + 1)]
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1
      const w = (WIDTH / 2) * Math.pow(i / (n - 1), 0.9) * rest
      return [((a.y - b.y) / d) * w, ((b.x - a.x) / d) * w]
    })
    g.beginPath()
    path.forEach((p, i) => g.lineTo(p.x + edge[i][0], p.y + edge[i][1]))
    for (let i = n - 1; i >= 0; i--) g.lineTo(path[i].x - edge[i][0], path[i].y - edge[i][1])
    g.closePath()
    const fill = g.createLinearGradient(tail.x, tail.y, head.x, head.y)
    fill.addColorStop(0, 'rgba(255, 200, 110, 0)')
    fill.addColorStop(0.5, 'rgba(255, 214, 140, 0.7)')
    fill.addColorStop(1, 'rgba(255, 244, 214, 0.95)')
    g.globalAlpha = Math.sqrt(Math.max(0, rest))
    g.fillStyle = fill
    g.fill()
  }

  const flecks = (now: number) => {
    for (const d of dust) {
      const age = now - d.t
      const fade = Math.max(0, 1 - age / d.life)
      // Each fleck glints on and off as it fades, and settles a few pixels
      g.globalAlpha = fade * (0.55 + 0.45 * Math.sin(age / 45 + d.phase))
      const y = d.y + age * 0.006
      g.beginPath()
      g.arc(d.x, y, d.r, 0, Math.PI * 2)
      g.fill()
      if (d.r > 1) {
        const l = d.r * 3.2 * fade
        g.beginPath()
        g.moveTo(d.x - l, y)
        g.lineTo(d.x + l, y)
        g.moveTo(d.x, y - l)
        g.lineTo(d.x, y + l)
        g.stroke()
      }
    }
  }

  const draw = (now: number) => {
    raf = 0
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, canvas.width, canvas.height)
    pts = pts.filter((p) => now - p.t < LIFE)
    dust = dust.filter((d) => now - d.t < d.life)
    if (!pts.length && !dust.length) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.shadowColor = 'rgba(255, 190, 90, 0.9)'
    g.shadowBlur = 6 * dpr
    streak(now)
    g.shadowBlur = 4 * dpr
    g.fillStyle = '#FFE7B0'
    g.strokeStyle = 'rgba(255, 240, 205, 0.8)'
    g.lineWidth = 0.6
    flecks(now)
    raf = requestAnimationFrame(draw)
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(draw)
  }

  fit()
  return {
    add(x: number, y: number, t: number) {
      const last = pts[pts.length - 1]
      if (last) {
        const step = Math.hypot(x - last.x, y - last.y)
        if (step < 2) return
        // Roughly a fleck of dust for every 25px the wand travels
        for (toDust += step; toDust > 16; toDust -= 16) {
          if (Math.random() > 0.65 || dust.length > 40) continue
          const k = Math.random()
          dust.push({
            x: last.x + (x - last.x) * k + (Math.random() - 0.5) * 8,
            y: last.y + (y - last.y) * k + (Math.random() - 0.5) * 8,
            t,
            life: 350 + Math.random() * 350,
            r: 0.5 + Math.random() * 0.9,
            phase: Math.random() * Math.PI * 2,
          })
        }
      }
      pts.push({ x, y, t })
      schedule()
    },
    clear() {
      pts = []
      dust = []
      schedule()
    },
    resize() {
      fit()
      schedule()
    },
    stop() {
      if (raf) cancelAnimationFrame(raf)
    },
  }
}

export default function WandCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const sparksRef = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const sparks = sparksRef.current
    if (!root || !sparks || !window.matchMedia('(pointer: fine)').matches) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const html = document.documentElement
    html.classList.add('wand-cursor')
    const trail = !reduce && trailRef.current ? goldTrail(trailRef.current) : null

    let x = -200
    let y = -200
    let lastX = 0
    let lastY = 0
    let lastSpark = 0
    let raf = 0

    let inside = false
    let target: Element | null = null
    let drip = 0

    // Sparks rise off a moving wand; over a link, smaller ones drift out in every direction
    const spark = (around = false) => {
      if (sparks.childElementCount > 24) return
      const el = document.createElement('span')
      el.className = s.spark
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      const a = Math.random() * Math.PI * 2
      const d = 10 + Math.random() * 14
      el.style.setProperty('--dx', `${(around ? Math.cos(a) * d : Math.random() * 28 - 14).toFixed(1)}px`)
      el.style.setProperty('--dy', `${(around ? Math.sin(a) * d : -10 - Math.random() * 26).toFixed(1)}px`)
      el.style.setProperty('--sz', `${((around ? 1.5 : 2) + Math.random() * (around ? 1.5 : 3)).toFixed(1)}px`)
      el.addEventListener('animationend', () => el.remove())
      sparks.appendChild(el)
    }

    // The gold halo fades in on the thing under the wand and back out when the wand moves on. It's
    // added on top of any filter the thing has of its own.
    const halos = new Map<Element, Animation>()
    const halo = (el: Element, on: boolean) => {
      const a = halos.get(el)
      if (a) {
        if (a.playbackRate > 0 !== on) a.reverse()
        return
      }
      if (!on) return
      const glow = el.closest('[data-wand-halo="full"]') ? HALO : SOFT_HALO
      const b = el.animate([{ filter: NO_HALO }, { filter: glow }], { duration: 250, easing: 'ease-out', fill: 'both', composite: 'add' })
      b.onfinish = () => {
        if (b.playbackRate > 0) return
        b.cancel()
        halos.delete(el)
      }
      halos.set(el, b)
    }
    const light = (el: Element | null) => {
      if (el === target) return
      if (target) halo(target, false)
      if (el) halo(el, true)
      target = el
      window.clearInterval(drip)
      if (el && !reduce) {
        for (let i = 0; i < 3; i++) spark(true)
        drip = window.setInterval(() => spark(true), 650)
      }
    }

    const frame = () => {
      raf = 0
      const el = inside ? (document.elementFromPoint(x, y)?.closest(TARGETS) ?? null) : null
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.style.setProperty('--lit', el ? '1' : '0')
      light(el)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      inside = true
      root.classList.add(s.visible)
      if (trail) {
        // Every position the pointer passed through since the last event, for a smooth streak
        const all = e.getCoalescedEvents?.() ?? []
        for (const ev of all.length ? all : [e]) trail.add(ev.clientX, ev.clientY, ev.timeStamp)
      }
      const now = performance.now()
      if (!reduce && now - lastSpark > 70 && Math.hypot(x - lastX, y - lastY) > 8) {
        spark()
        lastSpark = now
        lastX = x
        lastY = y
      }
      schedule()
    }
    const onLeave = () => {
      inside = false
      root.classList.remove(s.visible)
      trail?.clear()
      light(null)
    }
    const onResize = () => trail?.resize()
    const onDown = () => {
      root.classList.add(s.cast)
      window.setTimeout(() => root.classList.remove(s.cast), 350)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    // Scrolling moves the page under a still pointer, so check what's under the tip again.
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('blur', onLeave)
    window.addEventListener('resize', onResize)
    html.addEventListener('mouseleave', onLeave)

    return () => {
      html.classList.remove('wand-cursor')
      if (raf) cancelAnimationFrame(raf)
      trail?.stop()
      window.clearInterval(drip)
      halos.forEach((a) => a.cancel())
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('resize', onResize)
      html.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <canvas ref={trailRef} className={s.trail} aria-hidden="true" />
      <div ref={sparksRef} className={s.sparks} aria-hidden="true" />
      <div ref={rootRef} className={s.root} aria-hidden="true">
        <div className={s.halo} />
        <div className={s.glow} />
        {/* Cut out by scripts/wand; the tip sits at (0.3, 0.6) in this 100 x 84 image. */}
        <img className={s.wand} src="/images/wand.png" width={100} height={84} alt="" draggable={false} />
      </div>
    </>
  )
}
