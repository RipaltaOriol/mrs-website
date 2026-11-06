'use client'

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { counterpartPath, ENDONYMS } from '@/i18n/counterpart'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { ChevronDownIcon } from './icons'

/** The header's Locale picker: the current Locale code opening a list of the others by name. */
export default function LocaleMenu() {
  const current = useLocale()
  const pathname = usePathname()
  const t = useTranslations('common')
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !open) return
    setOpen(false)
    button.current?.focus()
  }

  const onBlur = (e: FocusEvent) => {
    if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-stone uppercase hover:bg-mist/60 hover:text-ink"
      >
        <span className="sr-only">{t('locale')}: </span>
        {current}
        <ChevronDownIcon size={10} className={open ? 'rotate-180' : undefined} />
      </button>
      <ul
        id={listId}
        hidden={!open}
        className="absolute right-0 z-10 mt-2 w-36 rounded-2xl border border-mist bg-white p-1.5 text-sm shadow-lg"
      >
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={counterpartPath(pathname)}
              locale={locale}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? 'true' : undefined}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-3 py-2 ${locale === current ? 'bg-canvas text-brand' : 'text-ink hover:bg-canvas'}`}
            >
              {ENDONYMS[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
