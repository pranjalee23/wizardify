'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Arrow from '@/components/Arrow'
import Crest from '@/components/Crest'
import { houses, type HouseId } from '@/lib/houses'
import { saveReservation, useHydrated, useReservation, type Reservation } from '@/lib/reservation'
import { routes } from '@/lib/routes'
import ui from '@/components/ui.module.css'
import r from './reserve.module.css'
import s from './PreferencesForm.module.css'

const groups = [
  {
    key: 'knownFor',
    title: 'KNOWN FOR',
    options: ['Potions', 'Shadow Warding', 'Charms', 'Shapeshifting', 'Herbology', 'Astronomy', 'Beast Keeping', 'Something else'],
  },
  { key: 'setting', title: 'YOUR SETTING', options: ['Castle at sunset', 'The great library', 'Starlit tower', 'Enchanted forest'] },
] as const

export default function PreferencesForm() {
  const saved = useReservation()
  const hydrated = useHydrated()
  return <Fields key={hydrated ? 'saved' : 'initial'} saved={saved} />
}

function Fields({ saved }: { saved: Reservation }) {
  const router = useRouter()
  const [house, setHouse] = useState<HouseId | undefined>(saved.house)
  const [picks, setPicks] = useState({ knownFor: saved.knownFor, setting: saved.setting })

  return (
    <form
      className={`${r.form} ${r.wide} ${s.fields}`}
      onSubmit={(e) => {
        e.preventDefault()
        saveReservation({ house, ...picks })
        router.push(routes.reserve(4))
      }}
    >
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>YOUR HOUSE</legend>
        <div className={s.houses}>
          {houses.map((h) => {
            const on = house === h.id
            return (
              <button
                key={h.id}
                type="button"
                aria-pressed={on}
                onClick={() => setHouse(on ? undefined : h.id)}
                className={on ? `${s.house} ${s.houseOn}` : s.house}
              >
                <Crest house={h.id} scale={0.5} />
                <span className={s.houseName}>{h.name}</span>
              </button>
            )
          })}
        </div>
      </fieldset>
      {groups.map((g) => (
        <fieldset key={g.key} className={s.fieldset}>
          <legend className={s.legend}>{g.title}</legend>
          <div className={s.options}>
            {g.options.map((o) => {
              const on = picks[g.key] === o
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicks((p) => ({ ...p, [g.key]: on ? undefined : o }))}
                  className={`${ui.toggle} ${on ? ui.toggleOn : ''} ${s.option}`}
                >
                  {o}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
      <div className={`${r.actions} ${s.actions}`}>
        <Link href={routes.reserve(4)} className={r.skip}>
          Skip this step
        </Link>
        <button type="submit" className={`${ui.pill} ${ui.paper} ${ui.glow} ${r.cta}`}>
          CONTINUE
          <Arrow />
        </button>
      </div>
    </form>
  )
}
