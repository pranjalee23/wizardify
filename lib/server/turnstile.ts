import 'server-only'

// Checks the Cloudflare Turnstile token from the drop form, which keeps bots from reserving (and from
// making the site send emails). "unchecked" means there was no check to make: Turnstile isn't set up
// (no TURNSTILE_SECRET_KEY), or Cloudflare couldn't be reached, in which case real visitors shouldn't
// be turned away.
export async function humanCheck(token: string): Promise<'human' | 'bot' | 'unchecked'> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return 'unchecked'
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return 'unchecked'
    const out = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    if (out.success) return 'human'
    // Cloudflare's own failure, not a verdict on the visitor
    if (out['error-codes']?.includes('internal-error')) return 'unchecked'
    return 'bot'
  } catch {
    return 'unchecked'
  }
}
