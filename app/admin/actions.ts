'use server'

import { createElement } from 'react'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { refresh } from 'next/cache'
import { z } from 'zod'
import AdminCode from '@/emails/AdminCode'
import { randomUUID } from 'node:crypto'
import { CURRENT_DROP } from '@/lib/drops'
import { MAX_PREVIEWS, MAX_VIDEO_MB, videoTypes, type VideoType } from '@/lib/previews'
import { ROLES, can, checkSignInCode, currentAdmin, endSession, newSignInCode, startSession, type Permission, type Role } from '@/lib/server/admin'
import { notifyTeam } from '@/lib/server/alerts'
import { sendEmail } from '@/lib/server/email'
import { allMembers, applyFilters, readFilters } from '@/lib/server/members'
import { sendDropAlerts, sendPreviewReady } from '@/lib/server/reservationEmails'
import { reservationNumber, siteUrl } from '@/lib/server/reservations'
import { db, PHOTO_BUCKET, PREVIEW_BUCKET } from '@/lib/server/supabase'

// Everything the admin pages can change. Each action checks the signed-in admin's role itself: these
// can be called directly, not just from the pages.

export type AdminState = { error?: string; notice?: string; step?: 'code'; email?: string } | null

const emailAddress = z.string().trim().toLowerCase().pipe(z.email().max(254))
const text = (form: FormData, name: string) => {
  const v = form.get(name)
  return typeof v === 'string' ? v.trim() : ''
}

// The admin making the request, if their role allows this
async function allowed(permission: Permission) {
  const admin = await currentAdmin()
  return admin && can(admin, permission) ? admin : null
}
const notAllowed = { error: "You don't have permission to do that." }

// Signing in, step 1: email a code. Says the same thing whether or not the address is an admin's.
export async function requestCode(_: AdminState, form: FormData): Promise<AdminState> {
  const email = emailAddress.safeParse(text(form, 'email'))
  if (!email.success) return { error: 'Please enter a valid email address.' }
  const code = await newSignInCode(email.data)
  if (code) {
    const site = await siteUrl()
    after(() => sendEmail({ to: email.data, subject: `Your Wizardify admin code: ${code}`, react: createElement(AdminCode, { code, site }) }))
  }
  return { step: 'code', email: email.data, notice: 'If that address belongs to an admin, a code is on its way. It works for 10 minutes.' }
}

// Signing in, step 2: check the code and start the session
export async function verifyCode(_: AdminState, form: FormData): Promise<AdminState> {
  const email = emailAddress.safeParse(text(form, 'email'))
  const code = text(form, 'code').replace(/\D/g, '')
  if (!email.success) return { error: 'Please start again with your email address.' }
  const admin = code.length === 6 ? await checkSignInCode(email.data, code) : undefined
  if (!admin) return { step: 'code', email: email.data, error: "That code isn't right, or it has expired. Check it, or ask for a new one." }
  await startSession(admin.id)
  redirect('/admin')
}

export async function signOut() {
  await endSession()
  redirect('/admin/login')
}

// A member's name and drop alerts
export async function updateMember(_: AdminState, form: FormData): Promise<AdminState> {
  if (!(await allowed('members.edit'))) return notAllowed
  const number = Number(text(form, 'number'))
  const name = z.string().trim().min(1).max(100).safeParse(text(form, 'name'))
  if (!name.success) return { error: 'Please keep the name between 1 and 100 characters.' }
  const { error } = await db()
    .from('reservations')
    .update({ name: name.data, alerts_email: form.get('alerts_email') === 'on', alerts_whatsapp: form.get('alerts_whatsapp') === 'on' })
    .eq('number', number)
  if (error) return { error: 'Something went wrong. Please try again.' }
  refresh()
  return { notice: 'Saved.' }
}

// Deletes a member and their photos, once the reservation number is typed to confirm
export async function deleteMember(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await allowed('members.delete')
  if (!admin) return notAllowed
  const number = Number(text(form, 'number'))
  const folder = reservationNumber(number)
  if (text(form, 'confirm').toUpperCase() !== folder) return { error: `Type ${folder} to confirm.` }
  const bucket = db().storage.from(PHOTO_BUCKET)
  const { data: files } = await bucket.list(folder, { limit: 100 })
  if (files?.length) await bucket.remove(files.map((f) => `${folder}/${f.name}`))
  const { error } = await db().from('reservations').delete().eq('number', number)
  if (error) return { error: 'Something went wrong. Please try again.' }
  after(() => notifyTeam(`🗑️ ${folder} was deleted by ${admin.email}.`))
  redirect('/admin')
}

