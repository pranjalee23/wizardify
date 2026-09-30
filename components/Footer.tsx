import Link from 'next/link'
import { routes } from '@/lib/routes'
import { social } from '@/lib/social'
import s from './Footer.module.css'

const links = [
  { label: 'The Frame', href: routes.frame },
  { label: 'How It Works', href: routes.howItWorks },
  { label: 'The Houses', href: routes.houses },
  { label: 'Gallery', href: routes.gallery },
  { label: 'Pricing', href: routes.pricing },
  { label: 'The Drop', href: routes.drop },
  { label: 'FAQ', href: routes.faq },
]

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.brand}>
            <Link href={routes.home} className={s.home}>
              <img className={s.logo} src="/images/logo.webp" width={720} height={266} alt="Wizardify" />
            </Link>
            <div className={s.tagline}>Pictures were never meant to stay still.</div>
          </div>
          <nav aria-label="Footer" className={s.nav}>
            {links.map((l) => (
              <Link key={l.label} href={l.href} className={s.link}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={s.bottom}>
          <span>© 2026 Wizardify</span>
          <span className={s.more}>
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className={s.social}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
              Instagram
              <span className={s.srOnly}> (opens in a new tab)</span>
            </a>
            <span aria-hidden="true">·</span> YouTube <span aria-hidden="true">·</span>{' '}
            <Link href={routes.privacy} className={s.social}>
              Privacy
            </Link>{' '}
            <span aria-hidden="true">·</span>{' '}
            <Link href={routes.terms} className={s.social}>
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
