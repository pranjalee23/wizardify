import 'server-only'
import { sendPhotoReminder } from './reservationEmails'
import { reservationNumber } from './reservations'
import { db, PHOTO_BUCKET } from './supabase'

// The morning jobs, run by app/api/cron/daily

const DAY = 24 * 60 * 60 * 1000

// The free Supabase plan's limits; the team is told to upgrade at 70%
export const LIMITS = { database: 500 * 1024 ** 2, storage: 1024 ** 3 }
export const WARN = 0.7

export const mb = (bytes: number) => `${Math.round(bytes / 1024 ** 2)} MB`

// The space used, or what went wrong (including the database not answering within 10 seconds)
export async function readUsage() {
  try {
    const { data, error } = await db().rpc('usage').abortSignal(AbortSignal.timeout(10_000))
    if (error) return new Error(error.message)
    const u = data?.[0]
    return u ? { database: u.database_bytes, storage: u.storage_bytes } : new Error('No data returned')
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e))
  }
}

// Members without photos get a reminder 3 days after reserving, and a last one 2 weeks after
// (at least a week after the first), unless they've turned off email alerts. At most 40 a day, to
// stay well inside Resend's free plan (100 emails a day).
const REMINDERS_PER_DAY = 40

export async function sendPhotoReminders() {
  const { data, error } = await db()
    .from('reservations')
    .select('id, number, email, created_at, photo_reminders, photo_reminded_at')
    .eq('photos', 0)
    .eq('alerts_email', true)
    .lt('photo_reminders', 2)
    .lte('created_at', new Date(Date.now() - 3 * DAY).toISOString())
    .order('created_at')
    .limit(500)
  if (error) throw error
  const now = Date.now()
  const due = data
    .filter(
      (r) =>
        r.photo_reminders === 0 ||
        (now - Date.parse(r.created_at) >= 14 * DAY && now - Date.parse(r.photo_reminded_at ?? r.created_at) >= 7 * DAY),
    )
    .slice(0, REMINDERS_PER_DAY)

  let sent = 0
  for (const r of due) {
    if (!(await sendPhotoReminder(r, r.photo_reminders === 1))) continue
    const { error: saveError } = await db()
      .from('reservations')
      .update({ photo_reminders: r.photo_reminders + 1, photo_reminded_at: new Date().toISOString() })
      .eq('id', r.id)
    if (saveError) throw saveError
    sent++
    // Resend takes about 2 emails a second
    await new Promise((res) => setTimeout(res, 600))
  }
  return sent
}

// When the team deletes a member in the Supabase dashboard, their photos stay in storage. This
// removes the photo folders (WZ-0001 and so on) whose reservation no longer exists. Folders with any
// other name are left alone.
export async function removeDeletedMembersPhotos() {
  const bucket = db().storage.from(PHOTO_BUCKET)
  const folders: string[] = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await bucket.list('', { limit: 1000, offset })
    if (error) throw error
    folders.push(...data.filter((e) => !e.id && /^WZ-\d+$/.test(e.name)).map((e) => e.name))
    if (data.length < 1000) break
  }

  const numbers = folders.map((f) => Number(f.slice(3)))
  const kept = new Set<number>()
  for (let i = 0; i < numbers.length; i += 200) {
    const { data, error } = await db().from('reservations').select('number').in('number', numbers.slice(i, i + 200))
    if (error) throw error
    data.forEach((r) => kept.add(r.number))
  }

  let removed = 0
  for (const n of numbers.filter((n) => !kept.has(n))) {
    const folder = reservationNumber(n)
    const { data: files, error } = await bucket.list(folder, { limit: 100 })
    if (error) throw error
    const paths = files.filter((f) => f.id).map((f) => `${folder}/${f.name}`)
    if (paths.length) {
      const { error: removeError } = await bucket.remove(paths)
      if (removeError) throw removeError
    }
    removed++
  }
  return removed
}

// The morning summary for the team's Telegram
export async function summary(usage: { database: number; storage: number }, reminders: number | string, cleaned: number | string) {
  const count = async (filter?: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
    const { count, error } = await (filter ? filter(base()) : base())
    return error ? '?' : (count ?? 0)
  }
  const base = () => db().from('reservations').select('*', { count: 'exact', head: true })
  const [total, fresh, withPhotos] = await Promise.all([
    count(),
    count((q) => q.gte('created_at', new Date(Date.now() - DAY).toISOString())),
    count((q) => q.gt('photos', 0)),
  ])
  return [
    '☀️ Good morning! Here is today’s check.',
    `Members: ${total} (${fresh} new since yesterday)`,
    `With photos: ${withPhotos}`,
    `Photo reminders sent: ${reminders}`,
    ...(cleaned === 0 ? [] : [`Photos removed for deleted members: ${cleaned}`]),
    `Storage: ${mb(usage.storage)} of ${mb(LIMITS.storage)} · Database: ${mb(usage.database)} of ${mb(LIMITS.database)}`,
  ].join('\n')
}
