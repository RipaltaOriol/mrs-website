'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { PORTAL_URL } from '@/lib/portal'
import { ChevronDownIcon, CloseIcon, MenuIcon, ShieldLockIcon } from '../icons'
import type { NavLabels, NavLink } from '../SiteNav'
import PrototypeSwitcher from './PrototypeSwitcher'

type Props = { links: NavLink[]; labels: NavLabels; homeLabel: string }

const LANGUAGE_NAMES: Record<string, string> = { ca: 'Català', es: 'Español' }

function counterpartPath(pathname: string): string {
  return pathname.startsWith('/blogs/') ? '/blogs' : pathname
}

function useNav(links: NavLink[]) {
  const pathname = usePathname()
  const locale = useLocale()
  const items = links.map((l) => ({
    ...l,
    current: !l.href.includes('#') && (pathname === l.href || pathname.startsWith(`${l.href}/`)),
  }))
  return { items, locale, switchTo: counterpartPath(pathname) }
}

function Logo({ label, size = 56 }: { label: string; size?: number }) {
  return (
    <Link href="/" aria-label={label} className="shrink-0">
      <Image src="/logo.png" alt="MRS Assessors" width={size} height={size} priority />
    </Link>
  )
}

function MobileMenu({ links, labels }: Props) {
  const [open, setOpen] = useState(false)
  const { items, locale, switchTo } = useNav(links)
  return (
    <>
      <button
        type="button"
        aria-label={labels.menu}
        onClick={() => setOpen(true)}
        className="rounded p-2 text-ink lg:hidden"
      >
        <MenuIcon size={26} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-canvas px-5 py-3 lg:hidden">
          <div className="flex justify-end">
            <button type="button" aria-label={labels.closeMenu} onClick={() => setOpen(false)} className="p-2">
              <CloseIcon size={26} />
            </button>
          </div>
          <ul className="mt-6 flex flex-col" onClick={() => setOpen(false)}>
            {items.map(({ href, label, current }) => (
              <li key={href} className="border-b border-mist">
                <Link href={href} className={`block py-4 font-display text-2xl ${current ? 'text-brand' : ''}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center justify-between gap-4 pb-6">
            <div className="flex rounded-full border border-mist p-1 text-sm font-medium">
              {routing.locales.map((l) => (
                <Link
                  key={l}
                  href={switchTo}
                  locale={l}
                  className={`rounded-full px-3 py-1.5 ${l === locale ? 'bg-ink text-white' : 'text-stone'}`}
                >
                  {LANGUAGE_NAMES[l]}
                </Link>
              ))}
            </div>
            <a href={PORTAL_URL} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white">
              <ShieldLockIcon size={14} />
              {labels.portal}
            </a>
          </div>
        </div>
      )}
    </>
  )
}

function UnifiedRail(props: Props) {
  const { items, locale, switchTo } = useNav(props.links)
  return (
    <nav className="mx-auto flex max-w-content items-center gap-6 px-5 py-3">
      <Logo label={props.homeLabel} />
      <ul className="hidden flex-1 items-center justify-center gap-8 lg:flex">
        {items.map(({ href, label, current }) => (
          <li key={href}>
            <Link
              href={href}
              className={`relative py-2 text-sm font-medium after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-brand after:transition-transform ${current ? 'text-brand after:scale-x-100' : 'text-ink after:scale-x-0 hover:after:scale-x-100'}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="ml-auto hidden h-9 items-center rounded-full border border-mist bg-white/60 pl-1 text-sm font-medium lg:flex">
        {routing.locales.map((l) => (
          <Link
            key={l}
            href={switchTo}
            locale={l}
            className={`flex h-7 items-center rounded-full px-2.5 uppercase ${l === locale ? 'bg-mist text-ink' : 'text-stone hover:text-ink'}`}
          >
            {l}
          </Link>
        ))}
        <span className="mx-2 h-4 w-px bg-mist" />
        <a
          href={PORTAL_URL}
          aria-label={props.labels.portalAction}
          className="flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-white hover:bg-brand-deep"
        >
          <ShieldLockIcon size={13} />
          {props.labels.portal}
        </a>
      </div>
      <div className="ml-auto lg:hidden">
        <MobileMenu {...props} />
      </div>
    </nav>
  )
}

function UtilityBar(props: Props) {
  const { items, locale, switchTo } = useNav(props.links)
  return (
    <div>
      <div className="hidden bg-ink text-sm text-mist lg:block">
        <div className="mx-auto flex h-8 max-w-content items-center justify-end gap-6 px-5">
          <div className="flex items-center gap-3">
            {routing.locales.map((l) => (
              <Link
                key={l}
                href={switchTo}
                locale={l}
                className={l === locale ? 'text-white' : 'hover:text-white'}
              >
                {LANGUAGE_NAMES[l]}
              </Link>
            ))}
          </div>
          <span className="h-3 w-px bg-stone" />
          <a href={PORTAL_URL} className="inline-flex items-center gap-1.5 hover:text-white">
            <ShieldLockIcon size={11} />
            {props.labels.portalAction}
          </a>
        </div>
      </div>
      <nav className="mx-auto flex max-w-content items-center gap-6 px-5 py-2.5">
        <Logo label={props.homeLabel} size={52} />
        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {items.map(({ href, label, current }) => (
            <li key={href}>
              <Link
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${current ? 'bg-mist text-ink' : 'text-stone hover:bg-mist/60 hover:text-ink'}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto lg:hidden">
          <MobileMenu {...props} />
        </div>
      </nav>
    </div>
  )
}

function FloatingCapsule(props: Props) {
  const { items, locale, switchTo } = useNav(props.links)
  return (
    <div className="px-3 pt-3">
      <nav className="mx-auto flex max-w-content items-center gap-4 rounded-full border border-mist bg-white/70 py-1.5 pr-1.5 pl-4 shadow-sm backdrop-blur">
        <Logo label={props.homeLabel} size={44} />
        <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {items.map(({ href, label, current }) => (
            <li key={href}>
              <Link
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${current ? 'bg-canvas text-brand' : 'text-ink hover:bg-canvas'}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <details className="relative ml-auto hidden lg:block">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone hover:bg-canvas">
            <span className="uppercase">{locale}</span>
            <ChevronDownIcon size={10} />
          </summary>
          <ul className="absolute right-0 mt-2 w-36 rounded-2xl border border-mist bg-white p-1.5 text-sm shadow-lg">
            {routing.locales.map((l) => (
              <li key={l}>
                <Link
                  href={switchTo}
                  locale={l}
                  className={`block rounded-xl px-3 py-2 ${l === locale ? 'bg-canvas text-brand' : 'hover:bg-canvas'}`}
                >
                  {LANGUAGE_NAMES[l]}
                </Link>
              </li>
            ))}
          </ul>
        </details>
        <a
          href={PORTAL_URL}
          aria-label={props.labels.portalAction}
          className="hidden h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-brand lg:inline-flex"
        >
          <ShieldLockIcon size={13} />
          {props.labels.portal}
        </a>
        <div className="ml-auto lg:hidden">
          <MobileMenu {...props} />
        </div>
      </nav>
    </div>
  )
}

function CentredEditorial(props: Props) {
  const { items, locale, switchTo } = useNav(props.links)
  return (
    <nav className="mx-auto grid max-w-content grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 py-3">
      <ul className="hidden items-center gap-5 lg:flex">
        {items.map(({ href, label, current }) => (
          <li key={href}>
            <Link
              href={href}
              className={`font-display text-base ${current ? 'text-brand italic' : 'text-ink hover:text-brand'}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="lg:hidden" />
      <Logo label={props.homeLabel} />
      <div className="flex items-center justify-end gap-5 text-sm">
        <div className="hidden items-center gap-1 text-stone lg:flex">
          {routing.locales.map((l, i) => (
            <span key={l} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>/</span>}
              <Link href={switchTo} locale={l} className={`uppercase ${l === locale ? 'text-ink underline underline-offset-4' : 'hover:text-ink'}`}>
                {l}
              </Link>
            </span>
          ))}
        </div>
        <a
          href={PORTAL_URL}
          aria-label={props.labels.portalAction}
          className="hidden border-b border-ink pb-0.5 font-medium text-ink hover:border-brand hover:text-brand lg:inline"
        >
          {props.labels.portalAction} →
        </a>
        <div className="lg:hidden">
          <MobileMenu {...props} />
        </div>
      </div>
    </nav>
  )
}

function RailCapsuleControls(props: Props) {
  const { items, locale, switchTo } = useNav(props.links)
  return (
    <nav className="mx-auto flex max-w-content items-center gap-10 px-5 py-3">
      <Logo label={props.homeLabel} />
      <ul className="hidden items-center gap-8 lg:flex">
        {items.map(({ href, label, current }) => (
          <li key={href}>
            <Link
              href={href}
              className={`relative py-2 text-sm font-medium after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-brand after:transition-transform ${current ? 'text-brand after:scale-x-100' : 'text-ink after:scale-x-0 hover:after:scale-x-100'}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="ml-auto hidden items-center gap-2 lg:flex">
        <details className="relative">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone hover:bg-mist/60 hover:text-ink">
            <span className="uppercase">{locale}</span>
            <ChevronDownIcon size={10} />
          </summary>
          <ul className="absolute right-0 mt-2 w-36 rounded-2xl border border-mist bg-white p-1.5 text-sm shadow-lg">
            {routing.locales.map((l) => (
              <li key={l}>
                <Link
                  href={switchTo}
                  locale={l}
                  className={`block rounded-xl px-3 py-2 ${l === locale ? 'bg-canvas text-brand' : 'hover:bg-canvas'}`}
                >
                  {LANGUAGE_NAMES[l]}
                </Link>
              </li>
            ))}
          </ul>
        </details>
        <a
          href={PORTAL_URL}
          aria-label={props.labels.portalAction}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-white hover:bg-brand-deep"
        >
          <ShieldLockIcon size={13} />
          {props.labels.portal}
        </a>
      </div>
      <div className="ml-auto lg:hidden">
        <MobileMenu {...props} />
      </div>
    </nav>
  )
}

/** PROTOTYPE: navbar layouts picked by `?variant=`, with the live header as variant A. */
export default function NavbarVariants({ current, ...props }: Props & { current: ReactNode }) {
  return (
    <PrototypeSwitcher
      variants={[
        { key: 'F', name: 'B rail + D controls', node: <RailCapsuleControls {...props} /> },
        { key: 'A', name: 'Current', node: current },
        { key: 'B', name: 'Unified rail', node: <UnifiedRail {...props} /> },
        { key: 'C', name: 'Utility bar', node: <UtilityBar {...props} /> },
        { key: 'D', name: 'Floating capsule', node: <FloatingCapsule {...props} /> },
        { key: 'E', name: 'Centred editorial', node: <CentredEditorial {...props} /> },
      ]}
    />
  )
}
