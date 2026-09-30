'use client'

import { useRouter } from 'next/navigation'
import { saveReservation } from '@/lib/reservation'
import type { HouseId } from '@/lib/houses'
import { routes } from '@/lib/routes'
import ui from '@/components/ui.module.css'
import s from './DropForm.module.css'

// Reserving takes an email address and a WhatsApp number, where the drop alerts go
export default function DropForm({ house }: { house?: HouseId }) {
  const router = useRouter()

  return (
    <form
      className={s.form}
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const email = String(f.get('email') ?? '').trim()
        const whatsapp = String(f.get('whatsapp') ?? '').replace(/\D/g, '')
        saveReservation(house ? { email, whatsapp, house } : { email, whatsapp })
        router.push(routes.reserve(1))
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
      <button type="submit" className={`${ui.pill} ${ui.paper} ${ui.glow} ${s.submit}`}>
        RESERVE MY PLACE
      </button>
    </form>
  )
}
