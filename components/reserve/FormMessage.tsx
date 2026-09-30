import type { FormState } from '@/app/reserve/actions'
import r from './reserve.module.css'

// Always in the page, so screen readers announce whatever the server says back
export default function FormMessage({ state, className }: { state: FormState; className?: string }) {
  const text = state?.error ?? state?.notice
  return (
    <div aria-live="polite" className={className}>
      {text && <p className={state?.error ? `${r.message} ${r.messageError}` : r.message}>{text}</p>}
    </div>
  )
}
