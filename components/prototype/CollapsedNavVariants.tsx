'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { counterpartPath, ENDONYMS } from '@/i18n/counterpart'
import { getPathname, Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { PORTAL_URL } from '@/lib/portal'
import { ChevronDownIcon, CloseIcon, MenuIcon, ShieldLockIcon } from '../icons'
import LocaleMenu from '../LocaleMenu'
import type { NavLabels, NavLink } from '../SiteNav'
import PrototypeSwitcher from './PrototypeSwitcher'

type Variant = 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'

const DRAWER_LANGUAGE: Partial<Record<Variant, 'text' | 'segmented' | 'list' | 'select'>> = {
  F: 'text',
  G: 'segmented',
  H: 'list',
  I: 'select',
}
type Props = { links: NavLink[]; labels: NavLabels; homeLabel: string }

const FOCUSABLE = 'a[href], button:not([disabled])'

function useNavState(links: NavLink[]) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('common')
  const items = links.map((l) => ({
    ...l,
    current: !l.href.includes('#') && (pathname === l.href || pathname.startsWith(`${l.href}/`)),
  }))
  return { items, locale, switchTo: counterpartPath(pathname), localeLabel: t('locale') }
}

function Logo({ label }: { label: string }) {
  return (
    <Link href="/" aria-label={label} className="shrink-0">
      <Image src="/logo.png" alt="MRS Assessors" width={56} height={56} priority />
    </Link>
  )
}

