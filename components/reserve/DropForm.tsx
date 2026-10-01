'use client'

import { startTransition, useActionState, useEffect } from 'react'
import { startReservation } from '@/app/reserve/actions'
import type { HouseId } from '@/lib/houses'
import ui from '@/components/ui.module.css'
import FormMessage from './FormMessage'
import { useTurnstile } from './useTurnstile'
import s from './DropForm.module.css'

// Reserving takes an email address and a WhatsApp number, where the drop alerts go. The server
// holds the reservation and moves on to /reserve/1, or says what to fix.
export default function DropForm({ house }: { house?: HouseId }) {
  const [state, reserve, pending] = useActionState(startReservation, null)
  const human = useTurnstile()
  const { reset } = human
  useEffect(() => {
    if (state) reset()
  }, [state, reset])

  return (
    <>
      <form
        className={s.form}
        onSubmit={async (e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          if (house) form.set('house', house)
          form.set('cf-turnstile-response', await human.token())
          startTransition(() => reserve(form))
        }}
      >
        <div className={s.fields}>
          <div className={s.field}>
            <label htmlFor="drop-email" className={s.label}>
              Email address
            </label>
            <input id="drop-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={s.input} />
          </div>
          <div className={s.field}>
            <label htmlFor="drop-wa" className={s.label}>
              WhatsApp number
            </label>
            <div className={s.phone}>
              <span className={s.prefix}>+91</span>
              <input
                id="drop-wa"
                name="whatsapp"
                type="tel"
                autoComplete="tel-national"
                inputMode="numeric"
                required
                pattern="[0-9 ]{10,12}"
                maxLength={12}
                title="Your 10-digit WhatsApp number"
                placeholder="98765 43210"
                className={s.phoneInput}
              />
            </div>
          </div>
        </div>
        <button type="submit" disabled={pending} className={`${ui.pill} ${ui.paper} ${s.submit}`}>
          {pending ? 'RESERVING…' : 'RESERVE MY PLACE'}
        </button>
      </form>
      <FormMessage state={state} className={s.message} />
      <div ref={human.box} className={s.challenge} />
    </>
  )
}
