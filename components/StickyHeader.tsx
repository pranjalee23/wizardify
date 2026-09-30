'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = { className: string; hiddenClassName: string; children: ReactNode }

// How far the page must move before the header reacts, so small wobbles don't toggle it
const THRESHOLD = 6
// How long the header stays put after a jump to a section, while the page scrolls there
const PIN_MS = 900

// The site header. It sticks to the top of the window, slides away while you scroll down and slides
// back as soon as you scroll up. It stays in view at the top of the page, while its menu is open,
// when it has keyboard focus, and after following a link to a section (such as Pricing), even though
// that jump scrolls the page down.
export default function StickyHeader({ className, hiddenClassName, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const header = ref.current
    if (!header) return
    let lastY = window.scrollY
    let raf = 0
    // A page that opens at a section (or is being scrolled to one) starts with the header in view
    let pinnedUntil = performance.now() + PIN_MS

    const pin = () => {
      pinnedUntil = performance.now() + PIN_MS
      setHidden(false)
    }

    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = Math.min(Math.max(window.scrollY, 0), Math.max(max, 0))
      if (performance.now() < pinnedUntil || y <= header.offsetHeight) {
        lastY = y
        setHidden(false)
        return
      }
      const d = y - lastY
      if (Math.abs(d) < THRESHOLD) return
      lastY = y
      const menuOpen = header.querySelector('[aria-expanded="true"]')
      setHidden(d > 0 && !menuOpen)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (!link) return
      pin()
      // Next skips a link to the address you're already on, so go to the section ourselves
      const url = new URL(link.href)
      if (url.pathname === location.pathname && url.hash === location.hash) {
        requestAnimationFrame(() => document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView())
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('hashchange', pin)
    document.addEventListener('click', onClick, true)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('hashchange', pin)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return (
    <header ref={ref} className={hidden ? `${className} ${hiddenClassName}` : className} onFocus={() => setHidden(false)}>
      {children}
    </header>
  )
}
