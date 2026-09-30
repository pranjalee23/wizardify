'use server'

import { after } from 'next/server'
import type { FormState } from '@/app/reserve/actions'
import { notifyTeam } from '@/lib/server/alerts'
import { readUnsubscribeToken, reservationNumber } from '@/lib/server/reservations'
import { db } from '@/lib/server/supabase'

// Saves which drop alerts a member wants, from the page an unsubscribe link opens. The signed link is
// the member's proof that the reservation is theirs.
export async function saveAlerts(_: FormState, form: FormData): Promise<FormState> {
  const id = readUnsubscribeToken(String(form.get('t') ?? ''))
  if (!id) return { error: "This link isn't valid. Please use the link from one of our emails." }
  const alerts = { alerts_email: form.get('email') === 'on', alerts_whatsapp: form.get('whatsapp') === 'on' }
  const { data, error } = await db().from('reservations').update(alerts).eq('id', id).select('number').maybeSingle()
  if (error) {
    console.error('[unsubscribe]', error)
    return { error: 'Something went wrong on our side. Please try again in a moment.' }
  }
  if (!data) return { error: 'We couldn’t find this reservation. It may have been deleted.' }
  const on = [alerts.alerts_email && 'email', alerts.alerts_whatsapp && 'WhatsApp'].filter(Boolean)
  after(() => notifyTeam(`🔕 ${reservationNumber(data.number)} now gets drop alerts by ${on.length ? on.join(' and ') : 'nothing (unsubscribed)'}.`))
  return { notice: on.length ? `Saved. We'll send your drop alerts by ${on.join(' and ')}.` : "Saved. You won't get any drop alerts from us." }
}
