import { NextResponse } from 'next/server'
import { alertTeam, notifyProblem, notifyTeam } from '@/lib/server/alerts'
import { LIMITS, WARN, deleteApprovedPhotos, mb, readUsage, removeDeletedMembersPhotos, sendPhotoReminders, summary } from '@/lib/server/daily'

// Runs every morning (vercel.json). Reading the database keeps the free Supabase project from being
// paused for inactivity, and the team is alerted, by email and on Telegram, if it can't be reached
// or passes 70% of the free plan. Then it sends the photo reminders that are due, removes photos of
// deleted members, and posts a summary on Telegram. Vercel's scheduler signs its calls with
// CRON_SECRET; anything else is turned away. ?test=1 sends a test alert instead.
export const maxDuration = 120

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (new URL(request.url).searchParams.get('test') === '1') {
    await alertTeam('Test alert', ['This is a test of the daily check. If you can read this, alerts are working.'])
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

  const full = (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).filter((k) => usage[k] >= LIMITS[k] * WARN)
  if (full.length) {
    await alertTeam('Supabase is over 70% full', [
      ...full.map(
        (k) => `${k === 'storage' ? 'Photo storage' : 'The database'} is at ${mb(usage[k])} of the free plan's ${mb(LIMITS[k])} (${Math.round((usage[k] / LIMITS[k]) * 100)}%).`,
      ),
      "Time to upgrade to Supabase's Pro plan, before uploads or reservations start failing.",
    ])
  }

  // Each job carries on if another fails, and the team hears about the failure
  const attempt = async (job: string, run: () => Promise<number>) => {
    try {
      return await run()
    } catch (e) {
      await notifyProblem(`daily ${job}`, `The daily ${job} failed: ${e instanceof Error ? e.message : String(e)}`)
      return 'failed'
    }
  }
  const reminders = await attempt('photo reminders', sendPhotoReminders)
  const cleaned = await attempt('photo clean-up', removeDeletedMembersPhotos)
  const approvedDeleted = await attempt('deletion of approved members’ photos', deleteApprovedPhotos)
  await notifyTeam(await summary(usage, reminders, cleaned, approvedDeleted))

  return NextResponse.json({ ok: true, database: mb(usage.database), storage: mb(usage.storage), reminders, cleaned, approvedDeleted })
}
