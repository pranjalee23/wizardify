import { Section, Text } from '@react-email/components'
import EmailLayout, { Cta, Title, colors, label, numberFont, small, text } from './EmailLayout'

type Props = { number: string; continueUrl: string; site: string; unsubscribeUrl?: string }

// Sent as soon as someone reserves on /drop
export default function ReservationConfirmed({ number, continueUrl, site, unsubscribeUrl }: Props) {
  return (
    <EmailLayout preview={`Your place is held. Your reservation number is ${number}.`} site={site} unsubscribeUrl={unsubscribeUrl}>
      <Title>YOUR PLACE IS HELD.</Title>
      <Section style={{ textAlign: 'center', margin: '0 0 24px' }}>
        <Text style={label}>RESERVATION NUMBER</Text>
        <Text style={{ ...numberFont, color: colors.cream, fontSize: '34px', lineHeight: '40px', letterSpacing: '0.08em', margin: 0 }}>{number}</Text>
      </Section>
      <Text style={text}>
        Thank you for reserving your place for the next chapter of Wizardify. The moment the doors reopen, we&apos;ll send your drop alert
        here and on WhatsApp.
      </Text>
      <Text style={text}>
        Members whose portrait preferences and photos are on record will be the first to receive their portraits. It takes about a
        minute.
      </Text>
      <Cta href={continueUrl}>COMPLETE MY RESERVATION</Cta>
      <Text style={{ ...small, textAlign: 'center' }}>
        This button brings you back to your reservation on any device for the next 30 days. Please don&apos;t forward this email.
      </Text>
    </EmailLayout>
  )
}

ReservationConfirmed.PreviewProps = {
  number: 'WZ-0001',
  continueUrl: 'https://www.wizardify.me/reserve/continue?t=example',
  site: 'https://www.wizardify.me',
  unsubscribeUrl: 'https://www.wizardify.me/unsubscribe?t=example',
} satisfies Props
