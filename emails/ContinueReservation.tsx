import { Text } from '@react-email/components'
import EmailLayout, { Cta, Greeting, SignOff, Title, numberFont, small, text } from './EmailLayout'

type Props = { number: string; firstName?: string; firstInLine?: boolean; continueUrl: string; site: string; unsubscribeUrl?: string }

// Sent when someone reserves with an email that's already on the list. Only the owner of the inbox
// can pick the reservation back up, so typing someone's email never reveals their details. Members
// who haven't shared their preferences and photos yet get a nudge to; the rest hear they're set.
export default function ContinueReservation({ number, firstName, firstInLine, continueUrl, site, unsubscribeUrl }: Props) {
  return (
    <EmailLayout preview={`You're already on the list as ${number}.`} site={site} unsubscribeUrl={unsubscribeUrl}>
      <Title>WELCOME BACK.</Title>
      <Greeting firstName={firstName} />
      <Text style={text}>
        Someone just tried to reserve a place with this email. Since it&apos;s yours, we&apos;re fairly sure it was you. If not, someone&apos;s
        been practising their disguise spells, and we&apos;d like a word.
      </Text>
      <Text style={text}>
        Good news: your place is already held as{' '}
        <strong style={{ ...numberFont, fontSize: '17px', letterSpacing: '0.04em' }}>{number}</strong>. No need to queue twice. Magic
        doesn&apos;t work like that, and neither do we.
      </Text>
      {firstInLine ? (
        <Text style={text}>
          Even better, your preferences and photos are on record, so you&apos;re first in line for your moving portrait when the doors
          reopen. Nothing left to do but wait, wand at the ready, looking a little smug.
        </Text>
      ) : (
        <Text style={text}>
          Now, a little secret between us: members who share their portrait preferences and a few photos are first in line for their
          moving portrait frame when the doors reopen. Everyone else waits their turn with the non-magical folk, clutching photographs
          that refuse to move.
        </Text>
      )}
      <Cta href={continueUrl}>{firstInLine ? 'SEE MY RESERVATION' : 'PUT ME FIRST IN LINE'}</Cta>
      <Text style={{ ...small, textAlign: 'center' }}>
        {firstInLine ? '' : 'It takes about a minute, less time than an owl takes to find your window. '}The button works on any device
        for 30 days and is enchanted for you alone, so please don&apos;t forward this email.
      </Text>
      <Text style={{ ...small, textAlign: 'center' }}>
        If this wasn&apos;t you, simply ignore this email. Your reservation is safe, and nothing has changed.
      </Text>
      <SignOff />
    </EmailLayout>
  )
}

ContinueReservation.PreviewProps = {
  number: 'WZ-0001',
  firstName: 'Nisha',
  continueUrl: 'https://www.wizardify.me/reserve/continue?t=example',
  site: 'https://www.wizardify.me',
  unsubscribeUrl: 'https://www.wizardify.me/unsubscribe?t=example',
} satisfies Props
