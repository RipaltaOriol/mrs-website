import type { Locator } from '@playwright/test'

const originsOf = async (blocks: Locator) =>
  blocks.evaluateAll((elements) =>
    elements.map((el) => {
      const { x, y } = el.getBoundingClientRect()
      return { x: Math.round(x), y: Math.round(y) }
    }),
  )

/** How many columns a set of blocks is laid out in. */
export async function columnsOf(blocks: Locator): Promise<number> {
  return new Set((await originsOf(blocks)).map(({ x }) => x)).size
}

/** How many rows a set of blocks is laid out in. */
export async function rowsOf(blocks: Locator): Promise<number> {
  return new Set((await originsOf(blocks)).map(({ y }) => y)).size
}

/** How far a region overflows its own width. */
export async function overflowOf(region: Locator): Promise<number> {
  return region.evaluate((el) => el.scrollWidth - el.clientWidth)
}
