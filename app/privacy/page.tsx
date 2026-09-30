import type { Metadata } from 'next'
import LegalPage, { type LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Privacy notice, Wizardify' }

const contact = 'hello@wizardify.me'

// What we collect, why, who handles it, and how to reach us, as India's Digital Personal Data
// Protection Act asks
const sections: LegalSection[] = [
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
        <p>
          We use trusted service providers to run this site, store your details and photos, and send our emails and WhatsApp messages.
          They handle your details only to provide their service to us.
        </p>
        <p>We never sell your details or share them for advertising.</p>
      </>
    ),
  },
  {
    title: 'Your photos',
    body: (
      <p>
        We use your photos only to create your portrait. They&apos;re kept private and never shown in our gallery or anywhere else without
        your permission. We delete them 3 days after you approve your preview.
      </p>
    ),
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
    body: (
      <p>
        We delete your photos 3 days after you approve your preview. We keep your other details while your reservation or order is open,
        and delete them when you ask us to.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="PRIVACY NOTICE"
      lede="How Wizardify looks after the details you share with us."
      updated="30 September 2026"
      sections={sections}
    />
  )
}
