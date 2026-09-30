'use client'

import { startTransition, useActionState } from 'react'
import { saveAlerts } from '@/app/unsubscribe/actions'
import ui from '@/components/ui.module.css'
import FormMessage from './FormMessage'
import r from './reserve.module.css'
import s from './AlertsForm.module.css'

type Props = { token: string; email: boolean; whatsapp: boolean }

// The member's drop alerts, on or off by channel
export default function AlertsForm({ token, email, whatsapp }: Props) {
  const [state, save, pending] = useActionState(saveAlerts, null)
  const channels = [
    { name: 'email', label: 'Email', note: 'Drop alerts and reminders to add your photos', on: email },
    { name: 'whatsapp', label: 'WhatsApp', note: 'Drop alerts', on: whatsapp },
  ]

  return (
    <form
      className={`${r.form} ${r.narrow} ${s.card}`}
      onSubmit={(e) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        startTransition(() => save(form))
      }}
    >
      <input type="hidden" name="t" value={token} />
      {channels.map((c) => (
        <label key={c.name} className={s.row}>
          <span className={s.text}>
            <span className={s.label}>{c.label}</span>
            <span className={s.note}>{c.note}</span>
          </span>
          <input type="checkbox" name={c.name} defaultChecked={c.on} className={s.switch} />
        </label>
      ))}
      <button type="submit" disabled={pending} className={`${ui.pill} ${ui.paper} ${r.cta} ${s.save}`}>
        {pending ? 'SAVING…' : 'SAVE'}
      </button>
      <FormMessage state={state} />
    </form>
  )
}
