import { NextResponse, type NextRequest } from 'next/server'
import { routes } from '@/lib/routes'
import { holdReservation, readContinueToken } from '@/lib/server/reservations'
import { db } from '@/lib/server/supabase'

// The "continue your reservation" link from an email: holds the reservation in this browser, then
// opens the first step still to fill in (or the certificate, if it's all done). Photo reminders add
// to=photos, to open the photos step.
export async function GET(request: NextRequest) {
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url))
  const id = readContinueToken(request.nextUrl.searchParams.get('t') ?? '')
  if (!id) return to(`${routes.drop}?link=expired`)

  const { data: r, error } = await db().from('reservations').select('id, priority, photos').eq('id', id).maybeSingle()
  if (error) throw error
  if (!r) return to(routes.drop)

  await holdReservation(r.id)
  if (request.nextUrl.searchParams.get('to') === 'photos') return to(routes.reserve(3))
  if (request.nextUrl.searchParams.get('to') === 'preview') return to(routes.preview)
  if (r.priority !== 'first') return to(routes.reserve(2))
  if (!r.photos) return to(routes.reserve(3))
  return to(routes.reserve(4))
}
