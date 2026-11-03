'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

/** PROTOTYPE: floating bar that cycles the `?variant=` search param. */
export default function PrototypeSwitcher({
  variants,
  names,
}: {
  variants: readonly string[]
  names: Record<string, string>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('variant') ?? variants[0]
  const index = Math.max(0, variants.indexOf(current))

  const go = (step: number) => {
    const next = variants[(index + step + variants.length) % variants.length]
    const params = new URLSearchParams(searchParams)
    params.set('variant', next)
    router.replace(`${pathname}?${params}`, { scroll: false })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2 font-mono text-sm text-white shadow-2xl" style={{ background: '#000', outline: '2px solid #ff0' }}>
      <button type="button" onClick={() => go(-1)} aria-label="Previous variant" className="px-2">
        ←
      </button>
      <span>
        {variants[index]} ({names[variants[index]]})
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Next variant" className="px-2">
        →
      </button>
    </div>
  )
}
