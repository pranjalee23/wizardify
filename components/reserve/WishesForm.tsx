'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Arrow from '@/components/Arrow'
import { saveReservation, useHydrated, useReservation, type Reservation } from '@/lib/reservation'
import { routes } from '@/lib/routes'
import ui from '@/components/ui.module.css'
import r from './reserve.module.css'
import s from './WishesForm.module.css'

const MAX_PHOTOS = 8
const MAX_WISH = 500

export default function WishesForm() {
  const saved = useReservation()
  const hydrated = useHydrated()
  return <Fields key={hydrated ? 'saved' : 'initial'} saved={saved} />
}

function Fields({ saved }: { saved: Reservation }) {
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [wish, setWish] = useState(saved.wish ?? '')
  const urls = useRef<string[]>([])

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), [])

  const add = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => URL.createObjectURL(f))
    urls.current.push(...next)
    setPhotos((p) => [...p, ...next].slice(0, MAX_PHOTOS))
  }

  return (
    <form
      className={`${r.form} ${r.wide} ${s.fields}`}
      onSubmit={(e) => {
        e.preventDefault()
        saveReservation({ wish: wish.trim(), photos: Math.max(photos.length, saved.photos ?? 0) })
        router.push(routes.reserve(5))
      }}
    >
      <section className={s.panel}>
        <div className={s.panelHead}>
          <h2 className={s.panelTitle}>YOUR PHOTOS</h2>
          <span className={s.badge}>ADD NOW OR LATER</span>
        </div>
        <p className={s.panelText}>
          Photos are required before we create your portrait. You can add them now, or when the doors reopen. We'll remind you.
        </p>
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
        <input id="rp-photos" type="file" accept="image/*" multiple className={ui.srOnly} onChange={(e) => add(e.target.files)} />
        {photos.length > 0 && (
          <div className={s.thumbs}>
            {photos.map((src, i) => (
              <img key={src} src={src} alt={`Uploaded photo ${i + 1}`} className={s.thumb} />
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
        <button type="submit" className={`${ui.pill} ${ui.paper} ${ui.glow} ${r.cta} ${r.ctaTall}`}>
          RESERVE MY PLACE
          <Arrow />
        </button>
      </div>
    </form>
  )
}
