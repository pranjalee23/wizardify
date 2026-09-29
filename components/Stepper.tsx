import layout from './layout.module.css'
import s from './Stepper.module.css'

const names = ['House', 'About You', 'Magical Life', 'Photos', 'Preview']

export default function Stepper({ step }: { step: number }) {
  return (
    <div className={`${layout.container} ${s.wrap}`}>
      <ol aria-label="Progress" className={s.list}>
        {names.map((n, i) => {
          const k = i + 1
          const done = k < step
          const on = k === step
          return (
            <li key={n} aria-current={on ? 'step' : 'false'} className={s.item}>
              {i > 0 && <div className={`${s.line} ${k <= step ? s.lineOn : ''}`} />}
              <div className={`${s.circle} ${on ? s.circleOn : done ? s.circleDone : s.circleTodo}`}>{done ? '✓' : k}</div>
              <div className={`${s.label} ${on ? s.labelOn : ''}`}>{n}</div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
