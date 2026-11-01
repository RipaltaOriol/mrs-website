'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

/** PROTOTYPE: floating bar that cycles `?variant=` on the current route. */
export default function PrototypeSwitcher({ variants }: { variants: { key: string; name: string }[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const current = Math.max(
    0,
    variants.findIndex((v) => v.key === (params.get('variant') ?? variants[0]?.key)),
  )

  const go = (step: number) => {
    const next = variants[(current + step + variants.length) % variants.length]!
    const search = new URLSearchParams(params.toString())
    search.set('variant', next.key)
    router.replace(`${pathname}?${search}`, { scroll: false })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (process.env.NODE_ENV === 'production') return null
  const active = variants[current]!

  return (
    <div
      style={{ background: '#111', color: '#fff', fontFamily: 'ui-monospace, monospace' }}
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2 text-sm shadow-2xl"
    >
      <button type="button" onClick={() => go(-1)} aria-label="Previous variant" className="px-2">
        ←
      </button>
      <span>
        PROTOTYPE · {active.key} ({active.name})
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Next variant" className="px-2">
        →
      </button>
    </div>
  )
}
