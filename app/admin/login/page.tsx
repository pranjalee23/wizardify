import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/AdminForms'
import { currentAdmin } from '@/lib/server/admin'
import s from '../admin.module.css'

export const metadata: Metadata = { title: 'Sign in' }

export default async function AdminLogin() {
  if (await currentAdmin()) redirect('/admin')
  return (
    <main className={s.login}>
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <img src="/images/logo.webp" width={720} height={266} alt="Wizardify" style={{ width: 160, height: 'auto' }} />
        <h1 className={s.title} style={{ fontSize: 18 }}>
          ADMIN SIGN-IN
        </h1>
        <LoginForm />
      </div>
    </main>
  )
}
