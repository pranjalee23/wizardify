import 'server-only'
import { randomInt } from 'node:crypto'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { notifyProblem } from './telegram'
import { hmac, isForged, readToken, sameText, signToken } from './signing'
import { db } from './supabase'

// Who can do what on the admin pages. To change a role, add or remove permissions in its list; every
// admin page and action checks these, so nothing else needs touching. Who has which role is kept in
// the admins table, and super admins change it on /admin/team.
export const PERMISSIONS = {
  stats: 'See member counts and cities',
  'members.view': 'See the member list and details',
  'members.photos': "See members' photos",
  'members.edit': "Change members' names and alerts",
  'members.delete': 'Delete members',
  'export.members': 'Download the member list (CSV)',
  'export.cities': 'Download the cities summary (CSV)',
  'alerts.send': 'Send drop alerts',
  'team.manage': 'Add and remove admins, and change their roles',
} as const

export type Permission = keyof typeof PERMISSIONS

export const ROLES = {
  super_admin: { label: 'Super admin', can: Object.keys(PERMISSIONS) as Permission[] },
  manager: {
    label: 'Manager',
    can: ['stats', 'members.view', 'members.photos', 'members.edit', 'export.members', 'export.cities', 'alerts.send'] as Permission[],
  },
  marketing: { label: 'Marketing', can: ['stats', 'export.members', 'export.cities', 'alerts.send'] as Permission[] },
  viewer: { label: 'Viewer', can: ['stats', 'members.view'] as Permission[] },
} as const

export type Role = keyof typeof ROLES
export type Admin = { id: string; email: string; role: Role }

export const can = (admin: Admin, permission: Permission) => ROLES[admin.role].can.includes(permission)

// Signed-in admins carry a cookie with their id, signed and good for 48 hours. Every request looks the
// admin up again, so removing someone or changing their role takes effect straight away.
const COOKIE = 'wz_admin'
const SESSION = 48 * 60 * 60

export async function startSession(id: string) {
  ;(await cookies()).set(COOKIE, signToken('admin', id, SESSION), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION,
  })
}

export async function endSession() {
  ;(await cookies()).delete(COOKIE)
}

export const currentAdmin = cache(async (): Promise<Admin | null> => {
  const token = (await cookies()).get(COOKIE)?.value
  const id = token && readToken('admin', token)
  if (token && !id && isForged('admin', token)) {
    await notifyProblem('admin-forged', 'Someone tried to open the admin with a forged sign-in cookie. They were turned away.')
  }
  if (!id) return null
  const { data } = await db().from('admins').select('id, email, role').eq('id', id).maybeSingle()
  return data as Admin | null
})

// For admin pages: sends anyone not signed in to the sign-in page, and hides pages their role can't use
export async function requireAdmin(permission?: Permission) {
  const admin = await currentAdmin()
  if (!admin) redirect('/admin/login')
  if (permission && !can(admin, permission)) notFound()
  return admin
}

// Sign-in codes: 6 digits, emailed, good for 10 minutes and 3 tries. Only a keyed hash is stored.
const CODE_MINUTES = 10
const MAX_TRIES = 3
const codeHash = (email: string, code: string) => hmac(`admin-code.${email}.${code}`)

// A fresh code for an admin's email, or nothing if it isn't an admin's (or one was sent under a minute
// ago). The caller says the same thing either way, so the page doesn't reveal who is an admin.
export async function newSignInCode(email: string) {
  const { data: admin } = await db().from('admins').select('id').eq('email', email).maybeSingle()
  if (!admin) return undefined
  const { data: last } = await db().from('admin_codes').select('sent_at').eq('email', email).maybeSingle()
  if (last && Date.now() - Date.parse(last.sent_at) < 60 * 1000) return undefined
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const { error } = await db()
    .from('admin_codes')
    .upsert({ email, code_hash: codeHash(email, code), expires_at: new Date(Date.now() + CODE_MINUTES * 60 * 1000).toISOString(), attempts: 0, sent_at: new Date().toISOString() })
  if (error) throw error
  return code
}

// The admin a correct code belongs to. Each code works once.
export async function checkSignInCode(email: string, code: string) {
  const { data: row } = await db().from('admin_codes').select('code_hash, expires_at, attempts').eq('email', email).maybeSingle()
  if (!row || Date.parse(row.expires_at) < Date.now() || row.attempts >= MAX_TRIES) return undefined
  if (!sameText(row.code_hash, codeHash(email, code))) {
    await db().from('admin_codes').update({ attempts: row.attempts + 1 }).eq('email', email)
    if (row.attempts + 1 >= MAX_TRIES) {
      await notifyProblem(`admin-code-${email}`, `Someone entered ${MAX_TRIES} wrong admin sign-in codes for ${email}. That code is now locked.`)
    }
    return undefined
  }
  await db().from('admin_codes').delete().eq('email', email)
  const { data: admin } = await db().from('admins').select('id, email, role').eq('email', email).maybeSingle()
  if (admin) await db().from('admins').update({ last_login_at: new Date().toISOString() }).eq('id', admin.id)
  return admin as Admin | null
}
