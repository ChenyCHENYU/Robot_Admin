/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @Description: 真实业务构建的浏览器 HTTP 合同验收；响应由隔离测试控制，不冒充 Cloud 联调
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'

/** 合成当前公司会话，仅用于远端构建请求合同验证。 */
async function installContractSession(page: Page) {
  await page.addInitScript(() => {
    const context = {
      id: 'contract-company',
      isPrimary: true,
      tenantId: 'contract-tenant',
      tenantName: '验收租户',
      companyId: 'contract-company',
      companyName: '验收公司',
      roles: [],
    }
    localStorage.setItem('token', JSON.stringify('contract-access'))
    localStorage.setItem(
      'userInfo',
      JSON.stringify({ username: 'contract-user', displayName: '合同用户' })
    )
    localStorage.setItem(
      'token_expires_in',
      JSON.stringify(Date.now() + 3_600_000)
    )
    localStorage.setItem('timeStamp', JSON.stringify(Date.now()))
    localStorage.setItem('activeAuthContext', JSON.stringify(context))
    localStorage.setItem('authContexts', JSON.stringify([context]))
  })
}

test('远端业务构建接受无首页的合法菜单并按稳定菜单身份注册', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await installContractSession(page)
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    const data = path.endsWith('/auth/menu-list')
      ? [
          {
            path: '/sys-manage/menu-manage',
            name: 'robot-menu:catalog-1',
            component: '/sys-manage/menu-manage/index',
            meta: { title: '合法授权目录', keepAlive: true },
          },
        ]
      : path.endsWith('/auth/button-list')
        ? {}
        : []
    return route.fulfill({ json: { code: 0, data, msg: '成功' } })
  })
  await page.goto('http://127.0.0.1:4174/#/home')
  await expect(page).toHaveURL(/#\/sys-manage\/menu-manage$/)
  await expect(page.locator('.menu-management')).toBeVisible()
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('token') ?? 'null')
    )
  ).toBe('contract-access')
  expect(errors).toEqual([])
})

test('远端业务构建的空菜单进入无权限页，不清除合法会话或附送首页', async ({
  page,
}) => {
  await installContractSession(page)
  await page.route('**/api/**', route =>
    route.fulfill({ json: { code: 0, data: [], msg: '成功' } })
  )
  await page.goto('http://127.0.0.1:4174/#/home')
  await expect(page).toHaveURL(/#\/401$/)
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('token') ?? 'null')
    )
  ).toBe('contract-access')
})

test('远端资料页面仅保存支持字段，显式清空联系方式后重读服务器结果', async ({
  page,
}) => {
  await installContractSession(page)
  let profile = {
    username: 'contract-user',
    nickname: '合同用户',
    email: 'before@example.com',
    phone: '13800138000',
  }
  const writes: unknown[] = []
  await page.route('**/api/**', route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (path.endsWith('/account/profile') && request.method() === 'PUT') {
      const body = request.postDataJSON()
      writes.push(body)
      profile = { ...profile, ...body }
      return route.fulfill({ json: { code: 0, data: null } })
    }
    const data = path.endsWith('/auth/menu-list')
      ? [
          {
            path: '/account/profile',
            name: 'robot-menu:profile',
            component: '/account/profile/index',
            meta: { title: '资料' },
          },
        ]
      : path.endsWith('/account/profile')
        ? profile
        : []
    return route.fulfill({ json: { code: 0, data } })
  })
  await page.goto('http://127.0.0.1:4174/#/account/profile')
  const form = page.locator('.profile-form-card .n-form')
  await expect(
    page.getByText('当前服务可保存昵称、邮箱和手机号；头像与简介暂不支持修改。')
  ).toBeVisible()
  await expect(
    form.locator('.n-form-item').filter({ hasText: '个人简介' })
  ).toHaveCount(0)
  await expect(page.locator('.avatar-overlay')).toHaveCount(0)
  const field = (label: string) =>
    form
      .locator('.n-form-item')
      .filter({
        has: page.locator('.n-form-item-label').filter({ hasText: label }),
      })
      .getByRole('textbox')
  await field('昵称').fill('服务器资料')
  await field('邮箱').fill('')
  await field('手机').fill('')
  await form.getByRole('button', { name: '保存修改', exact: true }).click()
  await expect(page.locator('.info-name')).toHaveText('服务器资料')
  expect(writes).toEqual([{ nickname: '服务器资料', email: null, phone: null }])
  await expect(field('邮箱')).toHaveValue('')
  await expect(field('手机')).toHaveValue('')
})

