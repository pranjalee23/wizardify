import Link from 'next/link'
import { routes } from '@/lib/routes'
import s from './Footer.module.css'

const links = [
  { label: 'The Frame', href: routes.frame },
  { label: 'How It Works', href: routes.howItWorks },
  { label: 'The Houses', href: routes.houses },
  { label: 'Gallery', href: routes.gallery },
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
          <span>Instagram · YouTube · Privacy · Terms</span>
        </div>
      </div>
    </footer>
  )
}
