import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteMemberForm, MemberEditForm } from '@/components/admin/AdminForms'
import { houseById } from '@/lib/houses'
import { countryName, regionName } from '@/lib/regions'
import { can, requireAdmin } from '@/lib/server/admin'
import { indiaTime } from '@/lib/server/members'
import { reservationNumber } from '@/lib/server/reservations'
import { db, PHOTO_BUCKET } from '@/lib/server/supabase'
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
  if (can(admin, 'members.photos') && m.photos > 0) {
    const bucket = db().storage.from(PHOTO_BUCKET)
    const { data: files } = await bucket.list(label, { limit: 100 })
    const paths = (files ?? []).filter((f) => f.id).map((f) => `${label}/${f.name}`)
    const { data: signed } = paths.length ? await bucket.createSignedUrls(paths, 600) : { data: [] }
    photos = (signed ?? []).flatMap((p) => (p.signedUrl ? [{ url: p.signedUrl, name: p.path ?? '' }] : []))
  }

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

      {can(admin, 'members.edit') && <MemberEditForm member={m} />}
      {can(admin, 'members.delete') && <DeleteMemberForm number={m.number} label={label} />}
    </main>
  )
}
