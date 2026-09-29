import type { ReactNode } from 'react'
import layout from './layout.module.css'

type Props = { sky?: ReactNode; skyClassName?: string; minHeight?: number; children: ReactNode }

export default function PageShell({ sky, skyClassName, minHeight, children }: Props) {
  return (
    <div className={layout.page}>
      {sky && (
        <div className={skyClassName ?? layout.sky} aria-hidden="true">
          {sky}
        </div>
      )}
      <div className={layout.content} style={minHeight ? { minHeight } : undefined}>
        {children}
      </div>
    </div>
  )
}
