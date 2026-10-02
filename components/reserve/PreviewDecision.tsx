'use client'

import { startTransition, useActionState, useState } from 'react'
import { approvePreview, requestChanges } from '@/app/reserve/actions'
import ui from '@/components/ui.module.css'
import FormMessage from './FormMessage'
import r from './reserve.module.css'
import s from './PreviewDecision.module.css'

// Approving a preview, or asking for changes (with how many rounds are left)
export default function PreviewDecision({ changesLeft }: { changesLeft: number }) {
  const [approved, approve, approving] = useActionState(approvePreview, null)
  const [changed, change, changing] = useActionState(requestChanges, null)
  const [asking, setAsking] = useState(false)
  const [notes, setNotes] = useState('')

  return (
    <div className={s.decision}>
      {!asking ? (
        <div className={s.buttons}>
          <button type="button" disabled={approving} onClick={() => startTransition(() => approve())} className={`${ui.pill} ${ui.paper} ${r.cta}`}>
            {approving ? 'APPROVING…' : 'APPROVE MY PORTRAIT'}
          </button>
          {changesLeft > 0 && (
            <button type="button" onClick={() => setAsking(true)} className={`${ui.pill} ${ui.outline} ${r.cta}`}>
              ASK FOR CHANGES
            </button>
          )}
        </div>
      ) : (
        <form
          className={s.changes}
          onSubmit={(e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            startTransition(() => change(form))
          }}
        >
          <label htmlFor="pv-notes" className={s.label}>
            What would you like changed? Be as specific as you can.
          </label>
          <textarea id="pv-notes" name="feedback" rows={5} maxLength={1000} required minLength={5} value={notes} onChange={(e) => setNotes(e.target.value)} className={s.textarea} />
          <p className={s.left}>
            {notes.length} / 1000 · You have {changesLeft === 1 ? 'one round' : `${changesLeft === 2 ? 'two' : changesLeft} rounds`} of changes left.
          </p>
          <div className={s.buttons}>
            <button type="button" onClick={() => setAsking(false)} className={r.skip}>
              Back
            </button>
            <button disabled={changing} className={`${ui.pill} ${ui.paper} ${r.cta}`}>
              {changing ? 'SENDING…' : 'SEND MY CHANGES'}
            </button>
          </div>
        </form>
      )}
      {changesLeft === 0 && !asking && (
        <p className={s.left}>That was your last round of changes. If anything still isn&apos;t right, write to us at hello@wizardify.me.</p>
      )}
      <FormMessage state={approved ?? changed} />
    </div>
  )
}
