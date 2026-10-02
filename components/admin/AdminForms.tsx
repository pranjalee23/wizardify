'use client'

import { useActionState } from 'react'
import { addAdmin, changeRole, deleteMember, removeAdmin, requestCode, updateMember, verifyCode, type AdminState } from '@/app/admin/actions'
import s from '@/app/admin/admin.module.css'

// The admin pages' forms. Each sends to a server action, which checks the admin's role.

function Message({ state }: { state: AdminState }) {
  const text = state?.error ?? state?.notice
  return (
    <div aria-live="polite">
      {text && <p className={state?.error ? `${s.message} ${s.error}` : s.message}>{text}</p>}
    </div>
  )
}

const roleOptions = (roles: { id: string; label: string }[]) =>
  roles.map((r) => (
    <option key={r.id} value={r.id}>
      {r.label}
    </option>
  ))

// Sign-in: an email address, then the code emailed to it
export function LoginForm() {
  const [sent, request, requesting] = useActionState(requestCode, null)
  const [checked, verify, verifying] = useActionState(verifyCode, null)
  const email = checked?.email ?? sent?.email

  if (sent?.step !== 'code') {
    return (
      <form action={request} className={s.loginCard}>
        <label className={s.field}>
          Your email address
          <input name="email" type="email" required autoComplete="email" className={s.input} />
        </label>
        <button className={s.btnGold} disabled={requesting}>
          {requesting ? 'Sending…' : 'Email me a sign-in code'}
        </button>
        <Message state={sent} />
      </form>
    )
  }
  return (
    <div className={s.loginCard}>
      <Message state={checked ?? sent} />
      <form action={verify} className={s.loginCard} style={{ padding: 0, border: 'none' }}>
        <input type="hidden" name="email" value={email} />
        <label className={s.field}>
          The 6-digit code we emailed to {email}
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoFocus
            className={`${s.input} ${s.code}`}
          />
        </label>
        <button className={s.btnGold} disabled={verifying}>
          {verifying ? 'Checking…' : 'Sign in'}
        </button>
      </form>
      <form action={request}>
        <input type="hidden" name="email" value={email} />
        <button className={s.btn} disabled={requesting} style={{ width: '100%' }}>
          Send a new code
        </button>
      </form>
    </div>
  )
}

type Member = { number: number; name: string | null; alerts_email: boolean; alerts_whatsapp: boolean }

export function MemberEditForm({ member }: { member: Member }) {
  const [state, save, pending] = useActionState(updateMember, null)
  return (
    <form action={save} className={s.card}>
      <h2 className={s.subtitle}>Edit</h2>
      <input type="hidden" name="number" value={member.number} />
      <div className={s.row}>
        <label className={s.field}>
          Name
          <input name="name" defaultValue={member.name ?? ''} required maxLength={100} className={s.input} />
        </label>
        <label className={s.check}>
          <input type="checkbox" name="alerts_email" defaultChecked={member.alerts_email} /> Email drop alerts
        </label>
        <label className={s.check}>
          <input type="checkbox" name="alerts_whatsapp" defaultChecked={member.alerts_whatsapp} /> WhatsApp drop alerts
        </label>
        <button className={s.btnGold} disabled={pending}>
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
      <Message state={state} />
    </form>
  )
}

export function DeleteMemberForm({ number, label }: { number: number; label: string }) {
  const [state, remove, pending] = useActionState(deleteMember, null)
  return (
    <form action={remove} className={s.card}>
      <h2 className={s.subtitle}>Delete this member</h2>
      <p className={s.muted}>This deletes their reservation and photos for good. Type {label} to confirm.</p>
      <input type="hidden" name="number" value={number} />
      <div className={s.row}>
        <input name="confirm" placeholder={label} required className={s.input} />
        <button className={s.btnDanger} disabled={pending}>
          {pending ? 'Deleting…' : 'Delete member'}
        </button>
      </div>
      <Message state={state} />
    </form>
  )
}

export function AddAdminForm({ roles }: { roles: { id: string; label: string }[] }) {
  const [state, add, pending] = useActionState(addAdmin, null)
  return (
    <form action={add} className={s.card}>
      <h2 className={s.subtitle}>Add someone</h2>
      <div className={s.row}>
        <input name="email" type="email" required placeholder="their@email.com" className={s.input} style={{ minWidth: 240 }} />
        <select name="role" defaultValue="viewer" className={s.select}>
          {roleOptions(roles)}
        </select>
        <button className={s.btnGold} disabled={pending}>
          {pending ? 'Adding…' : 'Add to the team'}
        </button>
      </div>
      <Message state={state} />
    </form>
  )
}

export function RoleForm({ id, role, roles }: { id: string; role: string; roles: { id: string; label: string }[] }) {
  const [state, save, pending] = useActionState(changeRole, null)
  return (
    <form action={save}>
      <div className={s.row}>
        <input type="hidden" name="id" value={id} />
        <select name="role" defaultValue={role} className={s.select} aria-label="Role">
          {roleOptions(roles)}
        </select>
        <button className={s.btn} disabled={pending}>
          Save
        </button>
      </div>
      <Message state={state} />
    </form>
  )
}

export function RemoveAdminForm({ id }: { id: string }) {
  const [state, remove, pending] = useActionState(removeAdmin, null)
  return (
    <form action={remove}>
      <input type="hidden" name="id" value={id} />
      <button className={s.btnDanger} disabled={pending}>
        Remove
      </button>
      <Message state={state} />
    </form>
  )
}