function CollapsedNav({ variant, links, labels, homeLabel }: Props & { variant: Variant }) {
  const { items, locale, switchTo, localeLabel } = useNavState(links)
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
    if (e.key === 'Escape') close()
    if (e.key !== 'Tab') return
    const focusable = [...(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    const edge = e.shiftKey ? focusable[0] : focusable[focusable.length - 1]
    if (document.activeElement === edge) {
      e.preventDefault()
      ;(e.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus()
    }
  }

  const segmented = (size: 'sm' | 'lg', dark = false) => (
    <div
      role="group"
      aria-label={localeLabel}
      className={`flex rounded-full border p-1 font-medium ${dark ? 'border-stone' : 'border-mist bg-white'} ${size === 'lg' ? 'w-full text-base' : 'text-sm'}`}
    >
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={switchTo}
          locale={l}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? 'true' : undefined}
          className={`flex-1 rounded-full text-center ${size === 'lg' ? 'px-4 py-2.5' : 'px-3 py-1.5'} ${l === locale ? (dark ? 'bg-white text-ink' : 'bg-ink text-white') : dark ? 'text-mist' : 'text-stone'}`}
        >
          {size === 'lg' ? ENDONYMS[l] : l.toUpperCase()}
        </Link>
      ))}
    </div>
  )

  const portal = (className: string, text = labels.portalAction) => (
    <a
      href={PORTAL_URL}
      aria-label={labels.portalAction}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-brand font-medium text-white hover:bg-brand-deep ${className}`}
    >
      <ShieldLockIcon size={14} />
      {text}
    </a>
  )

  const closeButton = (dark = false) => (
    <button
      type="button"
      aria-label={labels.closeMenu}
      onClick={close}
      className={`rounded-full p-2 ${dark ? 'text-white' : 'text-ink'}`}
    >
      <CloseIcon size={28} />
    </button>
  )

  return (
    <>
      <Logo label={homeLabel} />
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
          {portal('h-10 px-5 text-sm', labels.portal)}
        </div>
        <button
          ref={toggle}
          type="button"
          aria-controls="site-navigation"
          aria-expanded={open}
          aria-label={variant === 'C' && open ? labels.closeMenu : labels.menu}
          onClick={() => (variant === 'C' && open ? close() : setOpen(true))}
          className="rounded-full p-2 text-ink lg:hidden"
        >
          {variant === 'C' && open ? <CloseIcon size={28} /> : <MenuIcon size={28} />}
        </button>
      </div>

      {open && variant === 'B' && (
        <div
          ref={panel}
          id="site-navigation"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 flex flex-col bg-canvas px-5 py-3 lg:hidden"
        >
          <div className="flex items-center justify-between">
            <Logo label={homeLabel} />
            {closeButton()}
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
          <div className="mt-auto flex flex-col gap-3 pb-20">
            <p className="mb-0 text-sm text-stone">{localeLabel}</p>
            {segmented('lg')}
            {portal('mt-2 h-12 w-full text-base')}
          </div>
        </div>
      )}

      {open && variant === 'C' && (
        <div
          ref={panel}
          id="site-navigation"
          onKeyDown={onKeyDown}
          className="fixed inset-x-0 top-20 bottom-0 z-40 bg-ink/30 px-3 lg:hidden"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="rounded-3xl border border-mist bg-white p-2 shadow-xl">
            <ul className="flex flex-col" onClick={close}>
              {items.map(({ href, label, current }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    className={`block rounded-2xl px-4 py-3 text-lg ${current ? 'bg-canvas text-brand' : 'text-ink'}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mx-2 my-2 h-px bg-mist" />
            <div className="flex items-center justify-between gap-3 px-2 pt-1 pb-2">
              {segmented('sm')}
              {portal('h-10 px-5 text-sm', labels.portal)}
            </div>
          </div>
        </div>
      )}

      {open && variant === 'D' && (
        <div
          ref={panel}
          id="site-navigation"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-canvas px-6 py-3 shadow-2xl">
            <div className="flex justify-end">{closeButton()}</div>
            {portal('mt-4 h-12 w-full text-base')}
            <ul className="mt-8 flex flex-col gap-1" onClick={close}>
              {items.map(({ href, label, current }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    className={`block border-l-2 py-2.5 pl-4 text-xl ${current ? 'border-brand text-brand' : 'border-transparent text-ink'}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center gap-4 pb-20 text-sm">
              <span className="text-stone">{localeLabel}</span>
              {routing.locales.map((l) => (
                <Link
                  key={l}
                  href={switchTo}
                  locale={l}
                  hrefLang={l}
                  lang={l}
                  aria-current={l === locale ? 'true' : undefined}
                  className={l === locale ? 'font-medium text-ink underline underline-offset-4' : 'text-stone'}
                >
                  {ENDONYMS[l]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {open && variant === 'E' && (
        <div
          ref={panel}
          id="site-navigation"
          data-surface="ink"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 flex flex-col bg-ink px-5 py-3 text-white lg:hidden"
        >
          <div className="flex justify-end">{closeButton(true)}</div>
          <ul className="mt-6 flex flex-col gap-1" onClick={close}>
            {items.map(({ href, label, current }, i) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={current ? 'page' : undefined}
                  className="flex items-baseline gap-4 py-2"
                >
                  <span className="w-6 text-sm text-rose tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`font-display text-3xl ${current ? 'text-rose italic' : 'text-white'}`}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 border-t border-stone pt-6 pb-20">
            {segmented('lg', true)}
            {portal('h-12 w-full text-base')}
          </div>
        </div>
      )}
      {open && DRAWER_LANGUAGE[variant] && (
        <div
          ref={panel}
          id="site-navigation"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-canvas px-6 py-3 shadow-2xl">
            <div className="flex justify-end">{closeButton()}</div>
            <ul className="mt-4 flex flex-col gap-1" onClick={close}>
              {items.map(({ href, label, current }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    className={`block border-l-2 py-2.5 pl-4 text-xl ${current ? 'border-brand text-brand' : 'border-transparent text-ink'}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-4 border-t border-mist pt-6 pb-20">
              {DRAWER_LANGUAGE[variant] === 'text' && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-stone">{localeLabel}</span>
                  {routing.locales.map((l) => (
                    <Link
                      key={l}
                      href={switchTo}
                      locale={l}
                      hrefLang={l}
                      lang={l}
                      aria-current={l === locale ? 'true' : undefined}
                      className={l === locale ? 'font-medium text-ink underline underline-offset-4' : 'text-stone'}
                    >
                      {ENDONYMS[l]}
                    </Link>
                  ))}
                </div>
              )}
              {DRAWER_LANGUAGE[variant] === 'segmented' && segmented('lg')}
              {DRAWER_LANGUAGE[variant] === 'list' && (
                <div role="group" aria-label={localeLabel}>
                  <p className="mb-1 text-sm text-stone">{localeLabel}</p>
                  <ul className="flex flex-col">
                    {routing.locales.map((l) => (
                      <li key={l}>
                        <Link
                          href={switchTo}
                          locale={l}
                          hrefLang={l}
                          lang={l}
                          aria-current={l === locale ? 'true' : undefined}
                          className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${l === locale ? 'bg-white font-medium text-ink' : 'text-stone'}`}
                        >
                          {ENDONYMS[l]}
                          {l === locale && (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="text-brand">
                              <path d="M6.2 11.6 2.4 7.8l.9-.9 2.9 2.9 6.5-6.5.9.9z" />
                            </svg>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {DRAWER_LANGUAGE[variant] === 'select' && (
                <label className="flex flex-col gap-1.5 text-sm text-stone">
                  {localeLabel}
                  <span className="relative">
                    <select
                      value={locale}
                      onChange={(e) =>
                        window.location.assign(getPathname({ href: switchTo, locale: e.target.value as typeof locale }))
                      }
                      className="h-12 w-full appearance-none rounded-full border border-mist bg-white px-5 text-base text-ink"
                    >
                      {routing.locales.map((l) => (
                        <option key={l} value={l}>
                          {ENDONYMS[l]}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon size={12} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-ink" />
                  </span>
                </label>
              )}
              {portal('h-12 w-full text-base')}
            </div>
          </div>
        </div>
      )}

      {open && variant === 'J' && (
        <div
          ref={panel}
          id="site-navigation"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 flex flex-col bg-canvas px-5 py-3 text-ink lg:hidden"
        >
          <div className="flex justify-end">{closeButton()}</div>
          <ul className="mt-6 flex flex-col gap-1" onClick={close}>
            {items.map(({ href, label, current }, i) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={current ? 'page' : undefined}
                  className="flex items-baseline gap-4 py-2"
                >
                  <span className="w-6 text-sm text-stone tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`font-display text-3xl ${current ? 'text-brand italic' : 'text-ink'}`}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 border-t border-mist pt-6 pb-20">
            {segmented('lg')}
            {portal('h-12 w-full text-base')}
          </div>
        </div>
      )}
    </>
  )
}

/** PROTOTYPE: phone menu layouts picked by `?variant=`, with the built navbar as variant A. */
export default function CollapsedNavVariants({ current, ...props }: Props & { current: ReactNode }) {
  const shell = (node: ReactNode) => (
    <nav
      aria-label="MRS Assessors"
      className="mx-auto flex max-w-content items-center gap-2 px-5 py-3 xs:gap-4 lg:gap-10"
    >
      {node}
    </nav>
  )
  return (
    <PrototypeSwitcher
      variants={[
        { key: 'A', name: 'Controls in the bar', node: current },
        { key: 'B', name: 'Full-screen, controls docked', node: shell(<CollapsedNav variant="B" {...props} />) },
        { key: 'C', name: 'Drop-down card', node: shell(<CollapsedNav variant="C" {...props} />) },
        { key: 'D', name: 'Side drawer, Portal first', node: shell(<CollapsedNav variant="D" {...props} />) },
        { key: 'E', name: 'Dark full-screen', node: shell(<CollapsedNav variant="E" {...props} />) },
        { key: 'F', name: 'Drawer · text', node: shell(<CollapsedNav variant="F" {...props} />) },
        { key: 'G', name: 'Drawer · toggle', node: shell(<CollapsedNav variant="G" {...props} />) },
        { key: 'H', name: 'Drawer · checklist', node: shell(<CollapsedNav variant="H" {...props} />) },
        { key: 'I', name: 'Drawer · select', node: shell(<CollapsedNav variant="I" {...props} />) },
        { key: 'J', name: 'Numbered, light', node: shell(<CollapsedNav variant="J" {...props} />) },
      ]}
    />
  )
}
