'use client'

import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { houses, type HouseId } from '@/lib/houses'
import { useHydrated, useReservation } from '@/lib/reservation'
import s from './HousePicker.module.css'

export default function HousePicker() {
  const saved = useReservation()
  const hydrated = useHydrated()
  return <Banners key={hydrated ? 'saved' : 'initial'} initial={saved.house ?? 'nightbloom'} />
}

function Banners({ initial }: { initial: HouseId }) {
  const [pick, setPick] = useState<HouseId>(initial)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + houses.length) % houses.length
    setPick(houses[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Choose your house" className={s.group}>
      {houses.map((h, i) => {
        const on = h.id === pick
        return (
          <button
            key={h.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => setPick(h.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={on ? `${s.option} ${s.optionOn}` : s.option}
          >
            <div className={s.banner} style={{ '--c': h.banner } as CSSProperties}>
              <div className={s.bar} />
              <img src={h.img} alt="" className={s.img} />
              <div className={s.shade} />
              <div className={s.name}>{h.name}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
