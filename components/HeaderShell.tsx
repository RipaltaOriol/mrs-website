'use client'

import { useEffect, useState, type ReactNode } from 'react'

/** The light site header, which grows a hairline rule once the page is scrolled. */
export default function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      data-scrolled={scrolled}
      className="sticky top-0 z-50 border-b border-transparent bg-canvas data-[scrolled=true]:border-mist"
    >
      {children}
    </header>
  )
}
