import { iso31662 } from 'iso-3166'

// Full state names for the region codes in members' approximate locations (from their connection when
// they reserved): Karnataka, California, England. India's are listed here, old and new codes; the
// rest come from the ISO 3166-2 list, without accents, with a few familiar English names.
const INDIA: Record<string, string> = {
  AN: 'Andaman and Nicobar Islands', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh',
  CG: 'Chhattisgarh', CT: 'Chhattisgarh', DH: 'Dadra and Nagar Haveli and Daman and Diu', DN: 'Dadra and Nagar Haveli and Daman and Diu',
  DD: 'Dadra and Nagar Haveli and Daman and Diu', DL: 'Delhi', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh',
  JK: 'Jammu and Kashmir', JH: 'Jharkhand', KA: 'Karnataka', KL: 'Kerala', LA: 'Ladakh', LD: 'Lakshadweep', MP: 'Madhya Pradesh',
  MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram', NL: 'Nagaland', OD: 'Odisha', OR: 'Odisha', PY: 'Puducherry',
  PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TG: 'Telangana', TS: 'Telangana', TR: 'Tripura', UP: 'Uttar Pradesh',
  UK: 'Uttarakhand', UT: 'Uttarakhand', WB: 'West Bengal',
}

const countries = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null

const FAMILIAR: Record<string, string> = { 'AE-DU': 'Dubai', 'AE-AZ': 'Abu Dhabi', 'AE-SH': 'Sharjah', 'AE-AJ': 'Ajman' }

let world: Map<string, string> | undefined
const plain = (name: string) => name.normalize('NFD').replace(/\p{Diacritic}/gu, '')

export function regionName(country: string | null, region: string | null) {
  if (!region) return ''
  if (country === 'IN' && INDIA[region]) return INDIA[region]
  const code = `${country}-${region}`
  world ??= new Map(iso31662.map((s) => [s.code, plain(s.name)]))
  return FAMILIAR[code] ?? world.get(code) ?? region
}

export const countryName = (country: string | null) => (country ? (countries?.of(country) ?? country) : '')
