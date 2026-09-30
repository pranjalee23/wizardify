import type { Metadata } from 'next'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import s from './privacy.module.css'

export const metadata: Metadata = { title: 'Privacy notice, Wizardify' }

const contact = 'hello@wizardify.me'

// What we collect, why, who handles it, and how to reach us, as India's Digital Personal Data
// Protection Act asks
const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: 'What we collect',
    body: (
      <ul>
        <li>When you reserve: your email address, your WhatsApp number, and the house you chose, if any.</li>
        <li>If you complete your profile: your name and city.</li>
        <li>If you share them: your portrait preferences, your wishes, and photos of yourself.</li>
        <li>
          One cookie that keeps your reservation open in your browser. We don&apos;t use advertising or tracking cookies.
        </li>
      </ul>
    ),
  },
  {
    title: 'Why we use it',
    body: (
      <ul>
        <li>To hold your reservation and send you its confirmation.</li>
        <li>To send you drop alerts by email and WhatsApp when the doors reopen, as you agreed when you reserved.</li>
        <li>To create your portrait from your photos and preferences.</li>
        <li>To keep the reservation form safe from bots.</li>
      </ul>
    ),
  },
  {
    title: 'Who handles it for us',
    body: (
      <>
        <p>These services store or process your details only to provide their service to us:</p>
        <ul>
          <li>Supabase, our database and photo storage</li>
          <li>Vercel, which hosts this site</li>
          <li>Resend, which sends our emails</li>
          <li>Meta, for WhatsApp messages</li>
          <li>Cloudflare, which checks the reservation form for bots</li>
        </ul>
        <p>We never sell your details or share them for advertising.</p>
      </>
    ),
  },
  {
    title: 'Your photos',
    body: <p>We use your photos only to create your portrait. They&apos;re kept private and never shown in our gallery or anywhere else without your permission.</p>,
  },
  {
    title: 'Your choices',
    body: (
      <>
        <p>You can ask us at any time to see, correct or delete your details, or to stop sending you drop alerts. You can also reply STOP to any WhatsApp message from us.</p>
        <p>
          Write to us at <a href={`mailto:${contact}`}>{contact}</a> and we&apos;ll take care of it. This is also where to raise any concern
          about how we handle your details.
        </p>
      </>
    ),
  },
  {
    title: 'How long we keep it',
    body: <p>We keep your details while your reservation or order is open, and delete them when you ask us to.</p>,
  },
]

export default function PrivacyPage() {
  return (
    <PageShell sky={<NightSky scene="chamber" />} minHeight={1400}>
      <Nav active="home" />
      <main className={`${layout.container} ${s.main}`}>
        <h1 className={`${ui.shimmer} ${s.title}`}>PRIVACY NOTICE</h1>
        <p className={s.lede}>How Wizardify looks after the details you share with us.</p>
        <p className={s.updated}>Last updated 30 September 2026</p>
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
