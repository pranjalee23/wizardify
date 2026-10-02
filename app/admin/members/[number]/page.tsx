import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteMemberForm, MemberEditForm } from '@/components/admin/AdminForms'
import { PreviewUpload, ResendPreview } from '@/components/admin/PreviewForms'
import { MAX_PREVIEWS } from '@/lib/previews'
import { houseById } from '@/lib/houses'
import { countryName, regionName } from '@/lib/regions'
import { can, requireAdmin } from '@/lib/server/admin'
import { indiaTime } from '@/lib/server/members'
import { reservationNumber } from '@/lib/server/reservations'
import { db, PHOTO_BUCKET, PREVIEW_BUCKET } from '@/lib/server/supabase'
import { whatsappMessages } from '@/lib/server/whatsapp'
import s from '../../admin.module.css'

type Props = { params: Promise<{ number: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: reservationNumber(Number((await params).number) || 0) }
}

// One member: everything they've told us, their photos, and (by role) editing and deleting
export default async function Member({ params }: Props) {
  const admin = await requireAdmin('members.view')
  const number = Number((await params).number)
  if (!Number.isInteger(number) || number < 1) notFound()
  const { data: m, error } = await db().from('reservations').select('*').eq('number', number).maybeSingle()
  if (error) throw error
  if (!m) notFound()
  const label = reservationNumber(m.number)

  // Photos open through links that work for 10 minutes; the bucket itself stays private
  let photos: { url: string; name: string }[] = []
  if (can(admin, 'members.photos') && m.photos > 0 && !m.photos_deleted_at) {
    const bucket = db().storage.from(PHOTO_BUCKET)
    const { data: files } = await bucket.list(label, { limit: 100 })
    const paths = (files ?? []).filter((f) => f.id).map((f) => `${label}/${f.name}`)
    const { data: signed } = paths.length ? await bucket.createSignedUrls(paths, 600) : { data: [] }
    photos = (signed ?? []).flatMap((p) => (p.signedUrl ? [{ url: p.signedUrl, name: p.path ?? '' }] : []))
  }

  // Previews, each with a link that works for an hour
  const { data: previewRows } = await db().from('previews').select('*').eq('reservation_id', m.id).order('round')
  const previews = previewRows ?? []
  const { data: watch } = previews.length ? await db().storage.from(PREVIEW_BUCKET).createSignedUrls(previews.map((p) => p.video_path), 3600) : { data: [] }
  const latest = previews.at(-1)
  const canSend = !latest || (latest.status === 'changes' && latest.round < MAX_PREVIEWS)
  const statusText = { sent: 'Waiting for them', approved: 'Approved', changes: 'Changes asked for' } as const
  const deleteOn = m.approved_at ? indiaTime(new Date(Date.parse(m.approved_at) + 7 * 86400000).toISOString()) : null

  const where = [m.approx_city, regionName(m.approx_country, m.approx_region), countryName(m.approx_country)].filter(Boolean).join(', ')
  const details: [string, string][] = [
    ['Name', m.name ?? '—'],
    ['Email', m.email],
    ['WhatsApp', m.whatsapp],
    ['Reserved', indiaTime(m.created_at)],
    ['Approximate location', where || '—'],
    ['IP address', m.ip ?? '—'],
    ['First in line', m.priority === 'first' ? 'Yes' : 'No'],
    ['House', houseById(m.house ?? undefined)?.name ?? '—'],
    ['Known for', m.known_for ?? '—'],
    ['Role', m.role ?? '—'],
    ['Skyball', m.skyball ?? '—'],
    ['Companion', m.companion ?? '—'],
    ['Setting', m.setting ?? '—'],
    ['Photos', String(m.photos)],
    ['Email alerts', m.alerts_email ? 'On' : 'Off'],
    ['WhatsApp alerts', m.alerts_whatsapp ? 'On' : 'Off'],
    ['Photo reminders sent', String(m.photo_reminders)],
  ]

  return (
    <main className={s.main}>
      <div className={s.row}>
        <Link href="/admin" className={s.btn}>
          ← Dashboard
        </Link>
        <h1 className={s.title}>
          {label}
          {m.name ? ` · ${m.name}` : ''}
        </h1>
      </div>

      <section className={s.card}>
        <dl className={s.details}>
          {details.map(([dt, dd]) => (
            <div key={dt}>
              <dt>{dt}</dt>
              <dd>{dd}</dd>
            </div>
          ))}
        </dl>
        {m.wish && (
          <dl className={s.details} style={{ marginTop: 18 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <dt>Wishes</dt>
              <dd>{m.wish}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className={s.card}>
        <h2 className={s.subtitle}>Portrait preview</h2>
        {!latest && <p className={s.muted}>No preview sent yet.</p>}
        {latest?.status === 'sent' && <p>Sent {indiaTime(latest.created_at)}. Waiting for them to approve it or ask for changes.</p>}
        {latest?.status === 'changes' && (
          <p>
            They asked for changes {latest.decided_at ? `on ${indiaTime(latest.decided_at)}` : ''}:{' '}
            <em>&ldquo;{latest.feedback}&rdquo;</em>
            {latest.round >= MAX_PREVIEWS && ' That was their last round; reply to them by email if needed.'}
          </p>
        )}
        {latest?.status === 'approved' && (
          <p>
            Approved {latest.decided_at ? indiaTime(latest.decided_at) : ''}.{' '}
            {m.photos_deleted_at ? `Their photos were deleted ${indiaTime(m.photos_deleted_at)}.` : deleteOn && `Their photos will be deleted on ${deleteOn}.`}
          </p>
        )}
        {previews.length > 0 && (
          <div className={s.tableWrap} style={{ margin: '14px 0' }}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Sent</th>
                  <th>Status</th>
                  <th>Their feedback</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {previews.map((p, i) => (
                  <tr key={p.id}>
                    <td>{p.round}</td>
                    <td>{indiaTime(p.created_at)}</td>
                    <td>{statusText[p.status]}</td>
                    <td className={s.wrap}>{p.feedback ?? '—'}</td>
                    <td>
                      {watch?.[i]?.signedUrl && (
                        <a href={watch[i].signedUrl!} target="_blank" rel="noopener noreferrer">
                          Watch
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {can(admin, 'previews.send') && canSend && <PreviewUpload number={m.number} round={(latest?.round ?? 0) + 1} />}
        {can(admin, 'previews.send') && latest?.status === 'sent' && <ResendPreview number={m.number} />}
      </section>

      {m.photos_deleted_at && <p className={s.muted}>Their photos were deleted {indiaTime(m.photos_deleted_at)}, 7 days after they approved their preview.</p>}
      {photos.length > 0 && (
        <section>
          <h2 className={s.subtitle}>Photos</h2>
          <div className={s.photos}>
            {photos.map((p, i) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
                <img src={p.url} alt={`${label}, photo ${i + 1}`} />
              </a>
            ))}
          </div>
        </section>
      )}

      {can(admin, 'members.edit') && (
        <section className={s.card}>
          <h2 className={s.subtitle}>Message on WhatsApp</h2>
          <p className={s.muted}>Opens WhatsApp with the message ready; check it, then press send from the business number.</p>
          <div className={s.row}>
            {(await whatsappMessages(m)).map((w) => (
              <a key={w.label} href={w.href} target="_blank" rel="noopener noreferrer" className={s.btn}>
                {w.label}
              </a>
            ))}
          </div>
        </section>
      )}
      {can(admin, 'members.edit') && <MemberEditForm member={m} />}
      {can(admin, 'members.delete') && <DeleteMemberForm number={m.number} label={label} />}
    </main>
  )
}
