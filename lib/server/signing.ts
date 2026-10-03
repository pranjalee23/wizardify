import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

// Tokens the server hands out and later trusts: an id and an expiry, signed with RESERVATION_SECRET so
// they can't be forged or altered. Each is signed for its purpose, so a token made for one thing (an
// unsubscribe link, say) is useless for another (opening a reservation, or the admin pages).
type Purpose = 'continue' | 'unsubscribe' | 'admin'

export function hmac(text: string) {
  const secret = process.env.RESERVATION_SECRET
  if (!secret) throw new Error('RESERVATION_SECRET is not set (see .env.example)')
  return createHmac('sha256', secret).update(text).digest('base64url')
}

export function sameText(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function signToken(purpose: Purpose, id: string, seconds: number) {
  const payload = `${id}.${Math.floor(Date.now() / 1000) + seconds}`
  return `${payload}.${hmac(`${purpose}.${payload}`)}`
}

// True when a token's signature is wrong, so it was made up or altered (rather than just expired)
export function isForged(purpose: Purpose, token: string) {
  const [id, expires, sig] = token.split('.')
  return !id || !expires || !sig || !sameText(sig, hmac(`${purpose}.${id}.${expires}`))
}

export function readToken(purpose: Purpose, token: string) {
  const [id, expires, sig] = token.split('.')
  if (!id || !expires || !sig) return undefined
  if (!sameText(sig, hmac(`${purpose}.${id}.${expires}`))) return undefined
  if (Number(expires) * 1000 < Date.now()) return undefined
  return id
}
