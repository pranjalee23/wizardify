import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PortraitFrame from '@/components/PortraitFrame'
import Framed from '@/components/Framed'
import Candle from '@/components/Candle'
import Check from '@/components/Check'
import { routes } from '@/lib/routes'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './frame.module.css'

export const metadata: Metadata = { title: 'The Wizardify Frame' }

const features = [
  { text: 'Ornate, handcrafted frame design', d: 'M12 3a9 9 0 1 0 0.01 0M12 7a5 5 0 1 0 0.01 0M12 1v3M12 20v3M1 12h3M20 12h3' },
  { text: 'Portrait orientation display', d: 'M7 2h10v20H7zM9.5 4.5h5v15h-5z' },
  { text: 'Your personalised moving portrait', d: 'M12 4a4 4 0 1 0 0.01 0M4 21c0-4 4-6 8-6s8 2 8 6' },
  { text: 'Ready to hang', d: 'M12 2v5M8 9l4-2 4 2M5 9h14v13H5z' },
  { text: 'Plugs into a standard power outlet', d: 'M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5' },
]

const included = ['Wizardify frame', 'Your personalised portrait (video)', 'Wall mounting kit', 'Power adapter and cable', 'Setup guide']

export default function FramePage() {
  return (
    <PageShell sky={<NightSky scene="chamber" />} minHeight={2780}>
      <Nav active="frame" />

      <section className={`${layout.container} ${s.hero}`}>
        <div className={s.intro} data-reveal="0">
          <h1 className={`${ui.shimmer} ${s.title}`}>THE WIZARDIFY FRAME</h1>
          <p className={s.lede}>A portrait that moves. A frame that feels like it belongs in another world.</p>
        </div>
        <div className={s.showcase}>
          <div className={s.stage} data-reveal="1">
            <PortraitFrame width={440} height={590} className={s.portrait}>
              <button type="button" className={s.play} aria-label="Watch it move">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5l12 7-12 7z" />
                </svg>
              </button>
            </PortraitFrame>
            <Candle className={s.candleA} scale={0.7} delay={0} />
            <Candle className={s.candleB} scale={0.5} delay={0.6} variant="b" />
            <Candle className={s.candleC} scale={0.6} delay={1.1} />
          </div>
          <ul className={s.features}>
            {features.map((f, i) => (
              <li key={f.text} className={s.feature} data-reveal={String(2 + i)}>
                <span className={s.featureIcon}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E8C77E" strokeWidth="1.4" aria-hidden="true">
                    <path d={f.d} />
                  </svg>
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.closer}>
        <div className={`${layout.container} ${s.closerInner}`}>
          <h2 className={`${ui.shimmer} ${s.closerTitle}`} data-reveal="0">
            A CLOSER LOOK
          </h2>
          <div className={s.views}>
            <figure className={s.view} data-reveal="1">
              <div className={s.viewBox}>
                <img className={s.front} src="/images/frame-front.png" alt="Front view of the frame with a portrait of a witch and her owl" />
              </div>
              <figcaption className={s.viewCaption}>FRONT VIEW</figcaption>
            </figure>
            <figure className={s.view} data-reveal="2">
              <div className={`${s.viewBox} ${s.viewBox3d}`}>
                <div className={s.turn}>
                  <img className={s.side} src="/images/frame-front.png" alt="Side view of the frame" />
                  <div className={s.edge} />
                </div>
              </div>
              <figcaption className={s.viewCaption}>SIDE VIEW</figcaption>
            </figure>
            <figure className={s.view} data-reveal="3">
              <div className={`${s.viewBox} ${s.viewBoxDetail}`}>
                <img className={s.detail} src="/images/frame-detail.jpg" alt="Close-up of the carved corner ornament" />
                <div className={s.detailShade} />
              </div>
              <figcaption className={s.viewCaption}>DETAIL</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={`${layout.container} ${s.specs}`}>
        <div className={s.dims} data-reveal="0">
          <h2 className={`${ui.shimmer} ${s.dimsTitle}`}>DIMENSIONS</h2>
          <div className={s.dimsFigure}>
            <Framed width={302} float={false}>
              <img src="/images/portrait.jpg" alt="The frame at actual proportions" />
            </Framed>
            <div className={s.ruleV}>
              <div className={s.ruleVLine} />
            </div>
            <div className={s.labelV}>49.9 cm</div>
            <div className={s.ruleH}>
              <div className={s.ruleHLine} />
            </div>
            <div className={s.labelH}>30.2 cm</div>
          </div>
        </div>
        <div className={`${ui.paperCard} ${s.included}`} data-reveal="1">
          <h2 className={s.includedTitle}>WHAT'S INCLUDED</h2>
          <div className={s.includedList}>
            {included.map((item) => (
              <div key={item} className={s.includedItem}>
                <Check size={22} />
                {item}
              </div>
            ))}
          </div>
          <div className={s.buy}>
            <span className={s.price}>[₹ PRICE]</span>
            <Link href={routes.drop} className={`${ui.pill} ${ui.dark} ${s.buyBtn}`}>
              RESERVE YOUR PORTRAIT
            </Link>
          </div>
        </div>
      </section>

      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
