/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-02
 * @FilePath: \Robot_Admin\e2e\enterprise-context.pw.ts
 * @Description: 企业公司切换与角色菜单的浏览器闭环
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

import { solveDemoCaptcha } from './d_login'

test('验证身份后点击主公司直接进入，欢迎与退出通知完整显示', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.typewriter-overlay')).toHaveCount(0)
  await expect(page.locator('.c-login__social-row')).toHaveCount(0)
  await expect(page.locator('.c-login__captcha-wrap')).toBeVisible()
  await expect(page.locator('.login-workspace')).toContainText(
    '账号验证成功后才能选择工作公司'
  )
  await expect(page.locator('.login-workspace')).not.toContainText(
    '江苏金恒（南京）'
  )
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page.locator('.login-workspace')).toContainText(
    '选择一家公司即可进入'
  )
  await expect(page.getByPlaceholder('请输入密码')).toHaveCount(0)
  await page
    .getByRole('button', { name: '进入江苏金恒（南京）', exact: true })
    .click()

  await expect(page).toHaveURL(/#\/home$/, { timeout: 20_000 })
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    '江苏金恒（南京）'
  )
  await expect(page.locator('.enterprise-overview')).toContainText('企业管理员')
  const welcome = page
    .locator('.n-notification')
    .filter({ hasText: '欢迎回来，已进入「江苏金恒（南京）」' })
  await expect(welcome).toHaveCount(1)
  await expect(welcome).toContainText('CHENY')
  const bounds = (await welcome.boundingBox())!
  expect(bounds.x).toBeGreaterThan(600)
  await page.locator('.navbar-right .user-info').click()
  await page.getByText('退出登录', { exact: true }).click()
  await page.getByRole('button', { name: '确认退出', exact: true }).click()
  await expect(page).toHaveURL(/#\/login$/)
  await expect(
    page.locator('.n-notification').filter({ hasText: '已退出登录' })
  ).toContainText('CHENY，辛苦了')
  await expect(welcome).toHaveCount(0)
})

test('单公司自动进入，无公司明确阻止', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' })
  await page.getByPlaceholder('请输入用户名').fill('NOACCESS')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page.locator('.login-workspace')).toContainText('账号或密码错误')
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
  await page.getByPlaceholder('请输入用户名').fill('STAFF')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page).toHaveURL(/#\/home$/, { timeout: 20_000 })
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    '西安天智'
  )
})

test('切换公司后会话和菜单按新角色重建', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/home')
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    '江苏金恒（南京）'
  )

  await page.locator('.navbar-right .user-info').click()
  await page.getByRole('button', { name: '切换公司' }).click()
  await page
    .getByRole('button', {
      name: '进入 江苏金恒 · 江苏金恒（西安）',
    })
    .click()

  await expect(page).toHaveURL(/#\/home$/, { timeout: 20_000 })
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    '江苏金恒（西安）'
  )
  await expect(page.locator('.enterprise-overview')).toContainText('运营经理')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('token') || '""'))
  ).toMatch(/^mock-access\.jinheng-xian\./)

  await page.goto('/#/sys-manage/menu-manage')
  await expect(page).toHaveURL(/#\/401$/)
})

test('用户管理变更主/兼任公司后，下次登录进入新主公司', async ({ page }) => {
  test.setTimeout(90_000)
  await installMockAdminSession(page)
  await page.goto('/#/sys-manage/user-manage')
  const userRow = page.getByRole('row', { name: /zhangsan/ })
  await expect(userRow).toBeVisible()
  await expect(page.getByRole('row', { name: /wangwu/ })).toHaveCount(0)
  await userRow.locator('button').nth(1).click()
  await expect(page.getByText('企业归属与公司内角色')).toBeVisible()
  const xianRow = page
    .locator('.membership-editor__row')
    .filter({ hasText: '江苏金恒（西安）' })
  await xianRow.getByRole('button', { name: '设为主公司' }).click()
  await page.getByRole('button', { name: '确认修改' }).click()
  await expect(page.getByText('修改成功')).toBeVisible()

  const saved = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem('robot-admin:mock-enterprise-directory:v2') || '[]'
    )
  )
  const zhangsan = saved.find(
    (user: { username: string }) => user.username === 'zhangsan'
  )
  expect(
    zhangsan.memberships.find((item: { isPrimary: boolean }) => item.isPrimary)
      ?.contextId
  ).toBe('jinheng-xian')

  await page.evaluate(() => {
    for (const key of [
      'token',
      'refresh_token',
      'userInfo',
      'authContexts',
      'activeAuthContext',
    ])
      localStorage.removeItem(key)
  })
  await page.goto('/?auth-reset=1#/login')
  await page.getByPlaceholder('请输入用户名').fill('zhangsan')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await page
    .getByRole('button', { name: '进入江苏金恒（西安）', exact: true })
    .click()
  await expect(page).toHaveURL(/#\/home$/, { timeout: 20_000 })
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    '江苏金恒（西安）'
  )
  await expect(page.locator('.enterprise-overview')).toContainText(
    '江苏金恒（西安）'
  )
})

