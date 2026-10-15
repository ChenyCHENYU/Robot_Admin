/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @Description: 正式remote构建的登录HTTP fixture，验证公司发现无枚举、票据激活和受控错误
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import { expect, test } from '@playwright/test'
import { solveDemoCaptcha } from './d_login'

test.use({ baseURL: process.env.E2E_REMOTE_URL || 'http://127.0.0.1:4174' })
const contexts = [
  {
    id: 'company-primary',
    tenantId: 'tenant',
    tenantName: '测试租户',
    companyId: 'primary',
    companyName: '主公司',
    isPrimary: true,
    roles: [],
  },
  {
    id: 'company-second',
    tenantId: 'tenant',
    tenantName: '测试租户',
    companyId: 'second',
    companyName: '兼任公司',
    isPrimary: false,
    roles: [],
  },
]
const pending = {
  code: 0,
  data: {
    loginTicket: 'fixture-login-ticket',
    availableContexts: contexts,
    user: { id: 'fixture-user', username: 'fixture-user' },
  },
}

test('账号输入不发现公司；验证后清空密码并仅用票据激活所选公司', async ({
  page,
}) => {
  test.setTimeout(60_000)
  const requests: { path: string; body: Record<string, unknown> }[] = []
  const diagnostics: string[] = []
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.push(message.text())
  })
  await page.addInitScript(() => {
    Math.random = () => 0.5
  })
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname
    const body =
      route.request().method() === 'POST' ? route.request().postDataJSON() : {}
    requests.push({ path, body })
    if (path.endsWith('/auth/login')) return route.fulfill({ json: pending })
    if (path.endsWith('/auth/context/activate'))
      return route.fulfill({
        json: {
          code: 0,
          data: {
            token: 'fixture-access',
            refreshToken: 'fixture-refresh',
            expiresIn: 3600,
            user: pending.data.user,
            activeContext: contexts[1],
            availableContexts: contexts,
          },
        },
      })
    return route.fulfill({ json: { code: 0, data: [] } })
  })
  await page.goto('/#/login')
  await page.getByPlaceholder('请输入用户名').fill('fixture-user')
  await page.getByPlaceholder('请输入密码').first().fill('fixture-password')
  await expect(page.locator('.login-workspace')).toContainText(
    '账号验证成功后才能选择工作公司'
  )
  expect(requests.filter(request => request.path.includes('/auth/'))).toEqual(
    []
  )
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page.getByRole('button', { name: '确认工作公司' })).toBeEnabled()
  await expect(page.getByPlaceholder('请输入密码').first()).toHaveValue('')
  await page.locator('.login-workspace .n-base-selection').click()
  await page.getByText('兼任公司', { exact: true }).last().click()
  const stored = await page.evaluate(() =>
    JSON.stringify({
      local: { ...localStorage },
      session: { ...sessionStorage },
    })
  )
  expect(stored).not.toContain('fixture-password')
  expect(stored).not.toContain('fixture-login-ticket')
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
  await page.getByRole('button', { name: '确认工作公司' }).click()
  await expect(page).toHaveURL(/#\/401$/)
  const login = requests.filter(request => request.path.endsWith('/auth/login'))
  expect(login).toHaveLength(1)
  expect(login[0].body.password).toBe('fixture-password')
  expect(
    requests.find(request => request.path.endsWith('/auth/context/activate'))
      ?.body
  ).toEqual({
    loginTicket: 'fixture-login-ticket',
    contextId: 'company-second',
  })
  expect(
    requests.some(request => request.path.endsWith('/auth/login-companies'))
  ).toBe(false)
  expect(diagnostics.join(' ')).not.toContain('fixture-password')
  expect(page.url()).not.toContain('fixture-password')
})

test('不同账号认证失败使用相同提示且不显示公司或原始错误报文', async ({
  page,
}) => {
  test.setTimeout(60_000)
  let attempts = 0
  await page.addInitScript(() => {
    Math.random = () => 0.5
  })
  await page.route('**/auth/login', route =>
    route.fulfill({
      json: {
        code: ++attempts === 1 ? 40101 : 40102,
        msg: 'raw fixture-password disabled-account',
        data: null,
      },
    })
  )
  await page.goto('/#/login')
  await page.getByPlaceholder('请输入用户名').fill('unknown-account')
  await page.getByPlaceholder('请输入密码').first().fill('fixture-password')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page.locator('.login-workspace')).toContainText(
    '账号或密码错误，请重新验证'
  )
  await expect(page.locator('body')).not.toContainText('raw fixture-password')
  await page.getByPlaceholder('请输入用户名').fill('disabled-account')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page.locator('.login-workspace')).toContainText(
    '账号或密码错误，请重新验证'
  )
  await expect(page.getByRole('button', { name: '确认工作公司' })).toHaveCount(
    0
  )
  expect(attempts).toBe(2)
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
})

test('账号改变立即作废已验证公司和票据，重新验证不复用密码', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    Math.random = () => 0.5
  })
  await page.route('**/auth/login', route => route.fulfill({ json: pending }))
  await page.goto('/#/login')
  await page.getByPlaceholder('请输入用户名').fill('fixture-user')
  await page.getByPlaceholder('请输入密码').first().fill('fixture-password')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page.getByRole('button', { name: '确认工作公司' })).toBeEnabled()
  await page.getByRole('button', { name: '重新验证账号' }).click()
  await expect(page.getByRole('button', { name: '确认工作公司' })).toHaveCount(
    0
  )
  await expect(page.getByPlaceholder('请输入密码').first()).toHaveValue('')
  await expect(page.locator('.login-workspace')).toContainText(
    '账号验证成功后才能选择工作公司'
  )
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
})
