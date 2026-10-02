'use client'

import { startTransition, useActionState, useState } from 'react'
import Link from 'next/link'
import Arrow from '@/components/Arrow'
import Crest from '@/components/Crest'
import { savePreferences } from '@/app/reserve/actions'
import { houses, type HouseId } from '@/lib/houses'
import { companionOptions, knownForOptions, roleOptions, settingOptions, skyballOptions } from '@/lib/preferences'
import { routes } from '@/lib/routes'
import ui from '@/components/ui.module.css'
import FormMessage from './FormMessage'
import r from './reserve.module.css'
import s from './PreferencesForm.module.css'

const groups = [
  { key: 'knownFor', title: 'KNOWN FOR', options: knownForOptions },
  { key: 'role', title: 'YOUR ROLE', options: roleOptions },
  { key: 'skyball', title: 'SKYBALL', options: skyballOptions },
  { key: 'companion', title: 'COMPANION', options: companionOptions },
  { key: 'setting', title: 'YOUR SETTING', options: settingOptions },
] as const

type Pick = string | null
type Props = { house: HouseId | null; knownFor: Pick; role: Pick; skyball: Pick; companion: Pick; setting: Pick }

export default function PreferencesForm(saved: Props) {
  const [state, save, pending] = useActionState(savePreferences, null)
  const [house, setHouse] = useState(saved.house ?? undefined)
  const [picks, setPicks] = useState({
    knownFor: saved.knownFor ?? undefined,
    role: saved.role ?? undefined,
    skyball: saved.skyball ?? undefined,
    companion: saved.companion ?? undefined,
    setting: saved.setting ?? undefined,
  })

  // First in line takes all six: the house and the five groups below it
  const chosen = [house, ...Object.values(picks)].filter(Boolean).length

  return (
    <form
      className={`${r.form} ${r.wide} ${s.fields}`}
      onSubmit={(e) => {
        e.preventDefault()
        const form = new FormData()
        for (const [k, v] of Object.entries({ house, ...picks })) if (v) form.set(k, v)
        startTransition(() => save(form))
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
      <p className={s.progress} aria-live="polite">
        {chosen === 6 ? 'All six chosen. You’re first in line.' : `${chosen} of 6 chosen. Choose all six to be first in line.`}
      </p>
      <div className={`${r.actions} ${s.actions}`}>
        <Link href={routes.reserve(3)} className={r.skip}>
          Skip this step
        </Link>
        <button type="submit" disabled={pending} className={`${ui.pill} ${ui.paper} ${r.cta}`}>
          {pending ? 'SAVING…' : 'CONTINUE'}
          <Arrow />
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  )
}
