import 'server-only'
import type { ReactElement } from 'react'
import { render } from '@react-email/render'
import { Resend } from 'resend'

type Email = { to: string; subject: string; react: ReactElement; headers?: Record<string, string> }

// Sends an email through Resend, and says whether it went. Every email goes as HTML with a
// plain-text version alongside, which mail providers expect of genuine mail (an HTML-only email looks
// more like spam). Without RESEND_API_KEY (e.g. on a dev machine) it only notes that the email would
// have been sent, so the rest of the flow still works.
export async function sendEmail({ to, subject, react, headers }: Email) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.info(`[email] RESEND_API_KEY is not set, so "${subject}" was not sent`)
    return false
  }
  const [html, text] = await Promise.all([render(react), render(react, { plainText: true })])
  const { error } = await new Resend(key).emails.send({
    from: process.env.EMAIL_FROM ?? 'Wizardify <hello@wizardify.me>',
    to,
    subject,
    html,
    text,
    headers,
  })
  if (error) console.error(`[email] "${subject}" failed:`, error.message)
  return !error
}
