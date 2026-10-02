import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  page.on('console', message => {
    if (message.type() === 'error') console.error(`Browser: ${message.text()}`)
  })
  page.on('pageerror', error => console.error(`Page: ${error.message}`))
  page.on('requestfailed', request =>
    console.error(
      `Request failed: ${request.url()} ${request.failure()?.errorText}`
    )
  )
  page.on('response', response => {
    if (response.status() >= 400)
      console.error(`HTTP ${response.status()}: ${response.url()}`)
  })
})

test('物流子应用实际加载宿主的远程表单和表格', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))

  await page.goto('/#/waybill')
  await expect(page.getByText('WB20260326010')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByPlaceholder('请输入运单号')).toBeVisible()
  await expect(page.getByText('远程 Form 组件加载失败')).toHaveCount(0)
  await expect(page.getByText('远程 Table 组件加载失败')).toHaveCount(0)
  await page.getByPlaceholder('请输入运单号').fill('WB20260326011')
  await page.getByRole('button', { name: '提交' }).click()
  await expect(page.getByText('WB20260326011')).toBeVisible()
  await expect(page.getByText('WB20260326010')).toHaveCount(0)
  expect(pageErrors).toEqual([])
})

test('物流仪表盘加载远程图标和表格', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))

  await page.goto('/#/')
  await expect(page.getByText('WB20260326001')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('远程组件加载失败')).toHaveCount(0)
  expect(pageErrors).toEqual([])
})
