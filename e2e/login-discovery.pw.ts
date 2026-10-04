/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\e2e\login-discovery.pw.ts
 * @Description: 远端公司发现的乱序响应、清空账号和重试交互
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Route } from '@playwright/test'

test.use({ baseURL: process.env.E2E_REMOTE_URL || 'http://127.0.0.1:4174' })

const company = {
  id: 'company-new',
  isPrimary: true,
  tenantName: '测试租户',
  companyName: '当前账号公司',
}

/** 按远端稳定契约返回最小公司展示信息。 */
const fulfillCompanies = (route: Route, companies: (typeof company)[]) =>
  route.fulfill({ json: { code: '0', data: { companies } } })

test('旧账号延迟响应不会覆盖新账号公司，清空账号立即禁用提交', async ({
  page,
}) => {
  let oldRoute: Route | undefined
  let signalOldRequest: () => void = () => undefined
  const oldRequest = new Promise<void>(resolve => {
    signalOldRequest = resolve
  })
  await page.route('**/auth/login-companies', async route => {
    if (route.request().postDataJSON().username === 'old-account') {
      oldRoute = route
      signalOldRequest()
      return
    }
    await fulfillCompanies(route, [company])
  })
  await page.goto('/#/login')
  await page.getByPlaceholder('请输入用户名').fill('old-account')
  await oldRequest
  await page.getByPlaceholder('请输入用户名').fill('new-account')
  await expect(page.locator('.login-workspace')).toContainText('当前账号公司')
  if (!oldRoute) throw new Error('旧账号查询未发起')
  const oldResponse = page.waitForResponse(
    response =>
      response.url().includes('/auth/login-companies') &&
      response.request().postDataJSON().username === 'old-account'
  )
  await fulfillCompanies(oldRoute, [
    { ...company, id: 'company-old', companyName: '旧账号公司' },
  ])
  await (await oldResponse).finished()
  await expect(page.locator('.login-workspace')).toContainText('当前账号公司')
  await expect(page.locator('.login-workspace')).not.toContainText('旧账号公司')
  await page.getByPlaceholder('请输入用户名').clear()
  await expect(page.locator('.login-workspace')).not.toContainText(
    '当前账号公司'
  )
  await expect(page.locator('.c-login__submit-btn')).toBeDisabled()
})

test('公司查询失败可重试，成功后恢复默认选择', async ({ page }) => {
  let attempts = 0
  await page.route('**/auth/login-companies', async route => {
    attempts++
    if (attempts === 1)
      await route.fulfill({
        json: { code: '1', msg: '查询暂不可用', data: { companies: [] } },
      })
    else await fulfillCompanies(route, [company])
  })
  await page.goto('/#/login')
  await page.getByPlaceholder('请输入用户名').fill('new-account')
  await expect(page.getByRole('button', { name: '重新查询' })).toBeVisible()
  await expect(page.locator('.c-login__submit-btn')).toBeDisabled()
  await page.getByRole('button', { name: '重新查询' }).click()
  await expect(page.locator('.login-workspace')).toContainText('当前账号公司')
  await expect(page.locator('.login-workspace')).toContainText(
    '已自动选择唯一关联公司'
  )
  await expect(page.getByRole('button', { name: '重新查询' })).toHaveCount(0)
  expect(attempts).toBe(2)
})
