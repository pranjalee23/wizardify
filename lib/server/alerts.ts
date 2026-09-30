import 'server-only'
import { createElement } from 'react'
import { sendEmail } from './email'

// Tells the team something needs attention: by email (to ALERT_EMAIL, or hello@wizardify.me, which
// forwards to the team's Gmail) and on Telegram, if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set.
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

async function telegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) return
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
  }).catch((e: Error) => e)
  if (res instanceof Error || !res.ok) console.error('[alert] Telegram failed:', res instanceof Error ? res.message : res.status)
}
