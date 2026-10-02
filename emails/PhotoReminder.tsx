import { Text } from '@react-email/components'
import EmailLayout, { Cta, Greeting, Title, numberFont, small, text } from './EmailLayout'

type Props = { number: string; firstName?: string; photosUrl: string; site: string; unsubscribeUrl?: string; last?: boolean }

// Sent to members who haven't added photos: 3 days after reserving, and once more after 2 weeks
export default function PhotoReminder({ number, firstName, photosUrl, site, unsubscribeUrl, last }: Props) {
  return (
    <EmailLayout preview="Add your photos to be first in line when the doors reopen." site={site} unsubscribeUrl={unsubscribeUrl}>
      <Title>{last ? 'ONE LAST NUDGE.' : 'YOUR PORTRAIT AWAITS.'}</Title>
      <Greeting firstName={firstName} />
      <Text style={text}>
        Your place is held as <strong style={{ ...numberFont, fontSize: '17px', letterSpacing: '0.04em' }}>{number}</strong>, but
        we don&apos;t have your photos yet. Members whose photos are on record will be the first to receive their portraits when the
        doors reopen.
      </Text>
      <Text style={text}>3 to 8 clear, well-lit photos of your face work best, from a few different angles. It takes about a minute.</Text>
      <Cta href={photosUrl}>ADD MY PHOTOS</Cta>
      <Text style={{ ...small, textAlign: 'center' }}>
        {last ? "This is the last reminder we'll send. " : ''}This button brings you back to your reservation on any device for the next
        30 days.
      </Text>
    </EmailLayout>
  )
}

PhotoReminder.PreviewProps = {
  number: 'WZ-0001',
  firstName: 'Nisha',
  photosUrl: 'https://www.wizardify.me/reserve/continue?t=example&to=photos',
  site: 'https://www.wizardify.me',
  unsubscribeUrl: 'https://www.wizardify.me/unsubscribe?t=example',
} satisfies Props
