import { Text } from '@react-email/components'
import EmailLayout, { Cta, Title, numberFont, small, text } from './EmailLayout'

type Props = { number: string; continueUrl: string; site: string }

// Sent when someone reserves with an email that's already on the list. Only the owner of the inbox
// can pick the reservation back up, so typing someone's email never reveals their details.
export default function ContinueReservation({ number, continueUrl, site }: Props) {
  return (
    <EmailLayout preview={`You're already on the list as ${number}.`} site={site}>
      <Title>WELCOME BACK.</Title>
      <Text style={text}>
        Your place is already held as{' '}
        <strong style={{ ...numberFont, fontSize: '17px', letterSpacing: '0.04em' }}>{number}</strong>. Use the button below to pick up
        your reservation where you left off, on this device or any other.
      </Text>
      <Cta href={continueUrl}>CONTINUE MY RESERVATION</Cta>
      <Text style={{ ...small, textAlign: 'center' }}>
        If you didn&apos;t just try to reserve on wizardify.me, you can ignore this email. Nothing has changed.
      </Text>
    </EmailLayout>
  )
}

ContinueReservation.PreviewProps = {
  number: 'WZ-0001',
  continueUrl: 'https://www.wizardify.me/reserve/continue?t=example',
  site: 'https://www.wizardify.me',
} satisfies Props