// The team: adding admins, changing roles, removing admins. There's always at least one super admin.

const role = z.enum(Object.keys(ROLES) as [Role, ...Role[]])

async function superAdmins() {
  const { count } = await db().from('admins').select('*', { count: 'exact', head: true }).eq('role', 'super_admin')
  return count ?? 0
}

export async function addAdmin(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await allowed('team.manage')
  if (!admin) return notAllowed
  const email = emailAddress.safeParse(text(form, 'email'))
  const newRole = role.safeParse(text(form, 'role'))
  if (!email.success || !newRole.success) return { error: 'Please enter an email address and choose a role.' }
  const { error } = await db().from('admins').insert({ email: email.data, role: newRole.data })
  if (error) return { error: error.code === '23505' ? `${email.data} is already on the team.` : 'Something went wrong. Please try again.' }
  after(() => notifyTeam(`👤 ${admin.email} added ${email.data} as ${ROLES[newRole.data].label}.`))
  refresh()
  return { notice: `Added ${email.data}. They can now sign in at /admin with that address.` }
}

export async function changeRole(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await allowed('team.manage')
  if (!admin) return notAllowed
  const id = text(form, 'id')
  const newRole = role.safeParse(text(form, 'role'))
  if (!newRole.success) return { error: 'Please choose a role.' }
  const { data: target } = await db().from('admins').select('email, role').eq('id', id).maybeSingle()
  if (!target) return { error: 'That admin no longer exists.' }
  if (target.role === 'super_admin' && newRole.data !== 'super_admin' && (await superAdmins()) <= 1) {
    return { error: 'The team needs at least one super admin. Make someone else super admin first.' }
  }
  const { error } = await db().from('admins').update({ role: newRole.data }).eq('id', id)
  if (error) return { error: 'Something went wrong. Please try again.' }
  after(() => notifyTeam(`👤 ${admin.email} made ${target.email} ${ROLES[newRole.data].label}.`))
  refresh()
  return { notice: `${target.email} is now ${ROLES[newRole.data].label}.` }
}

export async function removeAdmin(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await allowed('team.manage')
  if (!admin) return notAllowed
  const id = text(form, 'id')
  if (id === admin.id) return { error: "You can't remove yourself." }
  const { data: target } = await db().from('admins').select('email, role').eq('id', id).maybeSingle()
  if (!target) return { error: 'That admin no longer exists.' }
  if (target.role === 'super_admin' && (await superAdmins()) <= 1) return { error: 'The team needs at least one super admin.' }
  await db().from('admin_codes').delete().eq('email', target.email)
  const { error } = await db().from('admins').delete().eq('id', id)
  if (error) return { error: 'Something went wrong. Please try again.' }
  after(() => notifyTeam(`👤 ${admin.email} removed ${target.email} from the admin team.`))
  refresh()
  return { notice: `Removed ${target.email}.` }
}

