/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-02
 * @FilePath: \Robot_Admin\e2e\enterprise-context.pw.ts
 * @Description: 企业公司切换与角色菜单的浏览器闭环
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 固定演示拼图的随机目标，真实拖动验证滑块以覆盖交互链路。 */
const solveDemoCaptcha = async (page: import('@playwright/test').Page) => {
  await page.locator('.c-captcha-modern .captcha-trigger').click()
  const slider = page.locator('.vue-puzzle-vcode.show_ .range-btn')
  await expect(slider).toBeVisible()
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      '.vue-puzzle-vcode.show_ .auth-canvas1_'
    )
    const data = canvas?.getContext('2d')?.getImageData(0, 0, 310, 160).data
    return Boolean(
      data &&
      Array.from(data).some((value, index) => index % 4 === 3 && value > 0)
    )
  })
  const box = await slider.boundingBox()
  if (!box) throw new Error('拼图滑块不可见')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 163, y, { steps: 12 })
  await page.mouse.up()
  await expect(
    page.locator('.c-captcha-modern .captcha-trigger.verified')
  ).toBeVisible()
}

test('登录后自动进入唯一主公司，兼任公司不在登录页选择', async ({ page }) => {
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    Math.random = () => 0.5
  })
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.typewriter-overlay')).toHaveCount(0)
  await expect(page.locator('.c-login__social-row')).toHaveCount(0)
  await expect(page.locator('.c-login__captcha-wrap')).toBeVisible()
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()

  await expect(page).toHaveURL(/#\/home$/, { timeout: 20_000 })
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    '江苏金恒（南京）'
  )
  await expect(page.locator('.enterprise-overview')).toContainText('1,286')
})

test('单公司自动进入，无公司明确阻止', async ({ page }) => {
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    Math.random = () => 0.5
  })
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' })
  await page.getByPlaceholder('请输入用户名').fill('NOACCESS')
  await solveDemoCaptcha(page)
  await page.locator('.c-login__submit-btn').click()
  await expect(page.getByText('当前账号未关联公司')).toBeVisible()
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
  await expect(page.locator('.enterprise-overview')).toContainText('742')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('token') || '""'))
  ).toMatch(/^mock-access\.jinheng-xian\./)

  await page.goto('/#/sys-manage/menu-manage')
  await expect(page).toHaveURL(/#\/401$/)
})

test('用户管理变更主/兼任公司后，下次登录进入新主公司', async ({ page }) => {
  test.setTimeout(90_000)
  await page.addInitScript(() => {
    Math.random = () => 0.5
  })
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
  await expect(page).toHaveURL(/#\/home$/, { timeout: 20_000 })
  await expect(page.locator('.navbar-right .user-dropdown')).toContainText(
    '江苏金恒（西安）'
  )
  await expect(page.locator('.enterprise-overview')).toContainText('742')
})
