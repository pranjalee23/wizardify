import 'server-only'
import { promises as dns } from 'node:dns'

// Checks an email address (already in a valid format) is one we can really reach: not a reserved or
// test domain, not a throwaway inbox, on a domain that receives email, and not a likely typo of a big
// provider (which the member can confirm).

// Reserved for examples and testing (example.com, anything.test, …), plus test.com
const FAKE = /(^|\.)(example\.(com|net|org)|test\.com|test|example|invalid|localhost)$/

// Inboxes that vanish after a few minutes, so drop alerts would never arrive
const THROWAWAY = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'sharklasers.com',
  'yopmail.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'maildrop.cc',
])

// Slips of the finger on the providers most people use
const TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'rediffmial.com': 'rediffmail.com',
}

// The providers most members use, for "did you mean…?"
const PROVIDERS = ['gmail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com', 'icloud.com', 'rediffmail.com', 'live.com']

// Real providers that happen to look like one of those, so they're never questioned
const LOOKALIKES = new Set(['ymail.com', 'email.com', 'gmx.com', 'mail.com', 'me.com', 'mac.com', 'aol.com', 'yahoo.in', 'outlook.in', 'live.in'])

// How many letters differ between two words (added, removed or changed)
function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = row
  }
  return prev[b.length]
}

// The provider they probably meant, if the domain is a likely slip of the finger
function meant(domain: string) {
  if (TYPOS[domain]) return TYPOS[domain]
  if (/\.(con|cmo|ocm)$/.test(domain)) return domain.replace(/\.\w+$/, '.com')
  if (PROVIDERS.includes(domain) || LOOKALIKES.has(domain)) return undefined
  return PROVIDERS.find((p) => distance(domain, p) <= 2)
}

// What's wrong with the address, if anything. `error` stops the reservation; a `check` is a likely
// typo, which the member can wave through by pressing Reserve again with the same address (`confirmed`)
export async function emailProblem(email: string, confirmed: boolean): Promise<{ error: string } | { check: string } | undefined> {
  const [name, domain] = email.split('@')
  if (FAKE.test(domain) || THROWAWAY.has(domain)) return { error: 'Please use your own email address, so your drop alerts reach you.' }
  const suggestion = meant(domain)
  if (!(await receivesEmail(domain))) {
    return { error: suggestion ? `Did you mean ${name}@${suggestion}?` : `We can't find ${domain}. Please check your email address.` }
  }
  if (suggestion && !confirmed) return { check: `Did you mean ${name}@${suggestion}? If ${email} is right, press Reserve again.` }
}

// Asks Cloudflare's and Google's public DNS, which say clearly when a domain doesn't exist (some home
// and office routers just never answer)
const resolver = new dns.Resolver({ timeout: 2000, tries: 1 })
resolver.setServers(['1.1.1.1', '8.8.8.8'])

// Whether the domain takes email: it lists mail servers, or (rarely) takes mail itself. A slow or
// failing lookup isn't the visitor's fault, so it lets them through.
async function receivesEmail(domain: string) {
  const within3s = <T>(lookup: Promise<T>) =>
    Promise.race([lookup, new Promise<never>((_, fail) => setTimeout(() => fail(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), 3000))])
  try {
    return (await within3s(resolver.resolveMx(domain))).length > 0
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code
    if (code === 'ENOTFOUND') return false
    if (code === 'ENODATA') {
      try {
        return (await within3s(resolver.resolve4(domain))).length > 0
      } catch {
        return false
      }
    }
    return true
  }
}
