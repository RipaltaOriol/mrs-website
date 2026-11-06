'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { PORTAL_URL } from '@/lib/portal'
import { CloseIcon, MenuIcon, ShieldLockIcon } from './icons'
import LocaleMenu from './LocaleMenu'
import LocaleToggle from './LocaleToggle'

export type NavLink = { href: string; label: string }

export type NavLabels = {
  home: string
  menu: string
  closeMenu: string
  portal: string
  portalAction: string
}

const FOCUSABLE = 'a[href], button:not([disabled])'

function isCurrent(pathname: string, href: string): boolean {
  if (href.includes('#')) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function SiteNav({ links, labels }: { links: NavLink[]; labels: NavLabels }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => {
    setOpen(false)
    toggle.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close()
      return
    }
    if (e.key !== 'Tab') return
    const focusable = [...(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    const edge = e.shiftKey ? focusable[0] : focusable[focusable.length - 1]
    if (document.activeElement === edge) {
      e.preventDefault()
      ;(e.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus()
    }
  }

  const items = links.map(({ href, label }) => ({
    href,
    label,
    current: isCurrent(pathname, href),
  }))

  return (
    <>
      <ul className="hidden items-center gap-8 lg:flex">
        {items.map(({ href, label, current }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? 'page' : undefined}
              className={`relative block py-2 text-sm font-medium after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:bg-brand after:transition-transform ${current ? 'text-brand after:scale-x-100' : 'text-ink after:scale-x-0 hover:after:scale-x-100'}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 lg:flex">
          <LocaleMenu />
          <a
            href={PORTAL_URL}
            aria-label={labels.portalAction}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-white hover:bg-brand-deep"
          >
            <ShieldLockIcon size={13} />
            {labels.portal}
          </a>
        </div>
        <button
          ref={toggle}
          type="button"
          aria-controls="site-navigation"
          aria-expanded={open}
          aria-label={labels.menu}
          onClick={() => setOpen(true)}
          className="rounded-full p-2 text-ink lg:hidden"
        >
          <MenuIcon size={28} />
        </button>
      </div>

      <div
        ref={panel}
        id="site-navigation"
        hidden={!open}
        onKeyDown={onKeyDown}
        className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-canvas px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {open && (
          <>
            <div className="flex items-center justify-between">
              <Link href="/" aria-label={labels.home} onClick={close} className="shrink-0">
                <Image src="/logo.png" alt="MRS Assessors" width={56} height={56} />
              </Link>
              <button
                type="button"
                aria-label={labels.closeMenu}
                onClick={close}
                className="rounded-full p-2 text-ink"
              >
                <CloseIcon size={28} />
              </button>
            </div>
            <ul className="mt-8 flex flex-col" onClick={close}>
              {items.map(({ href, label, current }) => (
                <li key={href} className="border-b border-mist">
                  <Link
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    className={`block py-4 font-display text-2xl ${current ? 'text-brand' : 'text-ink'}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-5 pt-10">
              <LocaleToggle />
              <a
                href={PORTAL_URL}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand text-base font-medium text-white hover:bg-brand-deep"
              >
                <ShieldLockIcon size={14} />
                {labels.portalAction}
              </a>
            </div>
          </>
        )}
      </div>
    </>
  )
}
