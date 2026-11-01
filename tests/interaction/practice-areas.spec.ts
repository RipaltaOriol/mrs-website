import { expect, test, type Locator, type Page } from '@playwright/test'
import { getPracticeAreas } from '@/lib/content'
import { tabThrough } from './focus'

const AREAS = getPracticeAreas('ca')

const PHONE = { width: 390, height: 844 }

const rows = (page: Page) => page.locator('#content button[aria-expanded]')

const panelOf = async (page: Page, index: number) =>
  page.locator(`#${await rows(page).nth(index).getAttribute('aria-controls')}`)

const documentTop = (trigger: Locator) =>
  trigger.evaluate((element) => element.getBoundingClientRect().top + window.scrollY)

const focusedPanel = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute('aria-controls') ?? null)

test.describe('the Practice Areas on a phone', () => {
  test.use({ viewport: PHONE })

  test('stacks all nine rows down the page with nothing off to the side', async ({ page }) => {
    await page.goto('/')
    await expect(rows(page)).toHaveCount(AREAS.length)

    const tops = await rows(page).evaluateAll((triggers) =>
      triggers.map((trigger) => trigger.getBoundingClientRect().top + window.scrollY),
    )
    for (const [index, top] of tops.slice(1).entries()) expect(top).toBeGreaterThan(tops[index])

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('holds no scrollable element, even with every row open', async ({ page }) => {
    await page.goto('/')
    for (let index = 0; index < AREAS.length; index++) {
      const trigger = rows(page).nth(index)
      if ((await trigger.getAttribute('aria-expanded')) === 'false') await trigger.click()
    }

    const scrollers = await page.locator('#content, #content *').evaluateAll((elements) =>
      elements
        .filter((element) => {
          const { overflowX, overflowY } = getComputedStyle(element)
          const clips = /auto|scroll/
          return (
            (clips.test(overflowY) && element.scrollHeight > element.clientHeight + 1) ||
            (clips.test(overflowX) && element.scrollWidth > element.clientWidth + 1)
          )
        })
        .map((element) => element.tagName.toLowerCase()),
    )
    expect(scrollers).toEqual([])
  })
})

test('puts a collapsed row on screen as title and summary, with its body off it', async ({ page }) => {
  await page.goto('/')
  const third = rows(page).nth(2)

  await expect(third.getByText(AREAS[2].title, { exact: true })).toBeVisible()
  await expect(third.getByText(AREAS[2].summary, { exact: true })).toBeVisible()
  await expect(await panelOf(page, 2)).toBeHidden()
  await expect(await panelOf(page, 0)).toBeVisible()
})

test('opens a row in place, moving neither the row nor the ones already open', async ({ page }) => {
  await page.goto('/')
  const fifth = rows(page).nth(4)
  const [firstBefore, fifthBefore] = [await documentTop(rows(page).first()), await documentTop(fifth)]

  await fifth.click()

  await expect(fifth).toHaveAttribute('aria-expanded', 'true')
  await expect(await panelOf(page, 4)).toBeVisible()
  expect(await documentTop(fifth)).toBeCloseTo(fifthBefore, 0)
  expect(await documentTop(rows(page).first())).toBeCloseTo(firstBefore, 0)
  await expect(rows(page).first()).toHaveAttribute('aria-expanded', 'true')
})

test('every row opens and closes from the keyboard alone', async ({ page }) => {
  await page.goto('/')
  const second = rows(page).nth(1)
  await second.focus()

  await page.keyboard.press('Enter')
  await expect(second).toHaveAttribute('aria-expanded', 'true')
  await expect(await panelOf(page, 1)).toBeVisible()

  await page.keyboard.press(' ')
  await expect(second).toHaveAttribute('aria-expanded', 'false')
  await expect(await panelOf(page, 1)).toBeHidden()
})

test('the arrow, Home and End keys walk the rows', async ({ page }) => {
  await page.goto('/')
  const controls = async (index: number) => rows(page).nth(index).getAttribute('aria-controls')

  await rows(page).nth(1).focus()
  await page.keyboard.press('ArrowDown')
  expect(await focusedPanel(page)).toBe(await controls(2))

  await page.keyboard.press('ArrowUp')
  expect(await focusedPanel(page)).toBe(await controls(1))

  await page.keyboard.press('End')
  expect(await focusedPanel(page)).toBe(await controls(AREAS.length - 1))

  await page.keyboard.press('Home')
  expect(await focusedPanel(page)).toBe(await controls(0))
})

test('the arrow keys carry focus round from the last row to the first', async ({ page }) => {
  await page.goto('/')
  const controls = async (index: number) => rows(page).nth(index).getAttribute('aria-controls')
  const last = AREAS.length - 1

  await rows(page).nth(last).focus()
  await page.keyboard.press('ArrowDown')
  expect(await focusedPanel(page)).toBe(await controls(0))

  await page.keyboard.press('ArrowUp')
  expect(await focusedPanel(page)).toBe(await controls(last))
})

test('each row takes a visible focus ring in the tab order', async ({ page }) => {
  await page.goto('/')
  await rows(page).first().focus()

  const stops = await tabThrough(page, AREAS.length - 1)

  expect(stops).toHaveLength(AREAS.length - 1)
  for (const [index, stop] of stops.entries()) {
    expect(stop.control, stop.control).toContain(AREAS[index + 1].title)
    expect(stop.ringIsVisible, stop.control).toBe(true)
  }
})
