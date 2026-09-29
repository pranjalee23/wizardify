'use client'

import { useState } from 'react'
import s from './MagicTiles.module.css'

const talents = [
  { id: 'potions', label: 'Potions', d: 'M9 3h6M10 3v6L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7 14h10' },
  { id: 'warding', label: 'Shadow Warding', d: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z' },
  { id: 'charms', label: 'Charms', d: 'M12 2l2 7 7 3-7 3-2 7-2-7-7-3 7-3z' },
  { id: 'shift', label: 'Shapeshifting', d: 'M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5M18 3v4h-4M6 21v-4h4' },
  { id: 'herbs', label: 'Herbology', d: 'M12 21V11M12 11C12 6 8 4 4 4c0 4 3 7 8 7zM12 13c0-4 3-6 8-6 0 4-3 6-8 6z' },
  { id: 'stars', label: 'Astronomy', d: 'M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10zM17 3l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z' },
  {
    id: 'beasts',
    label: 'Beast Keeping',
    d: 'M8 15c0-2 2-4 4-4s4 2 4 4-2 5-4 5-4-3-4-5zM4.5 10a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0M16.5 10a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0M8 6a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0M13 6a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0',
  },
  { id: 'other', label: 'Other', d: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 8v8M8 12h8' },
]

export default function MagicTiles() {
  const [pick, setPick] = useState('charms')

  return (
    <div role="radiogroup" aria-label="Your magical talent" className={s.tiles}>
      {talents.map((t) => {
        const on = t.id === pick
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setPick(t.id)}
            className={`${s.tile} ${on ? s.tileOn : ''}`}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D9B26A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={t.d} />
            </svg>
            <span className={s.tileLabel}>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
