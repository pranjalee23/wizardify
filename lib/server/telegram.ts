import 'server-only'

// The team hears about the site on Telegram (@wizardify_bot, when TELEGRAM_BOT_TOKEN and
// TELEGRAM_CHAT_ID are set). Messages carry reservation numbers and counts, never members' emails or
// phone numbers.

// News: new members, deletions, the morning check
export async function notifyTeam(text: string) {
  await telegram(text)
}

// Trouble: at most one message every 10 minutes per kind (per server instance), so an outage doesn't
// bury the chat
const lastProblem = new Map<string, number>()
export async function notifyProblem(kind: string, text: string) {
  const now = Date.now()
  if (now - (lastProblem.get(kind) ?? 0) < 10 * 60 * 1000) return
  lastProblem.set(kind, now)
  await telegram(`⚠️ ${text}`)
}

export async function telegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) return
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
  }).catch((e: Error) => e)
  if (res instanceof Error || !res.ok) console.error('[telegram] failed:', res instanceof Error ? res.message : res.status)
}