test('验证后选择兼任公司，进入后的菜单与切换公司保持一致', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' })
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page.locator('.login-workspace')).toContainText(
    '江苏金恒（南京）'
  )
  await page
    .getByRole('button', { name: '进入江苏金恒（西安）', exact: true })
    .click()
  await expect(page).toHaveURL(/#\/home$/, { timeout: 20_000 })
  await expect(page.locator('.enterprise-overview')).toContainText('运营经理')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('token') || '""'))
  ).toMatch(/^mock-access\.jinheng-xian\./)
  await page.goto('/#/sys-manage/menu-manage')
  await expect(page).toHaveURL(/#\/401$/)
  await page.locator('.navbar-right .user-info').click()
  await page.getByRole('button', { name: '切换公司' }).click()
  await page
    .getByRole('button', { name: '进入 江苏金恒 · 江苏金恒（南京）' })
    .click()
  await expect(page.locator('.enterprise-overview')).toContainText('企业管理员')
  await page.goto('/#/sys-manage/menu-manage')
  await expect(page).toHaveURL(/#\/sys-manage\/menu-manage$/)
})

test('返回账号登录立即清空已验证公司和票据，不能携带旧选择提交', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' })
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(
    page.getByRole('button', { name: '进入江苏金恒（南京）', exact: true })
  ).toBeEnabled()
  await page.getByRole('button', { name: '重新验证账号' }).click()
  await page.getByPlaceholder('请输入用户名').fill('STAFF')
  await expect(page.locator('.login-workspace')).not.toContainText(
    '江苏金恒（南京）'
  )
  await expect(
    page.getByRole('button', { name: '进入江苏金恒（南京）', exact: true })
  ).toHaveCount(0)
  await page.getByPlaceholder('请输入用户名').clear()
  await expect(page.locator('.login-workspace')).toContainText(
    '账号验证成功后才能选择工作公司'
  )
  await expect(page.locator('.c-login__submit-btn')).toBeDisabled()
  await page.getByPlaceholder('请输入密码').first().press('Enter')
  await expect(page).toHaveURL(/#\/login$/)
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
})

test('回车不能绕过登录人机验证', async ({ page }) => {
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.login-workspace')).toContainText(
    '账号验证成功后才能选择工作公司'
  )
  await page.getByPlaceholder('请输入密码').first().press('Enter')
  await expect(page).toHaveURL(/#\/login$/)
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
  await expect(page.locator('.c-login__submit-btn')).toBeDisabled()
})

for (const layout of [
  { width: 390, mode: 'light' },
  { width: 1657, mode: 'dark' },
]) {
  test(`${layout.width}px ${layout.mode} 公司卡片和欢迎告别布局完整`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: layout.width, height: 1000 })
    await page.addInitScript(mode => {
      localStorage.setItem('theme-mode', mode)
    }, layout.mode)
    await page.goto('/#/login')
    await solveDemoCaptcha(page)
    await page.locator('.c-login__submit-btn').click()
    await expect(page.locator('.company-entry__item')).toHaveCount(3)
    await expect(
      page.getByRole('button', { name: '确认工作公司' })
    ).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1)
    await page.screenshot({
      path: testInfo.outputPath('company-entry.png'),
      fullPage: true,
    })
    await page
      .getByRole('button', { name: '进入江苏金恒（南京）', exact: true })
      .click()
    const welcome = page
      .locator('.n-notification')
      .filter({ hasText: '欢迎回来' })
    await expect(welcome).toBeVisible()
    await welcome.hover()
    const noticeBounds = (await welcome.boundingBox())!
    const accountBounds = (await page
      .locator('.navbar-right .user-info')
      .boundingBox())!
    expect(noticeBounds.y).toBeGreaterThan(
      accountBounds.y + accountBounds.height
    )
    await page.screenshot({ path: testInfo.outputPath('welcome.png') })
    await page.locator('.navbar-right .user-info').click()
    await page.getByText('退出登录', { exact: true }).click()
    await page.getByRole('button', { name: '确认退出', exact: true }).click()
    await expect(page).toHaveURL(/#\/login$/)
    await expect(
      page.locator('.n-notification').filter({ hasText: '已退出登录' })
    ).toBeVisible()
    await expect(welcome).toHaveCount(0)
    await expect(page.locator('.n-dialog')).toHaveCount(0)
    await page.screenshot({ path: testInfo.outputPath('farewell.png') })
  })
}