test('远端安全页面按服务事实展示只读开关，密码操作仍可进入', async ({
  page,
}) => {
  await installContractSession(page)
  const writes: string[] = []
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    if (route.request().method() !== 'GET') writes.push(path)
    const data = path.endsWith('/auth/menu-list')
      ? [
          {
            path: '/account/security',
            name: 'robot-menu:security',
            component: '/account/security/index',
            meta: { title: '安全' },
          },
        ]
      : path.endsWith('/account/security-settings')
        ? [
            {
              key: 'twoFactor',
              label: '双因素认证',
              description: '未启用',
              icon: '',
              enabled: false,
            },
            {
              key: 'password',
              label: '登录密码',
              description: '支持修改',
              icon: '',
              enabled: true,
              action: '修改',
            },
          ]
        : []
    return route.fulfill({ json: { code: 0, data } })
  })
  await page.goto('http://127.0.0.1:4174/#/account/security')
  const toggle = page.locator('.security-page .n-switch')
  await expect(toggle).toHaveClass(/n-switch--disabled/)
  await toggle.click({ force: true })
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await expect(
    page.getByText(
      '认证能力由服务端统一配置，当前页面只读展示；双因素认证尚未启用。修改密码仍可使用。'
    )
  ).toBeVisible()
  await page.getByRole('button', { name: '修改', exact: true }).click()
  await expect(page.locator('.password-form')).toBeVisible()
  expect(writes).toEqual([])
})

test('远端治理仅展示范围摘要，字段模型未接入时没有空表假读或规则写请求', async ({
  page,
}) => {
  await installContractSession(page)
  const writes: string[] = []
  const reads: string[] = []
  await page.route('**/api/**', route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() !== 'GET') writes.push(path)
    else reads.push(path)
    const data = path.endsWith('/auth/menu-list')
      ? [
          {
            path: '/sys-manage/permission-manage',
            name: 'robot-menu:permission',
            component: '/sys-manage/permission-manage/index',
            meta: { title: '权限治理' },
          },
        ]
      : path.endsWith('/sys/governance-capabilities')
        ? {
            dataScope: { read: true, write: false },
            fieldPermission: { read: false, write: false },
            constraint: { read: true, write: false },
            audit: { read: true, write: false },
            temporaryRoleGrant: { read: true, write: true, revoke: true },
          }
        : path.endsWith('/sys/data-permissions')
          ? [{ module: '*', scope: 'self', customDepartments: [] }]
          : path.endsWith('/page') ||
              path.endsWith('/sys/roles') ||
              path.endsWith('/sys/users')
            ? { list: [], total: 0, page: 1, pageSize: 20 }
            : []
    return route.fulfill({ json: { code: 0, data, msg: '成功' } })
  })
  await page.goto('http://127.0.0.1:4174/#/sys-manage/permission-manage')
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^数据权限$/ })
    .click()
  await expect(
    page.getByText('字段权限模型未接入。当前服务仅提供有效角色的数据范围摘要。')
  ).toBeVisible()
  const table = page.locator('.c-table-wrapper').last()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  const row = table.locator('tbody tr').first()
  await expect(row).toContainText('字段权限模型未接入')
  await expect(row).not.toContainText('0 字段')
  await expect(
    row.getByRole('button', { name: '配置字段', exact: true })
  ).toBeDisabled()
  await expect(
    row.getByRole('button', { name: '修改范围', exact: true })
  ).toBeDisabled()
  await expect(page.getByRole('button', { name: /新增规则$/ })).toBeDisabled()
  await page.getByRole('button', { name: /新增规则$/ }).click({ force: true })
  await row
    .getByRole('button', { name: '配置字段', exact: true })
    .click({ force: true })
  await expect(page.locator('.field-permission-card')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: '保存字段权限', exact: true })
  ).toHaveCount(0)
  await page
    .locator('.header-card')
    .getByRole('button', { name: /刷新$/ })
    .click()
  await expect(row).toContainText('字段权限模型未接入')
  expect(reads).toContain('/api/sys/governance-capabilities')
  expect(reads.filter(path => path.includes('field-permission'))).toEqual([])
  expect(writes).toEqual([])
})
