import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import PageShell from '@/components/PageShell'
import NightSky from '@/components/NightSky'
import Nav from '@/components/Nav'
import PreviewDecision from '@/components/reserve/PreviewDecision'
import { changesLeft } from '@/lib/previews'
import { routes } from '@/lib/routes'
import { requireReservation } from '@/lib/server/reservations'
import { db, PREVIEW_BUCKET } from '@/lib/server/supabase'
import layout from '@/components/layout.module.css'
import ui from '@/components/ui.module.css'
import r from '@/components/reserve/reserve.module.css'
import s from './preview.module.css'

export const metadata: Metadata = { title: 'Your portrait, Wizardify', robots: { index: false } }

// A member's preview: watch it, then approve it or ask for changes. Reached from the "Your portrait
// is ready" email, which brings them here with their reservation.
export default async function PreviewPage() {
  const reservation = await requireReservation()
  const { data: latest } = await db()
    .from('previews')
    .select('round, status, video_path, feedback')
    .eq('reservation_id', reservation.id)
    .order('round', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!latest) redirect(routes.reserve(4))
  // The video opens through a link that works for an hour; the storage itself stays private
  const { data: video } = await db().storage.from(PREVIEW_BUCKET).createSignedUrl(latest.video_path, 3600)

  const title = {
    sent: latest.round > 1 ? 'YOUR UPDATED PORTRAIT IS READY.' : 'YOUR PORTRAIT IS READY.',
    changes: "WE'RE ON IT.",
    approved: 'APPROVED. ✨',
  }[latest.status]
  const lede = {
    sent: "Watch it, then let us know: approve it if it's everything you hoped for, or ask for changes.",
    changes: "Thanks for your notes. We're working your changes in, and we'll email you when your updated portrait is ready.",
    approved: "Your portrait is ready for its frame. We'll let you know the moment you can order it.",
  }[latest.status]

  return (
    <PageShell sky={<NightSky scene="study" />} minHeight={1100}>
      <Nav active="home" />
      <main className={`${layout.container} ${r.main}`}>
        <h1 className={`${ui.shimmer} ${r.title}`}>{title}</h1>
        <p className={r.lede}>{lede}</p>
        {video?.signedUrl && (
          <div className={s.frame}>
            <video className={s.video} src={video.signedUrl} controls playsInline preload="metadata" />
          </div>
        )}
        {latest.status === 'sent' && <PreviewDecision changesLeft={changesLeft(latest.round)} />}
        {latest.status === 'changes' && latest.feedback && (
          <p className={s.notes}>
            Your notes: <em>&ldquo;{latest.feedback}&rdquo;</em>
          </p>
        )}
        {latest.status === 'approved' && (
          <p className={s.notes}>
            As promised, the photos you sent us are deleted 7 days after you approve. Questions? Write to us at hello@wizardify.me.
          </p>
        )}
        <Link href={routes.reserve(4)} className={r.skip}>
          See my reservation
        </Link>
      </main>
    </PageShell>
  )
}
