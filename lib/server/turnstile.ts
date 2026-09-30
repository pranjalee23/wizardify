import 'server-only'

// Checks the Cloudflare Turnstile token from the drop form, which keeps bots from reserving (and
// from making the site send emails). Without TURNSTILE_SECRET_KEY the check is skipped.
export async function isHuman(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token }),
  })
  const out = (await res.json().catch(() => ({}))) as { success?: boolean }
  return out.success === true
}
