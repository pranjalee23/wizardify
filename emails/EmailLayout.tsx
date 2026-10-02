import type { ReactNode } from 'react'
import { Body, Button, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from '@react-email/components'

// The frame every Wizardify email shares: the night-blue page, the logo, a card, and the footer.
// Cinzel and Cormorant load where the mail app allows web fonts; elsewhere they fall back to Georgia.
const heading = "Cinzel, Georgia, 'Times New Roman', serif"
const body = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"

// Reservation numbers, in lining figures: Cormorant and Georgia draw 0 like a small o
export const numberFont = { fontFamily: "Cinzel, 'Times New Roman', serif", fontVariantNumeric: 'lining-nums' } as const

export const colors = { gold: '#D9B26A', cream: '#E5DACA', muted: '#A89F90', page: '#0A0E18', card: '#111726', line: '#3A2F1E' }

export const text = { color: colors.cream, fontFamily: body, fontSize: '19px', lineHeight: '28px', margin: '0 0 16px', fontVariantNumeric: 'lining-nums' } as const
export const small = { color: colors.muted, fontFamily: body, fontSize: '15px', lineHeight: '22px', margin: '0 0 8px', fontVariantNumeric: 'lining-nums' } as const
export const label = {
  color: colors.gold,
  fontFamily: heading,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  margin: '0 0 6px',
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: colors.gold, fontFamily: heading, fontSize: '26px', lineHeight: '34px', fontWeight: 600, letterSpacing: '0.06em', margin: '0 0 20px', textAlign: 'center' }}>
      {children}
    </Text>
  )
}

export function Cta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ textAlign: 'center', margin: '28px 0 20px' }}>
      <Button
        href={href}
        style={{
          backgroundColor: '#E4C991',
          color: '#2A1A08',
          fontFamily: heading,
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          padding: '16px 30px',
          borderRadius: '999px',
          boxShadow: 'inset 0 0 14px rgba(110, 70, 20, 0.6)',
        }}
      >
        {children}
      </Button>
    </Section>
  )
}

// "Hi Nisha," when we know their name, "Hi there," until we do
export function Greeting({ firstName }: { firstName?: string }) {
  return <Text style={text}>Hi {firstName || 'there'},</Text>
}

export function SignOff({ line = 'Until then, keep your wand handy.' }: { line?: string }) {
  return (
    <Text style={{ ...text, margin: '24px 0 0' }}>
      {line}
      <br />
      <span style={{ fontStyle: 'italic', color: colors.gold }}>The Wizardify team</span>
    </Text>
  )
}

// `reason` replaces the footer's "you reserved a place" line, for emails sent for other reasons
type Props = { preview: string; site: string; unsubscribeUrl?: string; reason?: ReactNode; children: ReactNode }

export default function EmailLayout({ preview, site, unsubscribeUrl, reason, children }: Props) {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:wght@500&display=swap" rel="stylesheet" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.page, margin: 0, padding: '32px 12px' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto' }}>
          <Section style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            {/* Always from the live site, so it shows even in emails sent from a preview or dev server */}
            <Img src="https://www.wizardify.me/images/logo-email.png" width="180" height="66" alt="Wizardify" style={{ margin: '0 auto' }} />
          </Section>
          <Section style={{ backgroundColor: colors.card, border: `1px solid ${colors.line}`, borderRadius: '18px', padding: '36px 32px' }}>
            {children}
          </Section>
          <Section style={{ textAlign: 'center', padding: '24px 8px 0' }}>
            <Text style={{ ...small, fontStyle: 'italic' }}>Pictures were never meant to stay still.</Text>
            <Hr style={{ borderColor: colors.line, margin: '16px 0' }} />
            <Text style={small}>
              {reason ?? (
                <>
                  You&apos;re receiving this because you reserved a place at{' '}
                  <Link href={site} style={{ color: colors.gold }}>
                    wizardify.me
                  </Link>
                  .
                </>
              )}{' '}
              Questions? Write to{' '}
              <Link href="mailto:hello@wizardify.me" style={{ color: colors.gold }}>
                hello@wizardify.me
              </Link>
              .
            </Text>
            {unsubscribeUrl && (
              <Text style={small}>
                Don&apos;t want drop alerts?{' '}
                <Link href={unsubscribeUrl} style={{ color: colors.gold }}>
                  Unsubscribe
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
