import 'server-only'
import { continueToken, reservationNumber, siteUrl } from './reservations'

// Ready-written WhatsApp messages the team sends by hand from the business number: each opens a chat
// with the member (in the WhatsApp app or WhatsApp Web) with the message filled in, ready to send.

type Member = { id: string; number: number; name: string | null; whatsapp: string }

// A chat with a member's number (+919876543210 becomes wa.me/919876543210), optionally with a message
export const chatLink = (whatsapp: string, text?: string) =>
  `https://wa.me/${whatsapp.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export async function whatsappMessages(m: Member) {
  const site = await siteUrl()
  const first = m.name?.trim().split(/\s+/)[0] || 'there'
  const number = reservationNumber(m.number)
  const link = (to?: string) => `${site}/reserve/continue?t=${continueToken(m.id)}${to ? `&to=${to}` : ''}`
  return [
    {
      label: 'Reservation confirmed',
      href: chatLink(
        m.whatsapp,
        `Hi ${first}! ✨ This is Wizardify. Your place is held: ${number}. We'll message you here the moment the doors reopen.\n\nWant to be first in line? Complete all your portrait preferences here: ${link()}`,
      ),
    },
    {
      label: 'Add your photos',
      href: chatLink(
        m.whatsapp,
        `Hi ${first}, it's Wizardify. We'd love your photos for your portrait (${number}): 3 to 8 clear photos of your face work best. Add them here: ${link('photos')}`,
      ),
    },
    { label: 'Blank message', href: chatLink(m.whatsapp, `Hi ${first}, it's Wizardify. `) },
  ]
}
