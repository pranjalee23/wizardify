'use client'

import { useRouter } from 'next/navigation'
import { saveReservation } from '@/lib/reservation'
import type { HouseId } from '@/lib/houses'
import { routes } from '@/lib/routes'
import ui from '@/components/ui.module.css'
import s from './DropForm.module.css'

export default function DropForm({ house }: { house?: HouseId }) {
  const router = useRouter()

  return (
    <form
      className={s.form}
      onSubmit={(e) => {
        e.preventDefault()
        const email = String(new FormData(e.currentTarget).get('email') ?? '').trim()
        saveReservation(house ? { email, house } : { email })
        router.push(routes.reserve(1))
      }}
    >
      <div className={s.field}>
        <label htmlFor="drop-email" className={s.label}>
          Email address
        </label>
        <input id="drop-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={s.input} />
      </div>
      <button type="submit" className={`${ui.pill} ${ui.paper} ${ui.glow} ${s.submit}`}>
        RESERVE MY PLACE
      </button>
    </form>
  )
}
