import 'server-only'
import { houses } from '@/lib/houses'
import { companionOptions, knownForOptions, roleOptions, settingOptions, skyballOptions } from '@/lib/preferences'
import { db, type ReservationRow } from './supabase'

// Reading members for the admin dashboard and its downloads, which share the same filters, so a
// download always holds exactly the members on screen.

export type Filters = {
  q?: string
  number?: number
  city?: string
  house?: string
  first?: 'yes' | 'no'
  photos?: 'yes' | 'no'
  email?: 'on' | 'off'
  whatsapp?: 'on' | 'off'
  from?: string
  to?: string
  knownFor?: string
  role?: string
  skyball?: string
  companion?: string
  setting?: string
}

export const preferenceFilters = [
  { key: 'knownFor', column: 'known_for', label: 'Known for', options: knownForOptions },
  { key: 'role', column: 'role', label: 'Role', options: roleOptions },
  { key: 'skyball', column: 'skyball', label: 'Skyball', options: skyballOptions },
  { key: 'companion', column: 'companion', label: 'Companion', options: companionOptions },
  { key: 'setting', column: 'setting', label: 'Setting', options: settingOptions },
] as const

// Filters from the page's address, keeping only values that make sense
export function readFilters(params: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => {
    const v = params[k]
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined
  }
  const pick = <T extends string>(k: string, allowed: readonly T[]) => {
    const v = one(k)
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined
  }
  const day = (k: string) => {
    const v = one(k)
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined
  }
  const number = Number(one('number')?.replace(/\D/g, ''))
  const f: Filters = {
    // Only letters, digits and the characters emails, numbers and IPs use, so a search can't be read as a filter
    q: one('q')?.replace(/[^\p{L}\p{N}@._+\-: ]/gu, '').slice(0, 100) || undefined,
    number: number > 0 ? number : undefined,
    city: one('city')?.slice(0, 100),
    house: pick('house', houses.map((h) => h.id)),
    first: pick('first', ['yes', 'no']),
    photos: pick('photos', ['yes', 'no']),
    email: pick('email', ['on', 'off']),
    whatsapp: pick('whatsapp', ['on', 'off']),
    from: day('from'),
    to: day('to'),
  }
  for (const p of preferenceFilters) f[p.key] = pick(p.key, p.options)
  return f
}

// The filters as a query string, for links and downloads
export const filterQuery = (f: Filters) =>
  new URLSearchParams(Object.entries(f).flatMap(([k, v]) => (v === undefined || v === '' ? [] : [[k, String(v)]]))).toString()

// The parts of the database query builder the filters use
type Query = {
  eq(column: string, value: unknown): Query
  gt(column: string, value: unknown): Query
  gte(column: string, value: unknown): Query
  lt(column: string, value: unknown): Query
  is(column: string, value: null): Query
  or(filters: string): Query
}

export function applyFilters<T>(query: T, f: Filters): T {
  let q = query as unknown as Query
  if (f.number) q = q.eq('number', f.number)
  if (f.q) q = q.or(`name.ilike.%${f.q}%,email.ilike.%${f.q}%,whatsapp.ilike.%${f.q}%,ip.ilike.%${f.q}%`)
  if (f.city) q = f.city === 'Unknown' ? q.is('approx_city', null) : q.eq('approx_city', f.city)
  if (f.house) q = q.eq('house', f.house)
  if (f.first) q = q.eq('priority', f.first === 'yes' ? 'first' : 'standard')
  if (f.photos) q = f.photos === 'yes' ? q.gt('photos', 0) : q.eq('photos', 0)
  if (f.email) q = q.eq('alerts_email', f.email === 'on')
  if (f.whatsapp) q = q.eq('alerts_whatsapp', f.whatsapp === 'on')
  // Days are India days
  if (f.from) q = q.gte('created_at', `${f.from}T00:00:00+05:30`)
  if (f.to) q = q.lt('created_at', new Date(Date.parse(`${f.to}T00:00:00+05:30`) + 86400000).toISOString())
  for (const p of preferenceFilters) {
    const v = f[p.key]
    if (v) q = q.eq(p.column, v)
  }
  return q as unknown as T
}

// Every member matching the filters, a page at a time (the database hands back at most 1,000 rows per request)
export async function allMembers<K extends keyof ReservationRow>(columns: K[], filters: Filters = {}) {
  const rows: Pick<ReservationRow, K>[] = []
  for (let from = 0; ; from += 1000) {
    const query = db().from('reservations').select(columns.join(', ')).order('number').range(from, from + 999)
    const { data, error } = await applyFilters(query, filters)
    if (error) throw error
    rows.push(...(data as unknown as Pick<ReservationRow, K>[]))
    if (data.length < 1000) return rows
  }
}

export type CityCount = { city: string; region: string | null; country: string | null; members: number }

// Members by approximate city, most first. Members whose city couldn't be worked out are grouped as "Unknown".
export async function cities(filters: Filters = {}) {
  const counts = new Map<string, CityCount>()
  for (const r of await allMembers(['approx_city', 'approx_region', 'approx_country'], filters)) {
    const key = [r.approx_city, r.approx_region, r.approx_country].join('|')
    const c = counts.get(key) ?? { city: r.approx_city ?? 'Unknown', region: r.approx_region, country: r.approx_country, members: 0 }
    c.members++
    counts.set(key, c)
  }
  return [...counts.values()].sort((a, b) => b.members - a.members || a.city.localeCompare(b.city))
}

// How many members match a filter (or all of them)
export async function countMembers(filter?: (q: ReturnType<typeof countQuery>) => ReturnType<typeof countQuery>) {
  const { count, error } = await (filter ? filter(countQuery()) : countQuery())
  if (error) throw error
  return count ?? 0
}
const countQuery = () => db().from('reservations').select('*', { count: 'exact', head: true })

// Dates as the team reads them: India time, e.g. "2 Oct 2026, 11:07 am"
export const indiaTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
