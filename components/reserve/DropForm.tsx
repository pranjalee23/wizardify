'use client'

import { startTransition, useActionState, useEffect, useState } from 'react'
import { startReservation } from '@/app/reserve/actions'
import type { HouseId } from '@/lib/houses'
import ui from '@/components/ui.module.css'
import FormMessage from './FormMessage'
import { useTurnstile } from './useTurnstile'
import s from './DropForm.module.css'

// A WhatsApp number as typed or pasted, as the 10 digits after +91 (which the form already shows):
// spaces and dashes go, and so does a leading 91, +91 or 0
function tenDigits(typed: string) {
  let digits = typed.replace(/\D/g, '')
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2)
  return digits.replace(/^0+/, '').slice(0, 10)
}

// Reserving takes a name, an email address and a WhatsApp number, where the drop alerts go. The
// server holds the reservation and moves on to /reserve/1, or says what to fix.
export default function DropForm({ house }: { house?: HouseId }) {
  const [state, reserve, pending] = useActionState(startReservation, null)
  const [whatsapp, setWhatsapp] = useState('')
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
            <label htmlFor="drop-name" className={s.label}>
              Name
            </label>
            <input
              id="drop-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="Your name"
              className={`${s.input} ${s.name}`}
            />
          </div>
          <div className={s.field}>
            <label htmlFor="drop-email" className={s.label}>
              Email address
            </label>
            <input
              id="drop-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              pattern="[^@\s]+@[^@\s]+\.[A-Za-z]{2,}"
              title="Your email address, e.g. name@gmail.com"
              placeholder="you@example.com"
              className={s.input}
            />
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
                pattern="[6-9][0-9]{9}"
                title="Your 10-digit WhatsApp number, without +91 or 0"
                placeholder="9876543210"
                value={whatsapp}
                onChange={(e) => setWhatsapp(tenDigits(e.target.value))}
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
