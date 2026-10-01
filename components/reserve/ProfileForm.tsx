'use client'

import { startTransition, useActionState } from 'react'
import Link from 'next/link'
import Arrow from '@/components/Arrow'
import { saveProfile } from '@/app/reserve/actions'
import { routes } from '@/lib/routes'
import ui from '@/components/ui.module.css'
import FormMessage from './FormMessage'
import r from './reserve.module.css'
import s from './ProfileForm.module.css'

type Props = { name: string | null; city: string | null }

export default function ProfileForm({ name, city }: Props) {
  const [state, save, pending] = useActionState(saveProfile, null)

  return (
    <form
      className={`${r.form} ${r.narrow} ${s.fields}`}
      onSubmit={(e) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        startTransition(() => save(form))
      }}
    >
      <div className={s.field}>
        <label htmlFor="r-name" className={s.label}>
          Full name
        </label>
        <input id="r-name" name="name" type="text" autoComplete="name" maxLength={100} defaultValue={name ?? ''} className={s.input} />
      </div>
      <div className={s.field}>
        <label htmlFor="r-city" className={s.label}>
          City
        </label>
        <input id="r-city" name="city" type="text" autoComplete="address-level2" maxLength={100} defaultValue={city ?? ''} className={s.input} />
      </div>
      <div className={`${r.actions} ${s.actions}`}>
        <Link href={routes.reserve(5)} className={r.skip}>
          Skip for now
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
