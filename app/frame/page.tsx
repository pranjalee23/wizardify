import type { Metadata } from 'next'
import Link from 'next/link'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PortraitFrame from '@/components/PortraitFrame'
import Candle from '@/components/Candle'
import PricingCard from '@/components/PricingCard'
import { frameTiers, startingPrice } from '@/lib/frames'
import Arrow from '@/components/Arrow'
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

const addons = [
  {
    name: 'More Magic',
    text: 'Extra clips or a longer run time, beyond the standard 6 clips and 2 minutes.',
    icon: (
      <>
        <rect x="3" y="6" width="13" height="12" rx="1.5" />
        <path d="M16 10l5-3v10l-5-3z" />
      </>
    ),
  },
  {
    name: 'Enchanted Mode',
    text: 'Motion and sound sensors, so your portrait wakes when someone walks by or speaks.',
    icon: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      </>
    ),
  },
]


export default function FramePage() {
  return (
    <PageShell sky={<NightSky scene="chamber" />} minHeight={3380}>
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

      <section id="pricing" aria-labelledby="pricing-title" className={`${layout.container} ${s.pricing}`}>
        <div className={s.pricingEyebrow} data-reveal="0">
          Pricing
        </div>
        <h2 id="pricing-title" className={`${ui.shimmer} ${s.pricingTitle}`} data-reveal="0">
          CHOOSE YOUR PORTRAIT
        </h2>
        <p className={s.pricingLede} data-reveal="1">
          Two sizes, two frame styles, and a little extra magic if you want it. Prices shown now; you&apos;ll choose when the doors reopen.
        </p>
        <div className={s.plans}>
          {frameTiers.map((t, i) => (
            <div key={t.id} data-reveal={String(1 + i)}>
              <PricingCard tier={t} price={`From ${startingPrice}`} />
            </div>
          ))}
        </div>
        <div className={`${s.pricingEyebrow} ${s.addonsEyebrow}`} data-reveal="0">
          Add a little more magic
        </div>
        <div className={s.addons}>
          {addons.map((a, i) => (
            <div key={a.name} className={`${ui.paperCard} ${s.addon}`} data-reveal={String(1 + i)}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#7A5A22" strokeWidth="1.4" aria-hidden="true" className={s.addonIcon}>
                {a.icon}
              </svg>
              <div className={s.addonText}>
                <h3 className={s.addonName}>{a.name}</h3>
                <p className={s.addonDesc}>{a.text}</p>
              </div>
              {/* Add-on prices are still to be set */}
              <div className={s.addonPrice}>+[₹ PRICE]</div>
            </div>
          ))}
        </div>
        <p className={s.pricingNote}>Classic mode (no sensors) plays your portrait on a gentle loop and is included in the starting price.</p>
        <Link href={routes.drop} className={`${ui.paperBtn} ${ui.glow} ${s.pricingCta}`}>
          RESERVE YOUR PORTRAIT
          <Arrow />
        </Link>
      </section>

      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
