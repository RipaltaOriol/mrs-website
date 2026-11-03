'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { ABSTRACT_COVE } from '@/lib/imagery'

const ZOOM = 0.2

/** The homepage's abstract band, filling the rest of the first screen and zooming in as the page scrolls. */
export default function HeroBand() {
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let pending = 0
    const update = () => {
      pending = 0
      const progress = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
      frame.current?.style.setProperty('transform', `scale(${1 + ZOOM * progress})`)
    }
    const onScroll = () => {
      pending ||= requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(pending)
    }
  }, [])

  return (
    <div ref={frame} data-band className="relative min-h-64 flex-1 origin-top bg-mist will-change-transform">
      <div className="absolute inset-0 motion-safe:animate-settle">
        <Image src={ABSTRACT_COVE} alt="" placeholder="blur" fill sizes="100vw" priority className="object-cover" />
      </div>
    </div>
  )
}
