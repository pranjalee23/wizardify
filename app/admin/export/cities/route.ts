import { countryName, regionName } from '@/lib/regions'
import { can, currentAdmin } from '@/lib/server/admin'
import { csvResponse, toCsv } from '@/lib/server/csv'
import { cities, readFilters } from '@/lib/server/members'

// Members by approximate city (those matching the dashboard's filters, or all), as a CSV that opens in
// Excel, for admins whose role allows it
export async function GET(request: Request) {
  const admin = await currentAdmin()
  if (!admin || !can(admin, 'export.cities')) return new Response('Not found', { status: 404 })
  const rows = (await cities(readFilters(Object.fromEntries(new URL(request.url).searchParams)))).map((c) => [c.city, regionName(c.country, c.region), countryName(c.country), c.members])
  return csvResponse('cities', toCsv(['City', 'State', 'Country', 'Members'], rows))
}
