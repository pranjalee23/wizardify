'use client'

import Link from 'next/link'
import { houseById } from '@/lib/houses'
import { useReservation } from '@/lib/reservation'
import { routes } from '@/lib/routes'
import s from './Certificate.module.css'

const spark = 'M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z'

export function ConfirmationEmail({ fallback = 'your inbox' }: { fallback?: string }) {
  const { email } = useReservation()
  return email ? <span className={s.email}>{email}</span> : fallback
}

export default function Certificate() {
  const r = useReservation()
  const house = houseById(r.house)
  const hasPreferences = Boolean(r.house || r.knownFor || r.setting)
  const rows = [
    ['NAME', r.name || '—'],
    ['HOUSE', house?.title ?? '—'],
    ['DROP ALERTS', r.whatsappAlerts && r.whatsapp ? 'Email and WhatsApp' : 'Email'],
    ['PRIORITY', hasPreferences ? 'First in line' : 'Standard'],
  ]

  return (
    <div className={s.frame}>
      <div className={s.paper}>
        <div className={s.heading}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path className={s.spark} d={spark} fill="#8A6526" />
          </svg>
          <span className={s.headingText}>CERTIFICATE OF RESERVATION</span>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path className={`${s.spark} ${s.sparkLate}`} d={spark} fill="#8A6526" />
          </svg>
        </div>
        {/* Placeholder until reservations are stored and numbered on a server. */}
        <div className={s.number}>WZ-[0421]</div>
        <div className={s.divider} />
        <dl className={s.details}>
          {rows.map(([dt, dd]) => (
            <div key={dt}>
              <dt className={s.dt}>{dt}</dt>
              <dd className={s.dd}>{dd}</dd>
            </div>
          ))}
        </dl>
        <div className={s.photos}>
          {r.photos ? (
            <span>
              <span className={s.strong}>Photos:</span> {r.photos} added
            </span>
          ) : (
            <>
              <span>
                <span className={s.strong}>Photos:</span> add before the doors reopen
              </span>
              <Link href={routes.reserve(4)} className={s.addNow}>
                Add now
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
