'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { sendDropAlert } from '@/app/admin/actions'
import s from '@/app/admin/admin.module.css'

export type AlertRow = {
  id: string
  label: string
  number: number
  name: string | null
  email: string
  city: string | null
  house: string
  first: boolean
  emailOff: boolean
  sent: string | null
}

type Props = { rows: AlertRow[]; matching: number; filters: string }

// Picking who gets the drop alert, like selecting emails in Gmail: tick members one by one, tick the
// box at the top for everyone on this page, then "select all" for everyone matching the filters.
// Members who've already had this drop's alert, or turned off email alerts, can't be ticked.
export default function AlertPicker({ rows, matching, filters }: Props) {
  const [state, send, pending] = useActionState(sendDropAlert, null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [everyone, setEveryone] = useState(false)
  const open = rows.filter((r) => !r.sent && !r.emailOff)
  const allOnPage = open.length > 0 && open.every((r) => picked.has(r.id))
  const count = everyone ? matching : picked.size

  const toggle = (id: string) => {
    setEveryone(false)
    setPicked((p) => {
      const next = new Set(p)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const togglePage = () => {
    setEveryone(false)
    setPicked(allOnPage ? new Set() : new Set(open.map((r) => r.id)))
  }

  return (
    <form
      action={send}
      onSubmit={(e) => {
        if (!window.confirm(`Send the drop alert by email to ${count} member${count === 1 ? '' : 's'}?`)) e.preventDefault()
      }}
    >
      <input type="hidden" name="filters" value={filters} />
      {everyone ? <input type="hidden" name="all" value="yes" /> : [...picked].map((id) => <input key={id} type="hidden" name="id" value={id} />)}

      <div className={`${s.card} ${s.actionBar}`}>
        <span>
          <strong>{count.toLocaleString('en-IN')}</strong> selected
        </span>
        <a href="/admin/alerts/preview" target="_blank" rel="noopener noreferrer" className={s.btn}>
          Preview the email
        </a>
        <button className={s.btnGold} disabled={pending || count === 0}>
          {pending ? 'Sending…' : `Send drop alert${count ? ` to ${count.toLocaleString('en-IN')}` : ''}`}
        </button>
        <div aria-live="polite">
          {(state?.error ?? state?.notice) && <p className={state?.error ? `${s.message} ${s.error}` : s.message}>{state?.error ?? state?.notice}</p>}
        </div>
      </div>

      {allOnPage && matching > open.length && (
        <p className={s.selectAll}>
          {everyone ? (
            <>
              All {matching.toLocaleString('en-IN')} members matching the filters are selected.{' '}
              <button type="button" className={s.link} onClick={() => (setEveryone(false), setPicked(new Set()))}>
                Clear selection
              </button>
            </>
          ) : (
            <>
              All {open.length} on this page are selected.{' '}
              <button type="button" className={s.link} onClick={() => setEveryone(true)}>
                Select all {matching.toLocaleString('en-IN')} matching the filters
              </button>
            </>
          )}
        </p>
      )}

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>
                <input type="checkbox" aria-label="Select everyone on this page" checked={allOnPage} disabled={!open.length} onChange={togglePage} />
              </th>
              <th>Reservation</th>
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>House</th>
              <th>First in line</th>
              <th>Alert</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.emailOff ? s.off : picked.has(r.id) || (everyone && !r.sent) ? s.picked : undefined}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${r.label}`}
                    checked={!r.sent && !r.emailOff && (everyone || picked.has(r.id))}
                    disabled={Boolean(r.sent) || r.emailOff}
                    onChange={() => toggle(r.id)}
                  />
                </td>
                <td>
                  <Link href={`/admin/members/${r.number}`}>{r.label}</Link>
                </td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.city ?? '—'}</td>
                <td>{r.house}</td>
                <td>{r.first ? 'Yes' : 'No'}</td>
                <td>{r.sent ? `Sent ${r.sent}` : r.emailOff ? 'Email alerts off' : 'Not sent'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  )
}
