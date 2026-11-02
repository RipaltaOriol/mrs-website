'use client'

import { useId, useRef, useState, type KeyboardEvent } from 'react'
import type { PracticeArea } from '@/lib/content'
import { ChevronDownIcon } from './icons'

/** The Practice Areas as a full-width accordion on the ink surface, each row opening in place. */
export default function PracticeAreas({ areas }: { areas: PracticeArea[] }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set([0]))
  const triggers = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()

  const toggle = (index: number) => {
    setOpen((current) => {
      const next = new Set(current)
      if (!next.delete(index)) next.add(index)
      return next
    })
  }

  const onKeyDown = (index: number) => (e: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: areas.length - 1,
    }
    const to = moves[e.key]
    if (to === undefined) return
    e.preventDefault()
    triggers.current[(to + areas.length) % areas.length]?.focus()
  }

  return (
    <div className="border-t border-stone">
      {areas.map((area, index) => {
        const expanded = open.has(index)
        return (
          <div key={area.title} className="border-b border-stone">
            <h3 className="mb-0">
              <button
                ref={(el) => {
                  triggers.current[index] = el
                }}
                type="button"
                aria-expanded={expanded}
                aria-controls={`${id}-panel-${index}`}
                onClick={() => toggle(index)}
                onKeyDown={onKeyDown(index)}
                className="flex w-full items-start gap-4 py-5 text-start font-sans hover:text-mist md:py-6"
              >
                <span className="flex-1">
                  <span className="block font-display text-2xl text-balance">{area.title}</span>
                  <span className="mt-1 block max-w-measure text-sm text-mist">{area.summary}</span>
                </span>
                <ChevronDownIcon
                  size={20}
                  className={`mt-1.5 shrink-0 text-mist ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
            </h3>

            <div id={`${id}-panel-${index}`} hidden={!expanded} className="pb-8">
              {area.paragraphs.map((paragraph) => (
                <p key={paragraph} className="max-w-measure text-pretty">
                  {paragraph}
                </p>
              ))}
              <ul className="grid gap-x-10 sm:grid-cols-2">
                {area.items.map((item) => (
                  <li key={item} className="border-t border-stone py-2 text-sm text-mist">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}
