'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { routes } from '@/lib/routes'
import layout from './layout.module.css'
import s from './PaperBand.module.css'

export default function PaperBand() {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={s.wrap}>
      <section className={`${s.band} ${open ? s.open : ''}`}>
        <div className={`${layout.container} ${s.inner}`}>
          <div className={s.stamp}>
            FIRST DROP
            <br />
            SOLD OUT
          </div>
          <p className={s.text}>Reserve your place for the next chapter.</p>
          <Link href={routes.drop} className={s.cta}>
            RESERVE YOUR PLACE
          </Link>
        </div>
      </section>
    </div>
  )
}
