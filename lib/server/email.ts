import 'server-only'
import type { ReactElement } from 'react'
import { Resend } from 'resend'

// Sends an email through Resend. Without RESEND_API_KEY (e.g. on a dev machine) it only notes that
// the email would have been sent, so the rest of the flow still works.
export async function sendEmail({ to, subject, react }: { to: string; subject: string; react: ReactElement }) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.info(`[email] RESEND_API_KEY is not set, so "${subject}" was not sent`)
    return
  }
  const { error } = await new Resend(key).emails.send({
    from: process.env.EMAIL_FROM ?? 'Wizardify <hello@wizardify.me>',
    to,
    subject,
    react,
  })
  if (error) console.error(`[email] "${subject}" failed:`, error.message)
}
