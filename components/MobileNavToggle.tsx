'use client'

import { useState, type ReactNode } from 'react'
import { MenuIcon } from './icons'

/** Collapses the header navigation behind a button below the `lg` breakpoint. */
export default function MobileNavToggle({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="rounded border border-white px-3 py-1 text-white lg:hidden"
        aria-controls="site-navigation"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        <MenuIcon size={30} />
      </button>
      <div
        id="site-navigation"
        className={`${open ? 'block' : 'hidden'} w-full lg:flex lg:w-auto lg:flex-1 lg:items-center`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setOpen(false)
        }}
      >
        {children}
      </div>
    </>
  )
}
