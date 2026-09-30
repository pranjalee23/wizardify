import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import GalleryGrid from '@/components/GalleryGrid'
import LitImage from '@/components/LitImage'
import LivingOwl from '@/components/LivingOwl'
import { galleryOwl } from '@/lib/owls'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './gallery.module.css'

export const metadata: Metadata = { title: 'Gallery, Wizardify' }

export default function GalleryPage() {
  return (
    <PageShell sky={<NightSky scene="chamber" />} minHeight={1920}>
      <Nav active="gallery" />
      <section className={`${layout.container} ${s.section}`}>
        <h1 className={`${ui.shimmer} ${s.title}`} data-reveal="0">
          THE MOVING PORTRAIT GALLERY
        </h1>
        <p className={s.lede} data-reveal="1">
          A collection of witches, wizards and magical stories.
        </p>
        <GalleryGrid />
        <LivingOwl owl={galleryOwl} className={s.decoRight} />
        <LitImage className={s.decoLeft} src="/images/deco-gallery-left.png" bleed />
        <nav aria-label="Gallery pages" className={s.pager} data-reveal="0">
          <button type="button" aria-label="Previous page" className={`${s.pageBtn} ${s.pageOff}`}>
            &lt;
          </button>
          <button type="button" aria-current="page" className={`${ui.paper} ${s.pageBtn} ${s.pageOn}`}>
            1
          </button>
          <button type="button" className={`${s.pageBtn} ${s.pageOff}`}>
            2
          </button>
          <button type="button" className={`${s.pageBtn} ${s.pageOff}`}>
            3
          </button>
          <button type="button" aria-label="Next page" className={`${s.pageBtn} ${s.pageOff}`}>
            &gt;
          </button>
        </nav>
      </section>
      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
