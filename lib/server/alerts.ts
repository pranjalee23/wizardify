import 'server-only'
import { createElement } from 'react'
import { sendEmail } from './email'
import { telegram } from './telegram'

export { notifyProblem, notifyTeam } from './telegram'

// Something needs attention now: on Telegram and by email (to ALERT_EMAIL, or hello@wizardify.me,
// which forwards to the team's Gmail)
export async function alertTeam(subject: string, lines: string[]) {
  const text = lines.join('\n\n')
  await Promise.all([
    sendEmail({
      to: process.env.ALERT_EMAIL ?? 'hello@wizardify.me',
      subject: `[Wizardify] ${subject}`,
      react: createElement(
        'div',
        { style: { fontFamily: 'Arial, sans-serif', fontSize: '15px', lineHeight: '22px' } },
        ...lines.map((l, i) => createElement('p', { key: i }, l)),
      ),
    }),
    telegram(`⚠️ ${subject}\n\n${text}`),
  ])
}
