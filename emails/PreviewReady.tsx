import { Text } from '@react-email/components'
import EmailLayout, { Cta, Greeting, SignOff, Title, small, text } from './EmailLayout'

type Props = { firstName?: string; round: number; changesLeft: number; previewUrl: string; site: string }

// Sent when the team uploads a member's preview (from the admin): the first one, or an updated one
// after the member asked for changes
export default function PreviewReady({ firstName, round, changesLeft, previewUrl, site }: Props) {
  const updated = round > 1
  return (
    <EmailLayout preview={updated ? 'Your changes are in. Have a look.' : 'Your moving portrait is ready for its first look.'} site={site}>
      <Title>{updated ? 'YOUR UPDATED PORTRAIT IS READY.' : 'YOUR PORTRAIT IS READY.'}</Title>
      <Greeting firstName={firstName} />
      <Text style={text}>
        {updated
          ? "We've worked your changes in, and your portrait has been practising its smile. Have a look."
          : 'The paint is dry and the magic is in. Your moving portrait is ready for its first look.'}
      </Text>
      <Text style={text}>
        If it&apos;s everything you hoped for, approve it, and we&apos;ll have it ready for its frame.
        {changesLeft > 0
          ? ` If something isn't quite right, you can ask for changes: you have ${changesLeft === 1 ? 'one round' : `${changesLeft === 2 ? 'two' : changesLeft} rounds`} left.`
          : " This was your last round of changes, so if anything still isn't right, just reply to this email."}
      </Text>
      <Cta href={previewUrl}>WATCH MY PORTRAIT</Cta>
      <Text style={{ ...small, textAlign: 'center' }}>
        This button opens your private preview on any device for 30 days. It&apos;s enchanted for you alone, so please don&apos;t forward
        this email.
      </Text>
      <SignOff line="Happy watching." />
    </EmailLayout>
  )
}

PreviewReady.PreviewProps = {
  firstName: 'Nisha',
  round: 1,
  changesLeft: 2,
  previewUrl: 'https://www.wizardify.me/reserve/continue?t=example&to=preview',
  site: 'https://www.wizardify.me',
} satisfies Props
