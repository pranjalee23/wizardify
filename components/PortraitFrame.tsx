import type { ReactNode } from 'react'
import s from './PortraitFrame.module.css'

type Props = {
  width: number
  height: number
  src?: string
  alt?: string
  children?: ReactNode
}

export default function PortraitFrame({
  width,
  height,
  src = '/images/portrait.jpg',
  alt = 'A living portrait of a young witch holding a wand before a castle at dusk',
  children,
}: Props) {
  return (
    <div className={s.group} style={{ width, height }}>
      <div className={s.window}>
        <img className={s.painting} src={src} alt={alt} />
      </div>
      <img className={s.gilt} src="/images/frame.png" alt="" />
      {children}
    </div>
  )
}
