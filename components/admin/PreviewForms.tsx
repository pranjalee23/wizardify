'use client'

import { useActionState, useState } from 'react'
import { previewUploadLink, resendPreview, sendPreview, type AdminState } from '@/app/admin/actions'
import { MAX_VIDEO_MB } from '@/lib/previews'
import s from '@/app/admin/admin.module.css'

function Message({ state }: { state: AdminState }) {
  const text = state?.error ?? state?.notice
  return <div aria-live="polite">{text && <p className={state?.error ? `${s.message} ${s.error}` : s.message}>{text}</p>}</div>
}

// Sends a file to a signed storage link, reporting progress (previews can be tens of megabytes)
function upload(url: string, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const body = new FormData()
    body.append('cacheControl', '3600')
    body.append('', file)
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status))))
    xhr.onerror = () => reject(new Error('network'))
    xhr.send(body)
  })
}

// Uploading a member's preview video, then sending it (which emails them)
export function PreviewUpload({ number, round }: { number: number; round: number }) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [state, setState] = useState<AdminState>(null)

  return (
    <form
      className={s.row}
      onSubmit={async (e) => {
        e.preventDefault()
        if (!file) return
        setState(null)
        const link = await previewUploadLink(number, { type: file.type, size: file.size })
        if ('error' in link) return setState({ error: link.error })
        try {
          setProgress(0)
          await upload(link.url, file, setProgress)
        } catch {
          setProgress(null)
          return setState({ error: "The video didn't upload. Please check your connection and try again." })
        }
        setState(await sendPreview(number, link.path))
        setProgress(null)
      }}
    >
      <label className={s.field}>
        {round > 1 ? `Updated preview (round ${round})` : 'Preview video'}: MP4, MOV or WebM, up to {MAX_VIDEO_MB} MB
        <input type="file" accept="video/mp4,video/quicktime,video/webm" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={s.input} />
      </label>
      <button className={s.btnGold} disabled={!file || progress !== null}>
        {progress === null ? 'Upload and send' : progress < 100 ? `Uploading… ${progress}%` : 'Sending…'}
      </button>
      <Message state={state} />
    </form>
  )
}

export function ResendPreview({ number }: { number: number }) {
  const [state, resend, pending] = useActionState(resendPreview, null)
  return (
    <form action={resend} className={s.row}>
      <input type="hidden" name="number" value={number} />
      <button className={s.btn} disabled={pending}>
        {pending ? 'Sending…' : 'Email them again'}
      </button>
      <Message state={state} />
    </form>
  )
}
