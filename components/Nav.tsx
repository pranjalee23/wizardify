import Link from 'next/link'
import { routes } from '@/lib/routes'
import s from './Nav.module.css'

const links = [
  { id: 'frame', label: 'The Frame', href: routes.frame },
  { id: 'how', label: 'How It Works', href: routes.howItWorks },
  { id: 'houses', label: 'The Houses', href: routes.houses },
  { id: 'gallery', label: 'Gallery', href: routes.gallery },
  { id: 'faq', label: 'FAQ', href: routes.faq },
] as const

export type NavId = 'home' | 'create' | (typeof links)[number]['id']

export default function Nav({ active = 'home' }: { active?: NavId }) {
  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Link href={routes.home} className={s.brand}>
          Wizardify
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#D9B26A" />
          </svg>
        </Link>
        <nav aria-label="Main" className={s.nav}>
          {links.map((l) => {
            const on = l.id === active
            return (
              <Link
                key={l.id}
                href={l.href}
                aria-current={on ? 'page' : 'false'}
                className={on ? `${s.link} ${s.linkActive}` : s.link}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
        <Link href={routes.drop} className={s.cta}>
          Reserve Your Place
        </Link>
      </div>
    </header>
  )
}
