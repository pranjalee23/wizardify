import type { Metadata } from 'next'
import Link from 'next/link'
import AlertPicker, { type AlertRow } from '@/components/admin/AlertPicker'
import FilterForm from '@/components/admin/FilterForm'
import { CURRENT_DROP } from '@/lib/drops'
import { houseById } from '@/lib/houses'
import { requireAdmin } from '@/lib/server/admin'
import { applyFilters, cities, countMembers, filterQuery, indiaTime, readFilters } from '@/lib/server/members'
import { reservationNumber } from '@/lib/server/reservations'
import { db } from '@/lib/server/supabase'
import s from '../admin.module.css'

export const metadata: Metadata = { title: 'Drop alerts' }

const PAGE = 100

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

// Sending "The doors are open": filter members, pick who gets it, send. Lists every member matching
// the filters, 100 to a page; those with email alerts off are shown greyed out and can't be picked.
export default async function Alerts({ searchParams }: Props) {
  await requireAdmin('alerts.send')
  const params = await searchParams
  const f = readFilters(params)
  const qs = filterQuery(f)
  const page = Math.max(1, Number(params.page) || 1)
  const listed = f

  const [rows, waiting, sent, emailOff, allCities] = await Promise.all([
    applyFilters(
      db()
        .from('reservations')
        .select('id, number, name, email, approx_city, house, priority, alerts_email, drop_alert, drop_alert_at', { count: 'exact' })
        .order('number')
        .range((page - 1) * PAGE, page * PAGE - 1),
      listed,
    ),
    // Who "select all" would reach: matching, email alerts on, not sent yet
    countMembers((q) => applyFilters(q, { ...listed, email: 'on', alert: 'not-sent' })),
    countMembers((q) => q.eq('drop_alert', CURRENT_DROP.key)),
    countMembers((q) => q.eq('alerts_email', false)),
    cities(),
  ])
  if (rows.error) throw rows.error
  const pages = Math.max(1, Math.ceil((rows.count ?? 0) / PAGE))
  const pageLink = (p: number) => {
    const next = new URLSearchParams(qs)
    next.set('page', String(p))
    return `/admin/alerts?${next}`
  }
  const list: AlertRow[] = rows.data.map((m) => ({
    id: m.id,
    number: m.number,
    label: reservationNumber(m.number),
    name: m.name,
    email: m.email,
    city: m.approx_city,
    house: houseById(m.house ?? undefined)?.name ?? '—',
    first: m.priority === 'first',
    emailOff: !m.alerts_email,
    sent: m.drop_alert === CURRENT_DROP.key && m.drop_alert_at ? indiaTime(m.drop_alert_at) : null,
  }))

  return (
    <main className={s.main}>
      <h1 className={s.title}>Drop alerts · {CURRENT_DROP.label}</h1>
      <p className={s.muted}>
        &ldquo;The doors are open&rdquo; goes by email to the members you select. {sent.toLocaleString('en-IN')} {sent === 1 ? 'has' : 'have'} had it so
        far. {emailOff > 0 && `${emailOff.toLocaleString('en-IN')} ${emailOff === 1 ? 'has' : 'have'} turned off email alerts; they're shown greyed out and won't be sent it. `}
        Resend&apos;s free plan sends up to 100 emails a day, reservation emails included, so on that plan send in batches of up to
        100. WhatsApp alerts will join once WhatsApp is connected.
      </p>

      <FilterForm action="/admin/alerts" f={f} cities={allCities.map((c) => c.city)} />

      <p className={s.muted}>
        {(rows.count ?? 0).toLocaleString('en-IN')} listed, {waiting.toLocaleString('en-IN')} not sent yet.
      </p>
      {list.length ? (
        <AlertPicker key={`${qs}|${page}`} rows={list} matching={waiting} filters={qs} />
      ) : (
        <p className={s.card}>Nobody matches these filters.</p>
      )}
      {pages > 1 && (
        <div className={s.row}>
          {page > 1 && (
            <Link href={pageLink(page - 1)} className={s.btn}>
              Previous
            </Link>
          )}
          <span className={s.muted}>
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={pageLink(page + 1)} className={s.btn}>
              Next
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
