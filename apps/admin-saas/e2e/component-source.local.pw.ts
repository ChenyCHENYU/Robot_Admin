import { expect, test } from '@playwright/test'

test('city selection loads on open and remains operable by keyboard', async ({
  page,
}) => {
  await page.goto('/#/preview/city')
  const trigger = page.locator('.city-selector-trigger')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.city-selector-content')).toBeVisible()
  const firstCity = page.locator('.city-list .city-item').first()
  await expect(firstCity).toBeVisible()
  const cityName = (await firstCity.textContent())?.trim()
  expect(cityName).toBeTruthy()
  await firstCity.click()
  await expect(trigger).toContainText(cityName!)
})

test('code fullscreen closes through modal keyboard handling', async ({
  page,
}) => {
  await page.goto('/#/preview/code')
  const fullscreenButton = page
    .locator('.c-code-wrapper')
    .getByRole('button', { name: '全屏查看' })
    .first()
  await fullscreenButton.click()
  await expect(page.locator('.fullscreen-content')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('.fullscreen-content')).not.toBeVisible()
})
