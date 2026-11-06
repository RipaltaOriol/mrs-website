'use client'

import { type ReactNode, useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Variant = { key: string; name: string; node: ReactNode }

/** PROTOTYPE: renders one of several variants picked by `?variant=` with a floating switcher. */
export default function PrototypeSwitcher({ variants }: { variants: Variant[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === params.get('variant')),
  )
  const current = variants[index]

  const go = useCallback(
    (step: number) => {
      const next = variants[(index + step + variants.length) % variants.length]
      router.replace(`${pathname}?variant=${next.key}`, { scroll: false })
    },
    [index, pathname, router, variants],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  return (
    <>
      {current.node}
      <div
        style={{ fontFamily: 'ui-monospace, monospace', background: '#000' }}
        className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full whitespace-nowrap px-4 py-2 text-sm text-white shadow-2xl"
      >
        <button type="button" onClick={() => go(-1)} aria-label="Previous variant" className="px-1">
          ←
        </button>
        <span>
          {current.key} ({current.name})
        </span>
        <button type="button" onClick={() => go(1)} aria-label="Next variant" className="px-1">
          →
        </button>
      </div>
    </>
  )
}
