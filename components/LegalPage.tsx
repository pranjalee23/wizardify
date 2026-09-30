import type { ReactNode } from 'react'
import PageShell from './PageShell'
import NightSky from './NightSky'
import Nav from './Nav'
import Footer from './Footer'
import layout from './layout.module.css'
import ui from './ui.module.css'
import s from './LegalPage.module.css'

export type LegalSection = { title: string; body: ReactNode }

type Props = { title: string; lede: string; updated: string; sections: LegalSection[] }

// The privacy notice and the terms: a titled page of short sections on a dark card
export default function LegalPage({ title, lede, updated, sections }: Props) {
  return (
    <PageShell sky={<NightSky scene="chamber" />} minHeight={1400}>
      <Nav active="home" />
      <main className={`${layout.container} ${s.main}`}>
        <h1 className={`${ui.shimmer} ${s.title}`}>{title}</h1>
        <p className={s.lede}>{lede}</p>
        <p className={s.updated}>Last updated {updated}</p>
        <div className={s.body}>
          {sections.map((sec) => (
            <section key={sec.title} className={s.section}>
              <h2 className={s.heading}>{sec.title}</h2>
              {sec.body}
            </section>
          ))}
        </div>
      </main>
      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
