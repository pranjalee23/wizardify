'use client'

import { useEffect, useRef } from 'react'

type Props = { src: string; poster: string; alt: string; className?: string }

export default function LivingPicture({ src, poster, alt, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    video.muted = true
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { rootMargin: '240px 0px' },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      aria-label={alt}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
    />
  )
}
