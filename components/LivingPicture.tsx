'use client'

import { useEffect, useRef, useState } from 'react'
import s from './LivingPicture.module.css'

type Props = { src: string; poster: string; alt: string; className?: string; priority?: boolean }

type Connection = { saveData?: boolean; effectiveType?: string }

// A still picture that comes to life. The picture (the video's first frame) loads like any other
// image, lazily unless it's at the top of the page (`priority`). The video only starts downloading
// as it nears the screen, and fades in over the picture once it's actually playing, so there's never
// a blank frame. With reduced motion, Data Saver or a very slow connection, the picture stays still.
export default function LivingPicture({ src, poster, alt, className, priority = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const connection = (navigator as Navigator & { connection?: Connection }).connection
    if (connection?.saveData || /2g/.test(connection?.effectiveType ?? '')) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return video.pause()
        if (!video.getAttribute('src')) video.src = src
        video.play().catch(() => {})
      },
      { rootMargin: '240px 0px' },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [src])

  return (
    <span className={className ? `${s.picture} ${className}` : s.picture}>
      <img
        className={s.still}
        src={poster}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
      <video
        ref={ref}
        className={playing ? `${s.video} ${s.playing}` : s.video}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-hidden
        onPlaying={() => setPlaying(true)}
      />
    </span>
  )
}
