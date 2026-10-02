import 'server-only'
import { promises as dns } from 'node:dns'

// Checks an email address (already in a valid format) is one we can really reach: not a reserved or
// test domain, not a throwaway inbox, not an obvious typo of a big provider, and on a domain that
// receives email. Says what's wrong, or nothing if it's fine.

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

export async function emailProblem(email: string) {
  const [name, domain] = email.split('@')
  const fix = TYPOS[domain] ?? (/\.(con|cmo|ocm)$/.test(domain) ? domain.replace(/\.\w+$/, '.com') : undefined)
  if (fix) return `Did you mean ${name}@${fix}?`
  if (FAKE.test(domain) || THROWAWAY.has(domain)) return 'Please use your own email address, so your drop alerts reach you.'
  if (!(await receivesEmail(domain))) return `We can't find ${domain}. Please check your email address.`
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
