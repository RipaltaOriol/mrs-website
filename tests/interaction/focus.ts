import type { Locator, Page } from '@playwright/test'

/** How a control identifies itself in a tab order: its tag and its destination or name. */
export type Control = string

type Described = { tag: string; href: string | null; label: string | null; text: string }

const name = ({ tag, href, label, text }: Described): Control => `${tag} ${href ?? label ?? text}`

/** Every link and button a region holds. */
export function controlLocator(region: Locator): Locator {
  return region.locator('a[href], button')
}

/** The controls a region offers, in document order, as a tab stop names them. */
export async function controlsIn(region: Locator): Promise<Control[]> {
  const described = await controlLocator(region).evaluateAll((elements) =>
    elements
      .filter((el) => el.checkVisibility())
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        href: el.getAttribute('href'),
        label: el.getAttribute('aria-label'),
        text: el.textContent?.trim() ?? '',
      })),
  )
  return described.map(name)
}

/** What Tab landed on, and whether it drew an outline a sighted user can see. */
export type TabStop = { control: Control; ringIsVisible: boolean }

// `:focus-visible` follows the browser's own heuristic, which a programmatic
// `focus()` does not satisfy for a button. Only a real Tab press does.
export async function tabThrough(page: Page, steps: number): Promise<TabStop[]> {
  const stops: TabStop[] = []
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('Tab')
    const stop = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const { outlineStyle, outlineWidth, outlineColor } = getComputedStyle(el)
      return {
        described: {
          tag: el.tagName.toLowerCase(),
          href: el.getAttribute('href'),
          label: el.getAttribute('aria-label'),
          text: el.textContent?.trim() ?? '',
        },
        ringIsVisible:
          outlineStyle !== 'none' &&
          parseFloat(outlineWidth) > 0 &&
          !/^rgba\(.*,\s*0\)$/.test(outlineColor),
      }
    })
    if (stop) stops.push({ control: name(stop.described), ringIsVisible: stop.ringIsVisible })
  }
  return stops
}

/** The alpha channel of a region's bottom border. */
export async function bottomBorderAlpha(region: Locator): Promise<number> {
  return region.evaluate((el) => {
    const { borderBottomColor } = getComputedStyle(el)
    const [, alpha] = borderBottomColor.match(/^rgba\(.*,\s*([\d.]+)\)$/) ?? []
    return alpha === undefined ? 1 : Number(alpha)
  })
}
