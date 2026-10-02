import Link from 'next/link'
import { routes } from '@/lib/routes'
import NavMenu from './NavMenu'
import StickyHeader from './StickyHeader'
import s from './Nav.module.css'

const links = [
  { id: 'frame', label: 'The Frame', href: routes.frame },
  { id: 'how', label: 'How It Works', href: routes.howItWorks },
  { id: 'houses', label: 'The Houses', href: routes.houses },
  { id: 'gallery', label: 'Gallery', href: routes.gallery },
  { id: 'pricing', label: 'Pricing', href: routes.pricing },
  { id: 'faq', label: 'FAQ', href: routes.faq },
] as const

export type NavId = 'home' | (typeof links)[number]['id']

export default function Nav({ active = 'home' }: { active?: NavId }) {
  return (
    <StickyHeader className={s.header} hiddenClassName={s.headerHidden}>
      <div className={s.inner}>
        <Link href={routes.home} className={s.brand}>
          <img className={s.logo} src="/images/logo.webp" width={720} height={266} alt="Wizardify" />
        </Link>
        {/* The wand gives the menu links its full halo; everything else on the site gets a softer one */}
        <nav aria-label="Main" className={s.nav} data-wand-halo="full">
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
          Reserve<span className={s.ctaMore}> Your Place</span>
        </Link>
        <NavMenu links={links} active={active} />
      </div>
    </StickyHeader>
  )
}
