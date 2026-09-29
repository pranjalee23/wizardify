import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Cinzel, Cormorant_Garamond, Montserrat } from 'next/font/google'
import RevealObserver from '@/components/RevealObserver'
import WandCursor from '@/components/WandCursor'
import './globals.css'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-cinzel' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-montserrat' })

export const metadata: Metadata = {
  title: 'Wizardify',
  description: 'Pictures were never meant to stay still.',
}

export const viewport: Viewport = {
  themeColor: '#0A0E18',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${montserrat.variable}`}>
      <body>
        {children}
        <RevealObserver />
        <WandCursor />
      </body>
    </html>
  )
}
