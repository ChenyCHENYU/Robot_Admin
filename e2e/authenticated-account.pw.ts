/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-15
 * @Description: remote产物的认证基础路由HTTP fixture，非真实Cloud联调证据
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import { expect, test, type Page } from '@playwright/test'

test.use({ baseURL: 'http://127.0.0.1:4174' })

/** 隔离浏览器路由鉴权测试；只在fixture测试内建立无业务角色的会话。 */
const installSelfSession = (page: Page) =>
  page.addInitScript(() => {
    const context = {
      id: 'self-context',
      tenantId: 'self-tenant',
      companyId: 'self-company',
      tenantName: '测试租户',
      companyName: '自助测试公司',
      isPrimary: true,
      roles: [],
    }
    localStorage.setItem('token', JSON.stringify('self-only-fixture-access'))
    localStorage.setItem('timeStamp', JSON.stringify(Date.now()))
    localStorage.setItem(
      'token_expires_in',
      JSON.stringify(Date.now() + 3_600_000)
    )
    localStorage.setItem(
      'userInfo',
      JSON.stringify({ username: 'self-user', displayName: 'Self User' })
    )
    localStorage.setItem('activeAuthContext', JSON.stringify(context))
    localStorage.setItem('authContexts', JSON.stringify([context]))
  })

for (const path of ['profile', 'security', 'activity-log']) {
  test(`匿名访问${path}自助页仍回到登录，不发本人数据请求`, async ({
    page,
  }) => {
    const requested: string[] = []
    page.on('request', request => {
      if (request.url().includes('/api/account/')) requested.push(request.url())
    })
    await page.goto('/#/account/' + path)
    await expect(page).toHaveURL(/#\/login$/)
    expect(requested).toEqual([])
  })
}

test('有效会话没有业务菜单仍能访问三个本人页面，业务页保持拒绝', async ({
  page,
}) => {
  await installSelfSession(page)
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    const data =
      path === '/api/account/profile'
        ? {
            username: 'self-user',
            nickname: 'Self User',
            email: null,
            phone: null,
            role: '',
            department: '独立部门',
          }
        : path === '/api/account/security-settings'
          ? [
              {
                key: 'mfa',
                label: '双因素认证',
                description: '尚未启用',
                enabled: false,
                icon: '',
              },
            ]
          : path === '/api/auth/button-list'
            ? {}
            : []
    return route.fulfill({ json: { code: 0, data, msg: '成功' } })
  })
  await page.goto('/#/account/profile')
  await expect(page.locator('.profile-page')).toBeVisible()
  await expect(page.locator('.profile-page')).toContainText('Self User')
  await page.goto('/#/account/security')
  await expect(page.locator('.security-page')).toBeVisible()
  const toggle = page.getByRole('switch')
  await expect(toggle).toHaveClass(/n-switch--disabled/)
  await toggle.click({ force: true })
  await toggle.press('Space')
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await page.goto('/#/account/activity-log')
  await expect(page.locator('.activity-log-page')).toBeVisible()
  await page.goto('/#/sys-manage/permission-manage')
  await expect(page).toHaveURL(/#\/401$/)
  expect(
    await page.evaluate(() =>
      Boolean(JSON.parse(localStorage.getItem('token') || 'null'))
    )
  ).toBe(true)
})

test('服务器尝试用其他组件覆盖账户静态路径时登录状态失效，不能挂载业务页', async ({
  page,
}) => {
  await installSelfSession(page)
  await page.route('**/auth/menu-list', route =>
    route.fulfill({
      json: {
        code: 0,
        data: [
          {
            path: '/account/profile',
            name: 'robot-menu:override',
            component: '/sys-manage/user-manage/index',
          },
        ],
      },
    })
  )
  await page.goto('/#/account/profile')
  await expect(page).toHaveURL(/#\/login$/)
  await expect(page.locator('.profile-page')).toHaveCount(0)
  expect(
    await page.evaluate(() =>
      Boolean(JSON.parse(localStorage.getItem('token') || 'null'))
    )
  ).toBe(false)
})
