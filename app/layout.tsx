import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Cinzel, Cormorant_Garamond, Montserrat, Uncial_Antiqua } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import RevealObserver from '@/components/RevealObserver'
import WandCursor from '@/components/WandCursor'
import './globals.css'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-cinzel' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant' })
// Type: Uncial Antiqua for page headlines, Cormorant Garamond for section headings, Cinzel for labels
// and buttons, and Montserrat for body text
const uncial = Uncial_Antiqua({ subsets: ['latin'], weight: '400', variable: '--font-uncial' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-montserrat' })

const description = 'Pictures were never meant to stay still. Moving portrait frames, made from your photos.'

// The share image (opengraph-image.jpg, made by scripts/og/build.mjs) and these details are what
// WhatsApp, Instagram, iMessage and search results show for a Wizardify link
export const metadata: Metadata = {
  metadataBase: new URL('https://www.wizardify.me'),
  title: 'Wizardify',
  description,
  openGraph: { type: 'website', siteName: 'Wizardify', locale: 'en_IN', title: 'Wizardify', description },
  twitter: { card: 'summary_large_image', title: 'Wizardify', description },
}

export const viewport: Viewport = {
  themeColor: '#0A0E18',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${uncial.variable} ${cinzel.variable} ${cormorant.variable} ${montserrat.variable}`}>
      <body>
        {children}
        <RevealObserver />
        <WandCursor />
        {/* Visitor counts, without cookies; shows data once Analytics is switched on in Vercel */}
        <Analytics />
      </body>
    </html>
  )
}
