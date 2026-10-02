import { expect, test } from '@playwright/test'

test('门户和微应用入口都要求登录', async ({ page }) => {
  await page.goto('/#/portal')
  await expect(page).toHaveURL(/#\/login$/)
  await page.goto('/#/micro-app/logistics')
  await expect(page).toHaveURL(/#\/login$/)
})

test('生产环境未配置子应用时，门户标记待集成且容器明确提示', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('token', JSON.stringify('mock-access.e2e'))
    localStorage.setItem('userInfo', JSON.stringify({ username: 'E2E' }))
  })

  await page.goto('/#/portal')
  await expect(page.locator('.portal-workspace')).toBeVisible()
  await expect(page.getByText('智慧物流管理系统').first()).toBeVisible()
  await page.goto('/#/micro-app/logistics')
  await expect(page.getByText('未配置有效的子应用 HTTPS 地址', { exact: false })).toBeVisible()
  expect(errors).toEqual([])
})
