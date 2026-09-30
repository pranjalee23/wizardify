import { NextResponse } from 'next/server'
import { alertTeam } from '@/lib/server/alerts'
import { db } from '@/lib/server/supabase'

// Runs once a day (vercel.json). Reading the database keeps the free Supabase project from being
// paused for inactivity, and the team is alerted if the database can't be reached or is filling
// up. Vercel's scheduler signs its calls with CRON_SECRET; anything else is turned away.
// ?test=1 sends a test alert, to check the alerts arrive.

// The free plan's limits; warn at 70%, time to upgrade
const LIMITS = { database: 500 * 1024 ** 2, storage: 1024 ** 3 }
const WARN = 0.7

const mb = (bytes: number) => `${Math.round(bytes / 1024 ** 2)} MB`

// The space used, or what went wrong (including the database not answering within 10 seconds)
async function readUsage() {
  try {
    const { data, error } = await db().rpc('usage').abortSignal(AbortSignal.timeout(10_000))
    if (error) return new Error(error.message)
    return data?.[0] ?? new Error('No data returned')
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e))
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (new URL(request.url).searchParams.get('test') === '1') {
    await alertTeam('Test alert', ['This is a test of the daily database check. If you can read this, alerts are working.'])
    return NextResponse.json({ ok: true, test: true })
  }

  const usage = await readUsage()
  if (usage instanceof Error) {
    await alertTeam('The database is down', [
      "The daily check couldn't reach the Supabase database, so the reservation form isn't working.",
      'It may have been paused. Open the project in the Supabase dashboard (supabase.com/dashboard) and restore it.',
      `Error: ${usage.message}`,
    ])
    return NextResponse.json({ ok: false, error: usage.message }, { status: 503 })
  }

  const used = { database: usage.database_bytes, storage: usage.storage_bytes }
  const full = (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).filter((k) => used[k] >= LIMITS[k] * WARN)
  if (full.length) {
    await alertTeam('Supabase is over 70% full', [
      ...full.map((k) => `${k === 'storage' ? 'Photo storage' : 'The database'} is at ${mb(used[k])} of the free plan's ${mb(LIMITS[k])} (${Math.round((used[k] / LIMITS[k]) * 100)}%).`),
      "Time to upgrade to Supabase's Pro plan, before uploads or reservations start failing.",
    ])
  }
  return NextResponse.json({ ok: true, database: mb(used.database), storage: mb(used.storage) })
}
