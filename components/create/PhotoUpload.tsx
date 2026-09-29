'use client'

import { useEffect, useRef, useState } from 'react'
import Check from '@/components/Check'
import ui from '@/components/ui.module.css'
import s from './PhotoUpload.module.css'

const tips = ['Clear, well-lit photos', 'Different angles', 'Include close-up shots', 'No heavy filters', '3 to 8 photos recommended']

export default function PhotoUpload() {
  const [previews, setPreviews] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const urls = useRef<string[]>([])

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), [])

  const add = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => URL.createObjectURL(f))
    urls.current.push(...next)
    setPreviews((p) => [...p, ...next].slice(0, 8))
  }

  const slots = Math.max(3, previews.length)

  return (
    <div className={s.row}>
      <div className={s.left}>
        <label
          htmlFor="photos"
          className={s.drop}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            add(e.dataTransfer.files)
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#E5DACA" strokeWidth="1.2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
            <circle cx="16" cy="9" r="1.6" />
          </svg>
          <span className={s.dropText}>
            Drag and drop your photos here
            <br />
            or click to upload
          </span>
          <span className={s.dropHint}>(3 to 8 photos recommended)</span>
        </label>
        <input
          ref={inputRef}
          id="photos"
          type="file"
          accept="image/*"
          multiple
          className={s.srOnly}
          onChange={(e) => add(e.target.files)}
        />
        <div className={s.thumbs}>
          {Array.from({ length: slots }, (_, i) => (
            <div key={i} className={s.thumb}>
              {previews[i] ? (
                <img className={s.thumbImg} src={previews[i]} alt={`Uploaded photo ${i + 1}`} />
              ) : (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="#5A5040" aria-hidden="true">
                  <circle cx="12" cy="9" r="4" />
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6z" />
                </svg>
              )}
            </div>
          ))}
          <button type="button" aria-label="Add more photos" className={s.add} onClick={() => inputRef.current?.click()}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
      <aside className={`${ui.paperCard} ${s.tips}`}>
        <h2 className={s.tipsTitle}>PHOTO TIPS</h2>
        <div className={s.tipsList}>
          {tips.map((t) => (
            <div key={t} className={s.tip}>
              <Check size={20} />
              {t}
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
