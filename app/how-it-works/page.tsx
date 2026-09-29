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

const steps = [
  { title: 'Choose\nYour House', src: '/images/step-hat.png' },
  { title: 'Tell Us\nYour Story', src: '/images/step-quill.png' },
  { title: 'Send Us\nYour Photos', src: '/images/step-photos.png' },
  { title: 'We Create\nYour Portrait', src: '/images/step-portrait.png' },
  { title: 'We Frame\nthe Magic', src: '/images/frame-front.png' },
  { title: 'It Arrives\nat Your Door', src: '/images/step-parcel.png' },
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
              <img className={s.art} src={st.src} alt="" style={{ animationDelay: `-${i * 0.6}s` }} />
              <div className={s.num}>{i + 1}</div>
              <div className={s.stepTitle}>{st.title}</div>
            </li>
          ))}
        </ol>
        <Link href={routes.drop} className={`${ui.paperBtn} ${ui.glow} ${s.cta}`} data-reveal="5">
          RESERVE YOUR PORTRAIT
          <Arrow />
        </Link>
      </section>
      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
