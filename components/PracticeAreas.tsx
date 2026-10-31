'use client'

import { useId, useRef, useState, type KeyboardEvent } from 'react'

export type PracticeArea = { title: string; paragraphs: string[]; items: string[] }

/** The Practice Areas as tabs, as react-bootstrap's `Tabs` rendered them. */
export default function PracticeAreas({ areas }: { areas: PracticeArea[] }) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()

  const focusTab = (index: number) => {
    const next = (index + areas.length) % areas.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: areas.length - 1,
    }
    if (e.key in moves) {
      e.preventDefault()
      focusTab(moves[e.key])
    }
  }

  return (
    <div>
      <div role="tablist" className="flex flex-wrap border-b border-mist" onKeyDown={onKeyDown}>
        {areas.map((area, i) => (
          <button
            key={area.title}
            ref={(el) => {
              tabs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-brand ${i === active ? 'bg-mist' : ''}`}
          >
            {area.title}
          </button>
        ))}
      </div>
      {areas.map((area, i) => (
        <div
          key={area.title}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          tabIndex={0}
          className="max-h-125 bg-mist p-5"
        >
          <div className="h-115 overflow-auto">
            {area.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
            <ul className="list-disc ps-8">
              {area.items.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}
