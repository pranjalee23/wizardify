'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { faqTopics } from '@/lib/faq'
import s from './FaqTabs.module.css'

export default function FaqTabs() {
  const [current, setCurrent] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const topic = faqTopics[current]

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (i + step + faqTopics.length) % faqTopics.length
    setCurrent(next)
    tabs.current[next]?.focus()
  }

  return (
    <div className={s.box} data-reveal="2">
      <div role="tablist" aria-label="Question topics" aria-orientation="vertical" className={s.tabs}>
        {faqTopics.map((t, i) => {
          const on = i === current
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabs.current[i] = el
              }}
              id={`faq-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="faq-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setCurrent(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={on ? `${s.tab} ${s.tabOn}` : s.tab}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div id="faq-panel" role="tabpanel" aria-labelledby={`faq-tab-${topic.id}`} className={s.panel}>
        {topic.questions.map(([q, a]) => (
          <details key={q} className={s.item}>
            <summary className={s.question}>
              {q}
              <span aria-hidden="true" className={s.plus}>
                +
              </span>
            </summary>
            <p className={s.answer}>{a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
