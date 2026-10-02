import { Section, Text } from '@react-email/components'
import EmailLayout, { Title, colors, numberFont, small, text } from './EmailLayout'

type Props = { code: string; site: string }

// The one-time code for signing in to the admin pages
export default function AdminCode({ code, site }: Props) {
  return (
    <EmailLayout
      preview={`Your admin sign-in code is ${code}.`}
      site={site}
      reason="You're receiving this because someone asked to sign in to the Wizardify admin with this address."
    >
      <Title>YOUR SIGN-IN CODE</Title>
      <Text style={{ ...text, textAlign: 'center' }}>Enter this code on the admin sign-in page:</Text>
      <Section style={{ textAlign: 'center', margin: '8px 0 24px' }}>
        <Text style={{ ...numberFont, color: colors.cream, fontSize: '40px', lineHeight: '48px', letterSpacing: '0.3em', margin: 0 }}>{code}</Text>
      </Section>
      <Text style={{ ...small, textAlign: 'center' }}>
        It works for 10 minutes. If you didn&apos;t ask to sign in, you can ignore this email; nobody can sign in without the code.
      </Text>
    </EmailLayout>
  )
}

AdminCode.PreviewProps = { code: '048213', site: 'https://www.wizardify.me' } satisfies Props
