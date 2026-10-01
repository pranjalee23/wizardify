'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import Arrow from '@/components/Arrow'
import { photoUploadLinks, saveWishes, type FormState } from '@/app/reserve/actions'
import { MAX_PHOTOS, MAX_PHOTO_MB, photoTypes } from '@/lib/photos'
import ui from '@/components/ui.module.css'
import FormMessage from './FormMessage'
import r from './reserve.module.css'
import s from './WishesForm.module.css'

const MAX_WISH = 500

// Sends one photo to the storage link the server signed for it
async function upload(url: string, file: File) {
  const body = new FormData()
  body.append('cacheControl', '3600')
  body.append('', file)
  const res = await fetch(url, { method: 'PUT', body })
  if (!res.ok) throw new Error(`Photo upload failed (${res.status})`)
}

type Props = { wish: string | null; photos: number }

export default function WishesForm({ wish: savedWish, photos: saved }: Props) {
  const [state, save, pending] = useActionState(saveWishes, null)
  const [picked, setPicked] = useState<{ file: File; url: string }[]>([])
  // How many of the picked photos are already in storage, if a later step failed
  const [sent, setSent] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [note, setNote] = useState<FormState>(null)
  const [wish, setWish] = useState(savedWish ?? '')
  const urls = useRef<string[]>([])
  const room = MAX_PHOTOS - saved

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), [])

  const add = (files: FileList | null) => {
    if (!files) return
    const all = Array.from(files)
    const ok = all.filter((f) => f.type in photoTypes && f.size <= MAX_PHOTO_MB * 1024 * 1024)
    setNote(ok.length < all.length ? { error: `Some files weren't added. Photos need to be JPEG, PNG, WebP or HEIC, under ${MAX_PHOTO_MB} MB each.` } : null)
    const next = ok.map((file) => ({ file, url: URL.createObjectURL(file) }))
    urls.current.push(...next.map((n) => n.url))
    setPicked((p) => [...p, ...next].slice(0, room))
  }

  return (
    <form
      className={`${r.form} ${r.wide} ${s.fields}`}
      onSubmit={async (e) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        const waiting = picked.slice(sent)
        if (waiting.length) {
          setUploading(true)
          setNote(null)
          try {
            const links = await photoUploadLinks(waiting.map(({ file }) => ({ type: file.type, size: file.size })))
            if ('error' in links) return setNote({ error: links.error })
            await Promise.all(links.uploads.map((u, i) => upload(u.url, waiting[i].file)))
            setSent(picked.length)
          } catch {
            return setNote({ error: "Your photos didn't upload. Please check your connection and try again." })
          } finally {
            setUploading(false)
          }
        }
        startTransition(() => save(form))
      }}
    >
      <section className={s.panel}>
        <div className={s.panelHead}>
          <h2 className={s.panelTitle}>YOUR PHOTOS</h2>
          <span className={s.badge}>ADD NOW OR LATER</span>
        </div>
        <p className={s.panelText}>
          Photos are required before we create your portrait. You can add them now, or when the doors reopen. We'll remind you.
          {saved > 0 && ` You've added ${saved} so far${room > 0 ? `, and can add ${room} more` : ''}.`}
        </p>
        {room > 0 && (
          <label
            htmlFor="rp-photos"
            className={s.drop}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              add(e.dataTransfer.files)
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E5DACA" strokeWidth="1.3" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 16l5-5 4 4 3-3 6 6" />
              <circle cx="16" cy="9" r="1.6" />
            </svg>
            <span className={s.dropText}>
              <span className={s.dropMain}>
                <span className={s.pointerText}>Drag and drop, or click to upload</span>
                <span className={s.touchText}>Tap to choose photos</span>
              </span>
              <span className={s.dropHint}>3 to 8 clear photos of your face</span>
            </span>
          </label>
        )}
        <input
          id="rp-photos"
          type="file"
          accept="image/*"
          multiple
          disabled={room <= 0}
          className={ui.srOnly}
          onChange={(e) => {
            add(e.target.files)
            e.target.value = ''
          }}
        />
        {picked.length > 0 && (
          <div className={s.thumbs}>
            {picked.map((p, i) => (
              <img key={p.url} src={p.url} alt={`Photo ${saved + i + 1}`} className={s.thumb} />
            ))}
          </div>
        )}
      </section>

      <section className={`${s.panel} ${s.panelWish}`}>
        <h2 className={s.panelTitle}>ANYTHING SPECIAL IN MIND?</h2>
        <p className={s.panelText}>
          A pose, a moment, a video style, a pet or a loved one beside you. Tell us anything you'd love to see. Wizardify is being shaped
          with our first members, and your ideas help decide what we make next.
        </p>
        <label htmlFor="rp-wish" className={ui.srOnly}>
          Your wishes or special requests (optional)
        </label>
        <textarea
          id="rp-wish"
          name="wish"
          rows={5}
          maxLength={MAX_WISH}
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="e.g. Me waving from a castle window, with my dog beside me"
          className={s.textarea}
        />
        <div className={s.count}>
          {wish.length} / {MAX_WISH}
        </div>
      </section>

      <div className={`${r.actions} ${r.actionsEnd}`}>
        <button type="submit" disabled={uploading || pending} className={`${ui.pill} ${ui.paper} ${r.cta} ${r.ctaTall}`}>
          {uploading ? 'UPLOADING PHOTOS…' : pending ? 'SAVING…' : 'RESERVE MY PLACE'}
          <Arrow />
        </button>
      </div>
      <FormMessage state={note ?? state} />
    </form>
  )
}