// Drop alerts: sends the current drop's alert by email to the members picked on /admin/alerts (or to
// everyone matching the filters). Only members with email alerts on who haven't had this drop's
// alert are sent it, and each send is recorded, so nobody gets it twice.
export async function sendDropAlert(_: AdminState, form: FormData): Promise<AdminState> {
  const admin = await allowed('alerts.send')
  if (!admin) return notAllowed
  const eligible = { email: 'on', alert: 'not-sent' } as const
  type Member = { id: string; number: number; email: string; name: string | null }
  let members: Member[] = []
  if (form.get('all') === 'yes') {
    const filters = readFilters(Object.fromEntries(new URLSearchParams(text(form, 'filters'))))
    members = await allMembers(['id', 'number', 'email', 'name'], { ...filters, ...eligible })
  } else {
    const ids = form.getAll('id').filter((v): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/.test(v))
    if (!ids.length) return { error: 'Select at least one member.' }
    for (let i = 0; i < ids.length; i += 200) {
      const { data, error } = await applyFilters(db().from('reservations').select('id, number, email, name').in('id', ids.slice(i, i + 200)), eligible)
      if (error) return { error: 'Something went wrong. Please try again.' }
      members.push(...data)
    }
  }
  if (!members.length) return { notice: 'Nobody to send to: they have all had this alert already, or have email alerts off.' }
  if (members.length > 1000) return { error: 'Please send to 1,000 members or fewer at a time.' }

  const sent = await sendDropAlerts(members)
  const done = members.filter((_, i) => sent[i])
  for (let i = 0; i < done.length; i += 200) {
    await db()
      .from('reservations')
      .update({ drop_alert: CURRENT_DROP.key, drop_alert_at: new Date().toISOString() })
      .in('id', done.slice(i, i + 200).map((m) => m.id))
  }
  const failed = members.length - done.length
  const people = (n: number) => `${n} member${n === 1 ? '' : 's'}`
  after(() => notifyTeam(`📣 ${admin.email} sent the drop alert (${CURRENT_DROP.label}) to ${people(done.length)}${failed ? `; ${failed} didn't send` : ''}.`))
  refresh()
  return failed
    ? { error: `Sent to ${people(done.length)}. ${failed} didn't send (Telegram has the reason); they're still selectable to try again.` }
    : { notice: `Sent to ${people(done.length)}.` }
}

// Previews: the team uploads a member's preview video straight to private storage (with a link this
// signs), then sends it, which emails the member. A new preview can go when there's none yet, or when
// the member asked for changes, up to MAX_PREVIEWS.

async function previewMember(number: number) {
  const { data: r } = await db().from('reservations').select('id, number, email, name').eq('number', number).maybeSingle()
  if (!r) return null
  const { data: previews } = await db().from('previews').select('round, status').eq('reservation_id', r.id).order('round')
  const latest = previews?.at(-1)
  return { r, latest, next: (latest?.round ?? 0) + 1, canSend: !latest || (latest.status === 'changes' && latest.round < MAX_PREVIEWS) }
}

export async function previewUploadLink(number: number, file: { type: string; size: number }): Promise<{ url: string; path: string } | { error: string }> {
  if (!(await allowed('previews.send'))) return notAllowed
  if (!(file.type in videoTypes)) return { error: 'Previews need to be MP4, MOV or WebM videos.' }
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) return { error: `Videos can be up to ${MAX_VIDEO_MB} MB. Try exporting it smaller (1080p is plenty).` }
  const m = await previewMember(number)
  if (!m) return { error: 'That member no longer exists.' }
  if (!m.canSend) return { error: 'A new preview can go once the member asks for changes.' }
  const path = `${reservationNumber(number)}/round-${m.next}-${randomUUID()}.${videoTypes[file.type as VideoType]}`
  const { data, error } = await db().storage.from(PREVIEW_BUCKET).createSignedUploadUrl(path)
  if (error) return { error: 'Something went wrong. Please try again.' }
  return { url: data.signedUrl, path }
}

export async function sendPreview(number: number, path: string): Promise<AdminState> {
  const admin = await allowed('previews.send')
  if (!admin) return notAllowed
  const m = await previewMember(number)
  if (!m) return { error: 'That member no longer exists.' }
  if (!m.canSend) return { error: 'A new preview can go once the member asks for changes.' }
  const folder = reservationNumber(number)
  if (!path.startsWith(`${folder}/round-${m.next}-`)) return { error: 'That upload is for someone else. Please upload again.' }
  const { data: files } = await db().storage.from(PREVIEW_BUCKET).list(folder, { limit: 100 })
  if (!files?.some((f) => `${folder}/${f.name}` === path)) return { error: "The video didn't finish uploading. Please try again." }
  const { error } = await db().from('previews').insert({ reservation_id: m.r.id, round: m.next, video_path: path, sent_by: admin.email })
  if (error) return { error: 'Something went wrong. Please try again.' }
  await db().from('reservations').update({ preview_status: 'sent' }).eq('id', m.r.id)
  const emailed = await sendPreviewReady(m.r, m.next)
  after(() => notifyTeam(`🎬 ${admin.email} sent ${folder} their ${m.next > 1 ? `updated preview (round ${m.next})` : 'preview'}.`))
  refresh()
  return emailed
    ? { notice: `Sent. ${m.r.name ?? 'The member'} has been emailed a link to watch it.` }
    : { error: "The preview is saved, but the email didn't send. Use \"Email them again\" in a moment." }
}

export async function resendPreview(_: AdminState, form: FormData): Promise<AdminState> {
  if (!(await allowed('previews.send'))) return notAllowed
  const m = await previewMember(Number(text(form, 'number')))
  if (!m?.latest || m.latest.status !== 'sent') return { error: 'There is no preview waiting for this member.' }
  return (await sendPreviewReady(m.r, m.latest.round)) ? { notice: 'Emailed again.' } : { error: "The email didn't send. Please try again shortly." }
}
