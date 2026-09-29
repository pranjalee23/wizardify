import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Arrow from '@/components/Arrow'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './how.module.css'

export const metadata: Metadata = { title: 'How it works, Wizardify' }

const steps: { title: string; src: string | null }[] = [
  { title: 'Choose\nYour House', src: null },
  { title: 'Tell Us\nYour Story', src: null },
  { title: 'Send Us\nYour Photos', src: null },
  { title: 'We Create\nYour Portrait', src: null },
  { title: 'We Frame\nthe Magic', src: '/images/frame-front.png' },
  { title: 'It Arrives\nat Your Door', src: null },
]

export default function HowItWorksPage() {
  return (
    <PageShell sky={<NightSky castle />} skyClassName={s.sky} minHeight={1440}>
      <Nav active="how" />
      <section className={`${layout.container} ${s.section}`}>
        <h1 className={`${ui.shimmer} ${s.title}`} data-reveal="0">
          YOUR JOURNEY
          <br />
          TO THE FRAME
        </h1>
        <p className={s.lede} data-reveal="1">
          From your story to your wall. Here's how the magic happens.
        </p>
        <ol className={s.steps}>
          {steps.map((st, i) => (
            <li key={st.title} className={s.step} data-reveal={String(Math.min(1 + i, 6))}>
              {i > 0 && (
                <div className={s.arrow}>
                  <svg width="44" height="14" viewBox="0 0 44 14" aria-hidden="true">
                    <path d="M0 7 H38" stroke="#D9B26A" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
                    <path d="M34 2 L41 7 L34 12" fill="none" stroke="#D9B26A" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
              {st.src ? (
                <img className={s.art} src={st.src} alt="" style={{ animationDelay: `-${i * 0.6}s` }} />
              ) : (
                <div className={`${s.art} ${s.placeholder}`} style={{ animationDelay: `-${i * 0.6}s` }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#D9B26A" />
                  </svg>
                </div>
              )}
              <div className={s.num}>{i + 1}</div>
              <div className={s.stepTitle}>{st.title}</div>
            </li>
          ))}
        </ol>
        <Link href={routes.drop} className={`${ui.paperBtn} ${s.cta}`} data-reveal="5">
          RESERVE YOUR PORTRAIT
          <Arrow />
        </Link>
      </section>
      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
