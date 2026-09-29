'use client'

import { useState } from 'react'
import ui from '@/components/ui.module.css'
import s from './LifeGroups.module.css'

const groups = [
  { key: 'role', title: 'YOUR ROLE', opts: ['Student', 'Mentor', 'Scholar', 'Explorer'] },
  { key: 'sky', title: 'SKYBALL', opts: ['Team captain', 'Flyer', 'Cheering from the stands', 'Not a flyer'] },
  { key: 'pet', title: 'COMPANION', opts: ['Owl', 'Cat', 'Raven', 'Fox', 'None'] },
  { key: 'place', title: 'SETTING', opts: ['Castle at sunset', 'The great library', 'Starlit tower', 'Enchanted forest'] },
]

export default function LifeGroups() {
  const [picks, setPicks] = useState<Record<string, string>>({
    role: 'Student',
    sky: 'Not a flyer',
    pet: 'Owl',
    place: 'Castle at sunset',
  })

  return (
    <div className={s.groups}>
      {groups.map((g) => (
        <fieldset key={g.key} className={s.group}>
          <legend className={s.legend}>{g.title}</legend>
          <div className={s.opts}>
            {g.opts.map((o) => {
              const on = picks[g.key] === o
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicks((p) => ({ ...p, [g.key]: o }))}
                  className={`${ui.toggle} ${on ? ui.toggleOn : ''} ${s.opt}`}
                >
                  {o}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
