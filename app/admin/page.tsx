import Link from 'next/link'
import FilterForm from '@/components/admin/FilterForm'
import { houseById } from '@/lib/houses'
import { countryName, regionName } from '@/lib/regions'
import { can, requireAdmin } from '@/lib/server/admin'
import { LIMITS, mb, readUsage } from '@/lib/server/daily'
import { applyFilters, cities, countMembers, filterQuery, indiaTime, readFilters } from '@/lib/server/members'
import { reservationNumber } from '@/lib/server/reservations'
import { db } from '@/lib/server/supabase'
import { chatLink } from '@/lib/server/whatsapp'
import s from './admin.module.css'

const PAGE = 50

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

// The dashboard: totals, then every reservation with filters. The downloads hold exactly what's filtered.
export default async function AdminHome({ searchParams }: Props) {
  const admin = await requireAdmin('stats')
  const params = await searchParams
  const f = readFilters(params)
  const qs = filterQuery(f)
  const filtered = qs !== ''
  const page = Math.max(1, Number(params.page) || 1)
  const showList = can(admin, 'members.view')

  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const list = showList
    ? applyFilters(
        db()
          .from('reservations')
          .select('number, name, email, whatsapp, house, priority, photos, approx_city, ip, created_at', { count: 'exact' })
          .order('number', { ascending: false })
          .range((page - 1) * PAGE, page * PAGE - 1),
        f,
      )
    : null
  const [total, firstInLine, withPhotos, thisWeek, allCities, matchingCities, usage, rows] = await Promise.all([
    countMembers(),
    countMembers((q) => q.eq('priority', 'first')),
    countMembers((q) => q.gt('photos', 0)),
    countMembers((q) => q.gte('created_at', week)),
    cities(),
    filtered ? cities(f) : null,
    readUsage(),
    list,
  ])
  if (rows?.error) throw rows.error
  const byCity = matchingCities ?? allCities
  const matching = byCity.reduce((n, c) => n + c.members, 0)
  const pages = Math.max(1, Math.ceil((rows?.count ?? 0) / PAGE))
  // The dashboard's address with one more filter (or page) set
  const withParam = (key: string, value: string) => {
    const next = new URLSearchParams(qs)
    next.set(key, value)
    return `/admin?${next}`
  }
  const pageLink = (p: number) => withParam('page', String(p))

  const stats = [
    ['Members', total],
    ['First in line', firstInLine],
    ['With photos', withPhotos],
    ['New this week', thisWeek],
  ] as const
  return (
    <main className={s.main}>
      <h1 className={s.title}>Dashboard</h1>

      <div className={s.stats}>
        {stats.map(([label, value]) => (
          <div key={label} className={s.stat}>
            <span className={s.statValue}>{value.toLocaleString('en-IN')}</span>
            <span className={s.statLabel}>{label}</span>
          </div>
        ))}
      </div>
      {!(usage instanceof Error) && (
        <p className={s.muted}>
          Space used on Supabase&apos;s free plan: photos {mb(usage.storage)} of {mb(LIMITS.storage)} ({Math.round((usage.storage / LIMITS.storage) * 100)}%),
          database {mb(usage.database)} of {mb(LIMITS.database)}.
        </p>
      )}

      <FilterForm action="/admin" f={f} cities={allCities.map((c) => c.city)} />

      <section>
        <div className={`${s.row} ${s.spread}`}>
          <h2 className={s.subtitle}>
            {filtered ? `${matching.toLocaleString('en-IN')} matching` : `All ${total.toLocaleString('en-IN')} reservations`}
          </h2>
          {can(admin, 'export.members') && (
            <a href={`/admin/export/members${qs ? `?${qs}` : ''}`} className={s.btn}>
              Download {filtered ? 'these' : 'all'} reservations (CSV)
            </a>
          )}
        </div>
        {rows &&
          (rows.data.length ? (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Reservation</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>WhatsApp</th>
                    <th>City</th>
                    <th>IP address</th>
                    <th>House</th>
                    <th>First in line</th>
                    <th>Photos</th>
                    <th>Reserved</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.data.map((m) => (
                    <tr key={m.number}>
                      <td>
                        <Link href={`/admin/members/${m.number}`}>{reservationNumber(m.number)}</Link>
                      </td>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td>
                        <a href={chatLink(m.whatsapp)} target="_blank" rel="noopener noreferrer" title="Open a WhatsApp chat">
                          {m.whatsapp}
                        </a>
                      </td>
                      <td>{m.approx_city ?? '—'}</td>
                      <td>{m.ip ?? '—'}</td>
                      <td>{houseById(m.house ?? undefined)?.name ?? '—'}</td>
                      <td>{m.priority === 'first' ? 'Yes' : 'No'}</td>
                      <td>{m.photos}</td>
                      <td>{indiaTime(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={s.card}>{filtered ? 'No reservations match these filters.' : 'No reservations yet.'}</p>
          ))}
        {rows && pages > 1 && (
          <div className={s.row} style={{ marginTop: 12 }}>
            {page > 1 && (
              <Link href={pageLink(page - 1)} className={s.btn}>
                Newer
              </Link>
            )}
            <span className={s.muted}>
              Page {page} of {pages}
            </span>
            {page < pages && (
              <Link href={pageLink(page + 1)} className={s.btn}>
                Older
              </Link>
            )}
          </div>
        )}
      </section>

      <section>
        <div className={`${s.row} ${s.spread}`}>
          <h2 className={s.subtitle}>Where {filtered ? 'they' : 'members'} are</h2>
          {can(admin, 'export.cities') && (
            <a href={`/admin/export/cities${qs ? `?${qs}` : ''}`} className={s.btn}>
              Download cities (CSV)
            </a>
          )}
        </div>
        <p className={s.muted}>Approximate, from each member&apos;s internet connection when they reserved.</p>
        {byCity.length ? (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>City</th>
                  <th>State</th>
                  <th>Country</th>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {byCity.slice(0, 50).map((c) => (
                  <tr key={`${c.city}|${c.region}|${c.country}`}>
                    <td>
                      <Link href={withParam('city', c.city)}>{c.city}</Link>
                    </td>
                    <td>{regionName(c.country, c.region)}</td>
                    <td>{countryName(c.country)}</td>
                    <td>{c.members.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={s.card}>No members yet.</p>
        )}
        {byCity.length > 50 && <p className={s.muted}>Showing the top 50 cities. The CSV has them all.</p>}
      </section>
    </main>
  )
}
