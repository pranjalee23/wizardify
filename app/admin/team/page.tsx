import type { Metadata } from 'next'
import { AddAdminForm, RemoveAdminForm, RoleForm } from '@/components/admin/AdminForms'
import { PERMISSIONS, ROLES, requireAdmin, type Permission } from '@/lib/server/admin'
import { indiaTime } from '@/lib/server/members'
import { db } from '@/lib/server/supabase'
import s from '../admin.module.css'

export const metadata: Metadata = { title: 'Team' }

// Who can use the admin, with what role, and what each role allows
export default async function Team() {
  const me = await requireAdmin('team.manage')
  const { data: team, error } = await db().from('admins').select('id, email, role, last_login_at').order('created_at')
  if (error) throw error
  const roles = Object.entries(ROLES).map(([id, r]) => ({ id, label: r.label }))

  return (
    <main className={s.main}>
      <h1 className={s.title}>Team</h1>
      <p className={s.muted}>People added here sign in at /admin with their email address; a code is emailed to them each time.</p>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Last signed in</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {team.map((a) => (
              <tr key={a.id}>
                <td>
                  {a.email}
                  {a.id === me.id && <span className={s.muted}> (you)</span>}
                </td>
                <td>
                  <RoleForm id={a.id} role={a.role} roles={roles} />
                </td>
                <td>{a.last_login_at ? indiaTime(a.last_login_at) : 'Never'}</td>
                <td>{a.id !== me.id && <RemoveAdminForm id={a.id} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddAdminForm roles={roles} />

      <section>
        <h2 className={s.subtitle}>What each role can do</h2>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th />
                {Object.values(ROLES).map((r) => (
                  <th key={r.label}>{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.entries(PERMISSIONS) as [Permission, string][]).map(([p, label]) => (
                <tr key={p}>
                  <td className={s.wrap}>{label}</td>
                  {Object.values(ROLES).map((r) => (
                    <td key={r.label}>{(r.can as readonly Permission[]).includes(p) ? '✓' : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
