import { NextResponse } from 'next/server'
import { readUsage } from '@/lib/server/daily'

// For an outside uptime monitor (e.g. UptimeRobot) to call every few minutes: 200 when the site and
// its database are working, 503 when the database can't be reached. It says nothing else.
export async function GET() {
  const usage = await readUsage()
  return usage instanceof Error ? NextResponse.json({ ok: false }, { status: 503 }) : NextResponse.json({ ok: true })
}
