'use client'

import { useEffect, useRef } from 'react'
import s from './WandCursor.module.css'

// The tip glows brighter only over things you can click, or that animate on hover (marked data-wand).
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
      const lit = document.elementFromPoint(x, y)?.closest(TARGETS) ? 1 : 0
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.style.setProperty('--lit', String(lit))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame)
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
      schedule()
    }
    const onLeave = () => root.classList.remove(s.visible)
    const onDown = () => {
      root.classList.add(s.cast)
      window.setTimeout(() => root.classList.remove(s.cast), 350)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    // Scrolling moves the page under a still pointer, so check what's under the tip again.
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('blur', onLeave)
    html.addEventListener('mouseleave', onLeave)

    return () => {
      html.classList.remove('wand-cursor')
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', schedule)
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
        {/* Rendered by scripts/wand; the tip sits at (2.7, 2.7) in this 100x100 image. */}
        <img className={s.wand} src="/images/wand.png" width={100} height={100} alt="" draggable={false} />
      </div>
    </>
  )
}
