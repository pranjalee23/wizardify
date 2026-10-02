import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { type LegalSection } from '@/components/LegalPage'
import { routes } from '@/lib/routes'

export const metadata: Metadata = { title: 'Terms, Wizardify' }

const contact = 'hello@wizardify.me'
const mail = <a href={`mailto:${contact}`}>{contact}</a>

// The terms of reserving and ordering, matching what the FAQ and The Frame page promise (previews,
// changes, delivery, damage and warranty). Keep them in step when either changes.
const sections: LegalSection[] = [
  {
    title: 'About these terms',
    body: (
      <p>
        These terms apply when you use wizardify.me, reserve a place in a drop, or order a Wizardify portrait. By doing any of these, you
        agree to them. How we handle your details is set out in our <Link href={routes.privacy}>privacy notice</Link>.
      </p>
    ),
  },
  {
    title: 'Reserving a place',
    body: (
      <ul>
        <li>Reserving is free. It doesn&apos;t involve any payment or commit you to buy anything.</li>
        <li>
          Each drop is limited, so a reservation doesn&apos;t guarantee a frame. It gives you early access before the doors open to
          everyone, and members who complete all their portrait preferences are first in line.
        </li>
        <li>One reservation per email address. We may remove reservations that look automated or made with false details.</li>
        <li>You can ask us to remove your reservation at any time.</li>
      </ul>
    ),
  },
  {
    title: 'Your photos',
    body: (
      <ul>
        <li>
          Only send photos of yourself, or of someone who has agreed to it, such as the person you&apos;re gifting a portrait to. If a
          photo shows a child, you must be their parent or guardian, or have their permission.
        </li>
        <li>You must have the right to share the photos you send us.</li>
        <li>
          You allow us to use your photos only to create your portrait and its preview. We never show them, or your portrait, in our
          gallery or anywhere else without asking you first.
        </li>
        <li>We delete your photos 7 days after you approve your preview.</li>
      </ul>
    ),
  },
  {
    title: 'Your preview',
    body: (
      <ul>
        <li>Your preview is usually ready within 7 days of us receiving your photos.</li>
        <li>You can ask for up to two rounds of changes to your preview.</li>
        <li>We don&apos;t frame or ship your portrait until you approve your preview.</li>
      </ul>
    ),
  },
  {
    title: 'Orders and payment',
    body: (
      <ul>
        <li>You pay only after you&apos;ve approved your preview.</li>
        <li>
          Prices are in Indian rupees and include all taxes. Delivery is free within India; for international orders, the delivery cost is
          shown at checkout before you pay.
        </li>
        <li>We accept UPI, all major credit and debit cards, and net banking.</li>
        <li>Your order is confirmed once your payment goes through and we&apos;ve emailed you a confirmation.</li>
      </ul>
    ),
  },
  {
    title: 'Delivery',
    body: (
      <p>
        Once you&apos;ve approved your preview and paid, we frame your portrait and ship it within 7 days. We ship across India and internationally.
        Delivery is free within India, and international delivery costs are shown at checkout. Delivery times are estimates, and
        we&apos;ll keep you posted if anything changes.
      </p>
    ),
  },
  {
    title: 'Cancellations and returns',
    body: (
      <ul>
        <li>You don&apos;t pay anything until you&apos;ve approved your preview. If you decide not to go ahead, simply don&apos;t check out.</li>
        <li>
          Once you&apos;ve approved and paid, your portrait is made for you alone, so we can&apos;t cancel your order or take back a
          finished frame, unless it&apos;s damaged or faulty (see below).
        </li>
        <li>Any refund goes back to the payment method you used.</li>
      </ul>
    ),
  },
  {
    title: 'Damage and faults',
    body: (
      <ul>
        <li>If your frame arrives damaged, email us a photo within 48 hours of delivery and we&apos;ll send a replacement at no cost.</li>
        <li>
          Every frame has a 6-month warranty from delivery. If it stops working in that time through no fault of yours, we&apos;ll repair
          or replace it. The warranty doesn&apos;t cover accidental damage, water damage or repairs by anyone else.
        </li>
        <li>To make a claim, write to us at {mail}.</li>
      </ul>
    ),
  },
  {
    title: 'Using this site',
    body: (
      <p>
        Please don&apos;t misuse the site: for example, by trying to reach anyone else&apos;s reservation, reserving with automated tools,
        or interfering with how the site works.
      </p>
    ),
  },
  {
    title: 'Our work',
    body: (
      <>
        <p>
          The site, its designs and the portraits we create belong to Wizardify. Your portrait is yours to keep and enjoy, and to share with
          family and friends.
        </p>
        <p>Wizardify is an independent product and is not affiliated with or endorsed by Warner Bros. or J.K. Rowling.</p>
      </>
    ),
  },
  {
    title: 'Our responsibility',
    body: (
      <p>
        Nothing in these terms limits your rights under Indian consumer law. Beyond those rights, our responsibility for an order is
        limited to the amount you paid for it.
      </p>
    ),
  },
  {
    title: 'Changes and law',
    body: (
      <p>
        We may update these terms, and the date at the top shows when they last changed. Changes don&apos;t affect orders already placed.
        These terms are governed by the laws of India.
      </p>
    ),
  },
  {
    title: 'Contact',
    body: <p>Questions about these terms? Write to us at {mail}.</p>,
  },
]

export default function TermsPage() {
  return <LegalPage title="TERMS" lede="The terms of reserving and ordering a Wizardify portrait." updated="30 September 2026" sections={sections} />
}
