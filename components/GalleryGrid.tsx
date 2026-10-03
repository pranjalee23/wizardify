'use client'

import { useState } from 'react'
import Framed from './Framed'
import { filters, portraits } from '@/lib/gallery'
import ui from './ui.module.css'
import s from './GalleryGrid.module.css'

export default function GalleryGrid() {
  const [f, setF] = useState<string>('all')
  const items = portraits.filter((p) => f === 'all' || p.tags.includes(f))

  return (
    <>
      <div role="group" aria-label="Filter portraits" className={s.filters} data-reveal="2">
        {filters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === f}
            onClick={() => setF(id)}
            className={`${ui.toggle} ${id === f ? ui.toggleOn : ''} ${s.filter}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={s.grid}>
        {items.map((p, i) => (
          <figure key={p.name} className={s.item} data-reveal={String(i % 4)}>
            <Framed width={290} delay={(i % 4) * 1.3 + Math.floor(i / 4) * 0.7}>
              <img className={ui.top} src={p.src} alt={p.alt} loading="lazy" decoding="async" />
            </Framed>
            <figcaption className={s.caption}>
              <span className={s.plaque}>{p.name}</span>
              <span className={s.house}>{p.house}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  )
}
