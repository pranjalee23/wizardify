'use client'

import { useEffect, useRef } from 'react'
import s from './WandCursor.module.css'

const TARGETS = 'a, button, label, [data-wand]'
const REACH = 150

export default function WandCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const sparksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const sparks = sparksRef.current
    if (!root || !sparks || !window.matchMedia('(pointer: fine)').matches) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const html = document.documentElement
    html.classList.add('wand-cursor')

    let x = -200
    let y = -200
    let lastX = 0
    let lastY = 0
    let lastSpark = 0
    let raf = 0
    let dirty = true
    let rects: DOMRect[] = []

    const refresh = () => {
      rects = []
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && r.height > 0 && r.bottom > -REACH && r.top < window.innerHeight + REACH) rects.push(r)
      })
      dirty = false
    }

    const spark = () => {
      if (sparks.childElementCount > 24) return
      const el = document.createElement('span')
      el.className = s.spark
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.setProperty('--dx', `${(Math.random() * 28 - 14).toFixed(1)}px`)
      el.style.setProperty('--dy', `${(-10 - Math.random() * 26).toFixed(1)}px`)
      el.style.setProperty('--sz', `${(2 + Math.random() * 3).toFixed(1)}px`)
      el.addEventListener('animationend', () => el.remove())
      sparks.appendChild(el)
    }

    const frame = () => {
      raf = 0
      if (dirty) refresh()
      let lit = 0
      for (const r of rects) {
        const dx = Math.max(r.left - x, 0, x - r.right)
        const dy = Math.max(r.top - y, 0, y - r.bottom)
        const v = 1 - Math.min(Math.hypot(dx, dy), REACH) / REACH
        if (v > lit) lit = v
      }
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.style.setProperty('--lit', lit.toFixed(3))
    }

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      root.classList.add(s.visible)
      const now = performance.now()
      if (!reduce && now - lastSpark > 70 && Math.hypot(x - lastX, y - lastY) > 8) {
        spark()
        lastSpark = now
        lastX = x
        lastY = y
      }
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const onLeave = () => root.classList.remove(s.visible)
    const onDown = () => {
      root.classList.add(s.cast)
      window.setTimeout(() => root.classList.remove(s.cast), 350)
    }
    const onDirty = () => {
      dirty = true
    }

    const mo = new MutationObserver(onDirty)
    mo.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('scroll', onDirty, { passive: true })
    window.addEventListener('resize', onDirty)
    window.addEventListener('blur', onLeave)
    html.addEventListener('mouseleave', onLeave)

    return () => {
      html.classList.remove('wand-cursor')
      mo.disconnect()
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onDirty)
      window.removeEventListener('resize', onDirty)
      window.removeEventListener('blur', onLeave)
      html.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <div ref={sparksRef} className={s.sparks} aria-hidden="true" />
      <div ref={rootRef} className={s.root} aria-hidden="true">
        <div className={s.halo} />
        <div className={s.glow} />
        <svg className={s.wand} width="96" height="96" viewBox="0 0 96 96">
          <defs>
            <linearGradient id="wandWood" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7A5632" />
              <stop offset="0.45" stopColor="#3E2816" />
              <stop offset="1" stopColor="#1C110A" />
            </linearGradient>
          </defs>
          <path d="M7 7 L79 69 C86 75 87 84 80 88 C73 91 66 86 61 79 Z" fill="url(#wandWood)" />
          <path d="M64 64 L80 80" stroke="#150C06" strokeWidth="9" strokeLinecap="round" />
          <path d="M13 13 L19 19" stroke="#D9B26A" strokeWidth="5" strokeLinecap="round" />
          <path d="M9 9 L74 65" stroke="rgba(255,235,190,0.35)" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    </>
  )
}
