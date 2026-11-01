'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { PORTAL_URL } from '@/lib/portal'
import { CloseIcon, MenuIcon } from './icons'
import LocaleSwitcher from './LocaleSwitcher'

export type NavLink = { href: string; label: string }

export type NavLabels = { menu: string; closeMenu: string; portal: string; portalAction: string }

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
      <div className="hidden lg:block lg:flex-1">
        <ul className="flex items-center justify-end gap-1">
          {items.map(({ href, label, current }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`rounded px-3 py-2 text-sm font-medium ${current ? 'text-brand' : 'text-ink hover:text-brand'}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <a href={PORTAL_URL} aria-label={labels.portalAction} className="btn text-sm font-medium">
        {labels.portal}
      </a>
      <LocaleSwitcher tone="light" />

      <button
        ref={toggle}
        type="button"
        aria-controls="site-navigation"
        aria-expanded={open}
        aria-label={labels.menu}
        onClick={() => setOpen(true)}
        className="rounded p-2 text-ink lg:hidden"
      >
        <MenuIcon size={28} />
      </button>

      <div
        ref={panel}
        id="site-navigation"
        hidden={!open}
        onKeyDown={onKeyDown}
        className="fixed inset-0 z-50 flex flex-col bg-canvas px-5 py-3 lg:hidden"
      >
        <div className="flex items-center justify-end">
          <button
            type="button"
            aria-label={labels.closeMenu}
            onClick={close}
            className="rounded p-2 text-ink"
          >
            <CloseIcon size={28} />
          </button>
        </div>
        <ul className="mt-6 flex flex-col gap-2" onClick={close}>
          {items.map(({ href, label, current }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`block py-3 text-2xl ${current ? 'text-brand' : 'text-ink'}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
