import { expect, test, type Page } from '@playwright/test'

const VIEWPORTS = [
  { name: 'phone', viewport: { width: 390, height: 844 }, ratio: 3 / 2 },
  { name: 'desktop', viewport: { width: 1280, height: 900 }, ratio: 12 / 5 },
]

const band = (page: Page) => page.locator('main .treated').first()

for (const { name, viewport, ratio } of VIEWPORTS) {
  test.describe(`the homepage image band on a ${name}`, () => {
    test.use({ viewport })

    test('spans the full width at its locked ratio', async ({ page }) => {
      await page.goto('/')
      const box = await band(page).boundingBox()
      const width = await page.evaluate(() => document.documentElement.clientWidth)
      expect(box?.x).toBe(0)
      expect(box?.width).toBe(width)
      expect(box!.width / box!.height).toBeCloseTo(ratio, 1)
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

test('the band photograph renders under the shared treatment', async ({ page }) => {
  await page.goto('/')
  const filter = await band(page).locator('img').evaluate((img) => getComputedStyle(img).filter)
  expect(filter).toMatch(/saturate\(0?\.\d+\)/)
  const tint = await band(page).evaluate((frame) => {
    const after = getComputedStyle(frame, '::after')
    return { blend: after.mixBlendMode, opacity: Number(after.opacity), content: after.content }
  })
  expect(tint.content).not.toBe('none')
  expect(tint.blend).toBe('multiply')
  expect(tint.opacity).toBeGreaterThan(0)
  expect(tint.opacity).toBeLessThan(1)
})

test('nothing on the homepage advances or moves on its own', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const snapshot = () => page.locator('main').evaluate((main) => main.innerHTML)
  const before = await snapshot()
  await page.waitForTimeout(6_000)
  expect(await snapshot()).toBe(before)
  const running = await page.evaluate(() =>
    document.getAnimations().filter((animation) => animation.playState === 'running').length,
  )
  expect(running).toBe(0)
})
