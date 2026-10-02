import { Section, Text } from '@react-email/components'
import EmailLayout, { Cta, Greeting, SignOff, Title, colors, label, numberFont, text } from './EmailLayout'

type Props = { number: string; firstName?: string; portraitUrl: string; site: string; unsubscribeUrl?: string }

// "The doors are open": sent from the admin (/admin/alerts) when a drop opens. Copy approved by the team.
export default function DropAlert({ number, firstName, portraitUrl, site, unsubscribeUrl }: Props) {
  return (
    <EmailLayout preview="The wait is over. As a member, you're in before everyone else." site={site} unsubscribeUrl={unsubscribeUrl}>
      <Title>THE DOORS ARE OPEN.</Title>
      <Greeting firstName={firstName} />
      <Text style={text}>The wait is over. The doors to Wizardify are open, and as a member you&apos;re in before everyone else.</Text>
      <Text style={text}>
        For the next 48 hours, only members can order. After that, the doors open to all, and the non-magical folk come crowding in.
      </Text>
      <Text style={text}>
        Your house, your story, your portrait: framed, moving, and yours to keep, from ₹11,999. Each drop is limited, so once the frames
        are gone, they&apos;re gone until the next chapter.
      </Text>
      <Cta href={portraitUrl}>CREATE MY PORTRAIT</Cta>
      <Section style={{ textAlign: 'center', margin: '0 0 8px' }}>
        <Text style={label}>YOUR RESERVATION</Text>
        <Text style={{ ...numberFont, color: colors.cream, fontSize: '24px', lineHeight: '30px', letterSpacing: '0.08em', margin: 0 }}>{number}</Text>
      </Section>
      <SignOff line="See you inside." />
    </EmailLayout>
  )
}

DropAlert.PreviewProps = {
  number: 'WZ-0001',
  firstName: 'Nisha',
  portraitUrl: 'https://www.wizardify.me/reserve/continue?t=example',
  site: 'https://www.wizardify.me',
  unsubscribeUrl: 'https://www.wizardify.me/unsubscribe?t=example',
} satisfies Props
