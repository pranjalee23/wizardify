import Link from 'next/link'
import { houseById } from '@/lib/houses'
import { routes } from '@/lib/routes'
import { reservationNumber, type Reservation } from '@/lib/server/reservations'
import s from './Certificate.module.css'

const spark = 'M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z'

export default function Certificate({ reservation: r }: { reservation: Reservation }) {
  const house = houseById(r.house ?? undefined)
  const rows = [
    ['NAME', r.name || '—'],
    ['HOUSE', house?.title ?? '—'],
    ['DROP ALERTS', r.alerts_whatsapp ? 'Email and WhatsApp' : 'Email'],
    ['PRIORITY', r.priority === 'first' ? 'First in line' : 'Standard'],
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
        <div className={s.number}>{reservationNumber(r.number)}</div>
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
              <Link href={routes.reserve(3)} className={s.addNow}>
                Add now
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
