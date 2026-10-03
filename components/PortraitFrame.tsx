import type { CSSProperties, ReactNode } from 'react'
import s from './PortraitFrame.module.css'

type Props = {
  width: number
  height: number
  src?: string
  alt?: string
  className?: string
  children?: ReactNode
}

export default function PortraitFrame({
  width,
  height,
  src = '/images/portrait.jpg',
  alt = 'A living portrait of a young witch holding a wand before a castle at dusk',
  className,
  children,
}: Props) {
  // Up to `width` wide, narrower when its column is, always keeping the frame's proportions.
  const style = { '--pw': `${width}px`, aspectRatio: `${width} / ${height}` } as CSSProperties
  return (
    <div className={className ? `${s.group} ${className}` : s.group} style={style}>
      <div className={s.window}>
        <img className={s.painting} src={src} alt={alt} fetchPriority="high" />
      </div>
      <img className={s.gilt} src="/images/frame.webp" alt="" fetchPriority="high" />
      {children}
    </div>
  )
}
