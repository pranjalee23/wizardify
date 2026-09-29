'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { routes } from '@/lib/routes'
import s from './Nav.module.css'

type Item = { id: string; label: string; href: string }

// The menu for tablets and phones, where the header has no room for the links.
export default function NavMenu({ links, active }: { links: readonly Item[]; active: string }) {
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    // The menu is hidden above the tablet breakpoint, so close it if the window grows past it.
    const wide = window.matchMedia('(min-width: 1101px)')
    const onWide = () => wide.matches && setOpen(false)
    document.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      document.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
        className={open ? `${s.burger} ${s.burgerOpen}` : s.burger}
      >
        <span className={s.burgerLine} />
        <span className={s.burgerLine} />
        <span className={s.burgerLine} />
      </button>
      <div className={open ? `${s.scrim} ${s.scrimOpen}` : s.scrim} onClick={close} aria-hidden="true" />
      <nav id="site-menu" aria-label="Main" className={open ? `${s.menu} ${s.menuOpen}` : s.menu}>
        {links.map((l) => {
          const on = l.id === active
          return (
            <Link
              key={l.id}
              href={l.href}
              aria-current={on ? 'page' : 'false'}
              onClick={close}
              className={on ? `${s.menuLink} ${s.menuLinkActive}` : s.menuLink}
            >
              {l.label}
            </Link>
          )
        })}
        <Link href={routes.drop} onClick={close} className={s.menuCta}>
          Reserve Your Place
        </Link>
      </nav>
    </>
  )
}
