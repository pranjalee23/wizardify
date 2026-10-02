import { houseById } from '@/lib/houses'
import { countryName, regionName } from '@/lib/regions'
import { can, currentAdmin } from '@/lib/server/admin'
import { csvResponse, toCsv } from '@/lib/server/csv'
import { allMembers, indiaTime, readFilters } from '@/lib/server/members'
import { reservationNumber } from '@/lib/server/reservations'

// The members matching the dashboard's filters (or all of them), as a CSV that opens in Excel, for
// admins whose role allows it
export async function GET(request: Request) {
  const admin = await currentAdmin()
  if (!admin || !can(admin, 'export.members')) return new Response('Not found', { status: 404 })
  const members = await allMembers([
    'number', 'name', 'email', 'whatsapp', 'house', 'known_for', 'role', 'skyball', 'companion', 'setting', 'wish', 'photos', 'priority',
    'approx_city', 'approx_region', 'approx_country', 'ip', 'alerts_email', 'alerts_whatsapp', 'created_at',
  ], readFilters(Object.fromEntries(new URL(request.url).searchParams)))
  const csv = toCsv(
    ['Reservation', 'Name', 'Email', 'WhatsApp', 'House', 'Known for', 'Role', 'Skyball', 'Companion', 'Setting', 'Wishes', 'Photos', 'First in line', 'City', 'State', 'Country', 'IP address', 'Email alerts', 'WhatsApp alerts', 'Reserved (India time)'],
    members.map((m) => [
      reservationNumber(m.number), m.name, m.email, m.whatsapp, houseById(m.house ?? undefined)?.name ?? '', m.known_for, m.role, m.skyball,
      m.companion, m.setting, m.wish, m.photos, m.priority === 'first' ? 'Yes' : 'No', m.approx_city, regionName(m.approx_country, m.approx_region),
      countryName(m.approx_country), m.ip, m.alerts_email ? 'On' : 'Off', m.alerts_whatsapp ? 'On' : 'Off', indiaTime(m.created_at),
    ]),
  )
  return csvResponse('members', csv)
}
