'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Arrow from '@/components/Arrow'
import { saveReservation, useHydrated, useReservation } from '@/lib/reservation'
import { routes } from '@/lib/routes'
import ui from '@/components/ui.module.css'
import r from './reserve.module.css'
import s from './ProfileForm.module.css'

export default function ProfileForm() {
  const router = useRouter()
  const saved = useReservation()
  const hydrated = useHydrated()

  return (
    <form
      key={hydrated ? 'saved' : 'initial'}
      className={`${r.form} ${r.narrow} ${s.fields}`}
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const text = (k: string) => String(f.get(k) ?? '').trim()
        saveReservation({
          name: text('name'),
          whatsapp: text('whatsapp').replace(/\D/g, ''),
          whatsappAlerts: f.get('whatsappAlerts') === 'on',
          city: text('city'),
        })
        router.push(routes.reserve(3))
      }}
    >
      <div className={s.field}>
        <label htmlFor="r-name" className={s.label}>
          Full name
        </label>
        <input id="r-name" name="name" type="text" autoComplete="name" defaultValue={saved.name} className={s.input} />
      </div>
      <div className={s.field}>
        <label htmlFor="r-wa" className={s.label}>
          WhatsApp number
        </label>
        <div className={s.phone}>
          <span className={s.prefix}>+91</span>
          <input
            id="r-wa"
            name="whatsapp"
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            defaultValue={saved.whatsapp}
            className={s.phoneInput}
          />
        </div>
        <label className={s.check}>
          <input type="checkbox" name="whatsappAlerts" defaultChecked={saved.whatsappAlerts ?? true} className={s.checkbox} />
          Send me drop alerts on WhatsApp
        </label>
      </div>
      <div className={s.field}>
        <label htmlFor="r-city" className={s.label}>
          City
        </label>
        <input id="r-city" name="city" type="text" autoComplete="address-level2" defaultValue={saved.city} className={s.input} />
      </div>
      <div className={`${r.actions} ${s.actions}`}>
        <Link href={routes.reserve(5)} className={r.skip}>
          Skip for now
        </Link>
        <button type="submit" className={`${ui.pill} ${ui.paper} ${ui.glow} ${r.cta}`}>
          CONTINUE
          <Arrow />
        </button>
      </div>
    </form>
  )
}
