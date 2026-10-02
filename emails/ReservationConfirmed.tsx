import { Section, Text } from '@react-email/components'
import EmailLayout, { Cta, Greeting, SignOff, Title, colors, label, numberFont, small, text } from './EmailLayout'

type Props = { number: string; firstName?: string; continueUrl: string; site: string; unsubscribeUrl?: string }

// Sent as soon as someone reserves on /drop
export default function ReservationConfirmed({ number, firstName, continueUrl, site, unsubscribeUrl }: Props) {
  return (
    <EmailLayout preview={`Your place is held. Your reservation number is ${number}.`} site={site} unsubscribeUrl={unsubscribeUrl}>
      <Title>YOUR PLACE IS HELD.</Title>
      <Greeting firstName={firstName} />
      <Text style={text}>
        Still pictures are for non-magical folk. In our world, portraits blink, smile and wave back. Yours is on its way.
      </Text>
      <Text style={text}>Your place for the next chapter of Wizardify is held. Guard this number like a house secret:</Text>
      <Section style={{ textAlign: 'center', margin: '8px 0 24px' }}>
        <Text style={label}>RESERVATION NUMBER</Text>
        <Text style={{ ...numberFont, color: colors.cream, fontSize: '34px', lineHeight: '40px', letterSpacing: '0.08em', margin: 0 }}>{number}</Text>
      </Section>
      <Text style={text}>The moment the doors reopen, we&apos;ll send word here and on WhatsApp. No owl required.</Text>
      <Text style={text}>
        Want to be first in line? Members who complete all their portrait preferences receive their portraits first. It takes about a
        minute, quicker than brewing a decent potion.
      </Text>
      <Cta href={continueUrl}>COMPLETE MY RESERVATION</Cta>
      <Text style={{ ...small, textAlign: 'center' }}>
        This button brings you back to your reservation on any device for 30 days. It&apos;s enchanted for you alone, so please don&apos;t
        forward this email.
      </Text>
      <SignOff />
    </EmailLayout>
  )
}

ReservationConfirmed.PreviewProps = {
  number: 'WZ-0001',
  firstName: 'Nisha',
  continueUrl: 'https://www.wizardify.me/reserve/continue?t=example',
  site: 'https://www.wizardify.me',
  unsubscribeUrl: 'https://www.wizardify.me/unsubscribe?t=example',
} satisfies Props
