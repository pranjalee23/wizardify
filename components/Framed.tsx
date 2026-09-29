import type { CSSProperties, ReactNode } from 'react'
import ui from './ui.module.css'

type Props = { width: number; delay?: number; float?: boolean; className?: string; children: ReactNode }

export default function Framed({ width, delay = 0, float = true, className, children }: Props) {
  const style = { '--w': `${width}px`, '--float-delay': `-${delay}s` } as CSSProperties
  return (
    <div className={`${ui.frame} ${float ? ui.float : ''} ${className ?? ''}`} style={style} data-wand="">
      <div className={ui.window}>{children}</div>
    </div>
  )
}
