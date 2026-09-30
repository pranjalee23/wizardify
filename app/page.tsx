import PageShell from '@/components/PageShell'
import Sky from '@/components/Sky'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import HomeHouses from '@/components/HomeHouses'
import HomeMagic from '@/components/HomeMagic'
import Footer from '@/components/Footer'
import layout from '@/components/layout.module.css'
import s from './page.module.css'

export default function Home() {
  return (
    <PageShell sky={<Sky />} skyClassName={s.sky} minHeight={2940}>
      <Nav active="home" />
      <Hero />
      <HomeHouses />
      <HomeMagic />
      <div className={layout.spacer} />
      <Footer />
    </PageShell>
  )
}
