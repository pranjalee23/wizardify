import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { signOut } from './actions'
import { ROLES, can, currentAdmin } from '@/lib/server/admin'
import s from './admin.module.css'

export const metadata: Metadata = { title: { template: '%s · Wizardify admin', default: 'Wizardify admin' }, robots: { index: false, follow: false } }

// The admin pages' frame: a bar with the pages this admin's role can use. Each page checks the role
// itself; this only decides which links to show.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await currentAdmin()
  return (
    <div className={s.shell}>
      {admin && (
        <header className={s.bar}>
          <Link href="/admin" className={s.brand}>
            <img src="/images/logo.webp" width={720} height={266} alt="" />
            ADMIN
          </Link>
          <nav className={s.nav}>
            <Link href="/admin">Dashboard</Link>
            {can(admin, 'team.manage') && <Link href="/admin/team">Team</Link>}
          </nav>
          <div className={s.who}>
            <span>
              {admin.email} · {ROLES[admin.role].label}
            </span>
            <form action={signOut}>
              <button className={s.btn}>Sign out</button>
            </form>
          </div>
        </header>
      )}
      {children}
    </div>
  )
}
