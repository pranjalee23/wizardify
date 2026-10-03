'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import Check from './Check'
import FrameDetails from './FrameDetails'
import type { FrameStyle, FrameTier } from '@/lib/frames'
import ui from './ui.module.css'
import s from './PricingCard.module.css'

type Style = FrameStyle

type Props = { tier: FrameTier; price: string }

const styles: { id: Style; label: string }[] = [
  { id: 'gold', label: 'Antique gold' },
  { id: 'black', label: 'Modern black' },
]

// One size of frame, with a preview that switches between the two frame styles. The preview and the
// details button open the size's dimensions and details (components/FrameDetails).
export default function PricingCard({ tier, price }: Props) {
  const { kind, name, size, img, alt, initial, features } = tier
  const [pick, setPick] = useState<Style>(initial)
  const [open, setOpen] = useState(false)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + styles.length) % styles.length
    setPick(styles[next].id)
    refs.current[next]?.focus()
  }

  return (
    <article className={`${ui.paperCard} ${ui.paperTall} ${s.card}`}>
      <div className={s.kind}>{kind}</div>
      <h3 className={s.name}>{name}</h3>
      <div className={s.size}>{size}</div>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`${name}: see dimensions and details`}
        className={s.preview}
        onClick={() => setOpen(true)}
      >
        {pick === 'gold' ? (
          <div className={s.gold}>
            <img className={s.goldArt} loading="lazy" decoding="async" src={img} alt={`${alt}, in the antique gold frame`} />
            <img className={s.goldFrame} src="/images/frame.webp" alt="" loading="lazy" decoding="async" />
          </div>
        ) : (
          <div className={s.black}>
            <div className={s.mat}>
              <img className={s.blackArt} loading="lazy" decoding="async" src={img} alt={`${alt}, in the modern black frame`} />
            </div>
          </div>
        )}
      </button>
      <div role="radiogroup" aria-label={`Frame style for ${name}`} className={s.styles}>
        {styles.map((st, i) => {
          const on = st.id === pick
          return (
            <button
              key={st.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setPick(st.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={on ? `${s.style} ${s.styleOn}` : s.style}
            >
              <span className={`${s.swatch} ${st.id === 'gold' ? s.swatchGold : s.swatchBlack}`} aria-hidden="true" />
              {st.label}
            </button>
          )
        })}
      </div>
      <div className={s.same}>Either style, same price</div>
      <div className={s.price}>{price}</div>
      <button type="button" aria-haspopup="dialog" className={s.details} onClick={() => setOpen(true)}>
        Dimensions and details
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <ul className={s.features}>
        {features.map((f) => (
          <li key={f} className={s.feature}>
            <Check size={18} />
            {f}
          </li>
        ))}
      </ul>
      {open && <FrameDetails tier={tier} style={pick} price={price} onClose={() => setOpen(false)} />}
    </article>
  )
}
