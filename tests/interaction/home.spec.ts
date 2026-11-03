import { expect, test, type Page } from '@playwright/test'

const VIEWPORTS = [
  { name: 'phone', viewport: { width: 390, height: 844 } },
  { name: 'desktop', viewport: { width: 1280, height: 900 } },
]

const band = (page: Page) => page.locator('main [data-band]')

for (const { name, viewport } of VIEWPORTS) {
  test.describe(`the homepage abstract band on a ${name}`, () => {
    test.use({ viewport })

    test('spans the full width and ends exactly at the bottom of the first screen', async ({ page }) => {
      await page.goto('/')
      const box = (await band(page).boundingBox())!
      const width = await page.evaluate(() => document.documentElement.clientWidth)
      expect(box.x).toBe(0)
      expect(box.width).toBe(width)
      expect(box.y + box.height).toBeCloseTo(viewport.height, 0)
      expect(box.height).toBeGreaterThanOrEqual(256)
      expect(box.height).toBeLessThan(viewport.height / 2)
    })

    test('sits below the hero, not behind it', async ({ page }) => {
      await page.goto('/')
      const hero = await page.locator('main h1').boundingBox()
      const portal = await page.locator('main a.btn').first().boundingBox()
      const image = await band(page).boundingBox()
      expect(image!.y).toBeGreaterThanOrEqual(hero!.y + hero!.height)
      expect(image!.y).toBeGreaterThanOrEqual(portal!.y + portal!.height)
    })
  })
}

const scale = (page: Page) => band(page).evaluate((frame) => new DOMMatrix(getComputedStyle(frame).transform).a)

test('the band zooms in from its top edge as the page scrolls, and only then', async ({ page }) => {
  await page.goto('/')
  expect(await scale(page)).toBe(1)
  const top = (await band(page).boundingBox())!.y
  await page.evaluate(() => window.scrollTo(0, window.innerHeight / 2))
  await expect.poll(() => scale(page)).toBeCloseTo(1.1, 2)
  expect((await band(page).boundingBox())!.y).toBeCloseTo(top - (await page.evaluate(() => window.scrollY)), 0)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3))
  await expect.poll(() => scale(page)).toBeCloseTo(1.2, 2)
})

test.describe('with a reduced-motion preference', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the band holds still while the page scrolls', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, window.innerHeight))
    await page.waitForTimeout(300)
    expect(await scale(page)).toBe(1)
  })
})

test('nothing on the homepage advances or moves on its own', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(() =>
    [...document.querySelectorAll('main img')].every((image) => (image as HTMLImageElement).complete),
  )
  const snapshot = () => page.locator('main').evaluate((main) => main.innerHTML)
  const before = await snapshot()
  await page.waitForTimeout(6_000)
  expect(await snapshot()).toBe(before)
  const running = await page.evaluate(() =>
    document.getAnimations().filter((animation) => animation.playState === 'running').length,
  )
  expect(running).toBe(0)
})

for (const { name, viewport } of VIEWPORTS) {
  test.describe(`the Practice Areas on a ${name}`, () => {
    test.use({ viewport })

    test('are the dominant section: the one full-bleed ink surface, under the largest heading', async ({ page }) => {
      await page.goto('/')
      const practice = page.locator('main section#content')
      const box = (await practice.boundingBox())!
      const width = await page.evaluate(() => document.documentElement.clientWidth)
      expect(box.x).toBe(0)
      expect(box.width).toBe(width)
      expect(await practice.getAttribute('data-surface')).toBe('ink')

      const surfaces = await page
        .locator('main section')
        .evaluateAll((sections) => sections.map((section) => getComputedStyle(section).backgroundColor))
      const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
      expect(surfaces.filter((surface) => !['rgba(0, 0, 0, 0)', canvas].includes(surface))).toHaveLength(1)

      const size = (selector: string) =>
        page.locator(selector).evaluateAll((headings) => headings.map((h) => parseFloat(getComputedStyle(h).fontSize)))
      const [heading] = await size('main #content h2')
      for (const other of await size('main section:not(#content) h2')) expect(heading).toBeGreaterThan(other)
    })
  })
}
