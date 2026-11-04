'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** PROTOTYPE: floating bar that cycles the contact-section variants through `?variant=`. */
export default function ContactPrototypeSwitcher({
  variants,
  current,
}: {
  variants: { key: string; name: string }[]
  current: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  )

  const go = (step: number) => {
    const next = variants[(index + step + variants.length) % variants.length]
    router.replace(`${pathname}?variant=${next.key}#contact`, { scroll: false })
  }

  useEffect(() => {
    document.body.dataset.contactVariant = variants[index].key
    const footerAnchor = document.querySelector('[data-proto-footer-anchor]')
    if (footerAnchor) footerAnchor.id = variants[index].key === 'D' ? 'contact' : ''
    if (variants[index].key === 'D' && window.location.hash === '#contact') footerAnchor?.scrollIntoView()
  }, [index, variants])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full px-2 py-1.5 font-mono text-xs text-white shadow-2xl"
      style={{ background: '#000', boxShadow: '0 0 0 2px #facc15, 0 10px 30px rgba(0,0,0,.4)' }}>
      <button type="button" onClick={() => go(-1)} className="rounded-full px-3 py-1 hover:opacity-70">
        ←
      </button>
      <span>
        {variants[index].key} ({variants[index].name})
      </span>
      <button type="button" onClick={() => go(1)} className="rounded-full px-3 py-1 hover:opacity-70">
        →
      </button>
    </div>
  )
}
