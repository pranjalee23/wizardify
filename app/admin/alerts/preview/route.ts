import { createElement } from 'react'
import { render } from '@react-email/render'
import DropAlert from '@/emails/DropAlert'
import { can, currentAdmin } from '@/lib/server/admin'

// The drop alert as members will see it, with a sample name and number
export async function GET() {
  const admin = await currentAdmin()
  if (!admin || !can(admin, 'alerts.send')) return new Response('Not found', { status: 404 })
  const html = await render(createElement(DropAlert, { ...DropAlert.PreviewProps, portraitUrl: '#', unsubscribeUrl: '#' }))
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}
