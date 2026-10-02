import Link from 'next/link'
import s from './reserve.module.css'

type Props = { step: 1 | 2; label: string; note: string; back: string; wide?: boolean }

export default function ReserveHeader({ step, label, note, back, wide = false }: Props) {
  const width = wide ? s.wide : s.narrow
  return (
    <>
      <Link href={back} className={`${s.back} ${width}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back
      </Link>
      <div className={`${s.progress} ${width}`}>
        <div className={s.progressText}>
          <span className={s.progressLabel}>
            STEP {step} OF 2 · {label}
          </span>
          <span className={s.progressNote}>{note}</span>
        </div>
        <div className={s.bars} aria-hidden="true">
          {[1, 2].map((k) => (
            <div key={k} className={k <= step ? `${s.bar} ${s.barOn}` : s.bar} />
          ))}
        </div>
      </div>
    </>
  )
}
