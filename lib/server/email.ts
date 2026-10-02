import 'server-only'
import type { ReactElement } from 'react'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import { notifyProblem } from './telegram'

export type Email = { to: string; subject: string; react: ReactElement; headers?: Record<string, string> }

const from = () => process.env.EMAIL_FROM ?? 'Wizardify <hello@wizardify.me>'

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
    from: from(),
    to,
    subject,
    html,
    text,
    headers,
  })
  if (error) {
    console.error(`[email] "${subject}" failed:`, error.message)
    // Resend down, or the plan's daily limit reached: the team should know straight away
    await notifyProblem(`email-${error.name}`, `An email didn't send ("${subject}"): ${error.message}`)
  }
  return !error
}

// Many emails at once, 100 to a request (Resend's batch limit), for drop alerts. Says which went: a
// request that fails (Resend down, or the plan's daily limit reached) fails all its emails.
export async function sendBatch(emails: Email[]) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.info(`[email] RESEND_API_KEY is not set, so ${emails.length} emails were not sent`)
    return emails.map(() => false)
  }
  const resend = new Resend(key)
  const sent: boolean[] = []
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = await Promise.all(
      emails.slice(i, i + 100).map(async (e) => {
        const [html, text] = await Promise.all([render(e.react), render(e.react, { plainText: true })])
        return { from: from(), to: e.to, subject: e.subject, html, text, headers: e.headers }
      }),
    )
    const { error } = await resend.batch.send(chunk)
    if (error) {
      console.error('[email] batch failed:', error.message)
      await notifyProblem(`email-${error.name}`, `${chunk.length} emails didn't send: ${error.message}`)
    }
    sent.push(...chunk.map(() => !error))
    // Resend takes about 2 requests a second
    if (i + 100 < emails.length) await new Promise((r) => setTimeout(r, 600))
  }
  return sent
}
