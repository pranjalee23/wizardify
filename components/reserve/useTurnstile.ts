'use client'

import { useEffect, useRef } from 'react'

// Cloudflare Turnstile, the bot check on the drop form. Most visitors never see it; it only shows a
// box when it needs them to click. Off unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.

type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  getResponse: (id: string) => string | undefined
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: Turnstile
    onTurnstileLoad?: () => void
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

let loading: Promise<Turnstile> | undefined
const load = () =>
  (loading ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile)
    window.onTurnstileLoad = () => resolve(window.turnstile!)
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad'
    script.async = true
    script.onerror = () => {
      loading = undefined
      reject(new Error('Turnstile did not load'))
    }
    document.head.appendChild(script)
  }))

export function useTurnstile() {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | undefined>(undefined)

  useEffect(() => {
    const el = box.current
    if (!SITE_KEY || !el) return
    let gone = false
    load()
      .then((t) => {
        if (!gone) widget.current = t.render(el, { sitekey: SITE_KEY, theme: 'dark', appearance: 'interaction-only' })
      })
      .catch(() => {})
    return () => {
      gone = true
      if (widget.current) window.turnstile?.remove(widget.current)
      widget.current = undefined
    }
  }, [])

  return {
    box,
    // The check's answer, waiting up to a few seconds if it hasn't finished yet
    async token() {
      if (!SITE_KEY) return ''
      for (let i = 0; i < 40; i++) {
        const t = widget.current && window.turnstile?.getResponse(widget.current)
        if (t) return t
        await new Promise((r) => setTimeout(r, 200))
      }
      return ''
    },
    // Each answer works once, so get a fresh one after the form is sent
    reset() {
      if (widget.current) window.turnstile?.reset(widget.current)
    },
  }
}
