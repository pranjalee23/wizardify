import { NextResponse, type NextRequest } from 'next/server'
import { notifyTeam } from '@/lib/server/alerts'
import { readUnsubscribeToken, reservationNumber } from '@/lib/server/reservations'
import { db } from '@/lib/server/supabase'

// One-click unsubscribe (RFC 8058): what Gmail, Yahoo and Apple Mail call when a member presses their
// Unsubscribe button. It stops drop alerts by email. The link in the email footer opens /unsubscribe
// instead, where a member can choose.
export async function POST(request: NextRequest) {
  const id = readUnsubscribeToken(request.nextUrl.searchParams.get('t') ?? '')
  if (!id) return NextResponse.json({ error: 'Invalid link' }, { status: 400 })
  const { data, error } = await db().from('reservations').update({ alerts_email: false }).eq('id', id).select('number').maybeSingle()
  if (error) return NextResponse.json({ error: 'Try again later' }, { status: 500 })
  if (data) await notifyTeam(`🔕 ${reservationNumber(data.number)} unsubscribed from email drop alerts.`)
  return NextResponse.json({ ok: true })
}
