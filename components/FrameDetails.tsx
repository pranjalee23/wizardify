'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import Check from './Check'
import type { FrameStyle, FrameTier } from '@/lib/frames'
import s from './FrameDetails.module.css'

type Props = { tier: FrameTier; style: FrameStyle; price: string; onClose: () => void }

const spark = 'M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z'
const FOCUSABLE = 'a[href], button:not(:disabled), input, select, textarea, [tabindex]:not([tabindex="-1"])'

// A frame size's dimensions and details, over the page. It's a modal: the rest of the page is set
// inert while it's open, focus stays inside it, and Escape or a click outside closes it. It's drawn
// on the page rather than as a native <dialog>, so the wand cursor still shows above it.
export default function FrameDetails({ tier, style, price, onClose }: Props) {
  const sheet = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const d = tier.details

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const host = sheet.current?.closest('[data-frame-details]')
    const others = [...document.body.children].filter((el) => el !== host && !el.hasAttribute('inert')) as HTMLElement[]
    others.forEach((el) => el.setAttribute('inert', ''))
    const html = document.documentElement
    const overflow = html.style.overflow
    html.style.overflow = 'hidden'
    closeBtn.current?.focus()
    return () => {
      others.forEach((el) => el.removeAttribute('inert'))
      html.style.overflow = overflow
      opener?.focus()
    }
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !sheet.current) return
    const items = [...sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div data-frame-details="" className={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()} onKeyDown={onKeyDown}>
      <div ref={sheet} role="dialog" aria-modal="true" aria-labelledby={`details-${tier.id}`} className={s.sheet}>
        <button ref={closeBtn} type="button" aria-label="Close details" className={s.close} onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <header className={s.head}>
          <div className={s.titles}>
            <div className={s.kind}>{d.kind}</div>
            <h2 id={`details-${tier.id}`} className={s.name}>
              {tier.name}
            </h2>
          </div>
          <div className={s.price}>{price}</div>
        </header>

        <div className={s.body}>
          <div className={s.dims}>
            <div className={s.label}>Dimensions</div>
            <div className={s.figure}>
              {style === 'gold' ? (
                <div className={s.gold}>
                  <img className={s.goldArt} loading="lazy" decoding="async" src={tier.img} alt={`${tier.name} in the antique gold frame`} />
                  <img className={s.goldFrame} src="/images/frame.webp" alt="" loading="lazy" decoding="async" />
                </div>
              ) : (
                <div className={s.black}>
                  <div className={s.mat}>
                    <img className={s.blackArt} loading="lazy" decoding="async" src={tier.img} alt={`${tier.name} in the modern black frame`} />
                  </div>
                </div>
              )}
              <div className={s.ruleV} aria-hidden="true">
                <div className={s.ruleVLine} />
              </div>
              <div className={s.labelV}>{d.h}</div>
              <div className={s.ruleH} aria-hidden="true">
                <div className={s.ruleHLine} />
              </div>
              <div className={s.labelH}>{d.w}</div>
            </div>
          </div>

          <dl className={s.specs}>
            {d.specs.map(([k, v]) => (
              <div key={k} className={s.spec}>
                <dt className={s.dt}>{k}</dt>
                <dd className={s.dd}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={s.lists}>
          <section className={s.list}>
            <h3 className={s.listTitle}>What&apos;s in the box</h3>
            <ul className={s.items}>
              {d.box.map((t) => (
                <li key={t} className={s.item}>
                  <Check size={18} />
                  {t}
                </li>
              ))}
            </ul>
          </section>
          <section className={s.list}>
            <h3 className={s.listTitle}>Caring for your frame</h3>
            <ul className={s.items}>
              {d.care.map((t) => (
                <li key={t} className={s.item}>
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={s.spark}>
                    <path d={spark} fill="#8A6526" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className={s.note}>{d.note}</p>
      </div>
    </div>,
    document.body,
  )
}
