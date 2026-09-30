/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\e2e\production-smoke.pw.ts
 * @Description: 演示生产构建的关键页面浏览器回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from '@playwright/test'

test('未登录访问业务页会回到登录页，演示凭据保持可见', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))

  await page.goto('/#/home')
  await expect(page).toHaveURL(/#\/login$/)
  await expect(page.getByPlaceholder('请输入用户名')).toHaveValue('CHENY')
  await expect(page.getByPlaceholder('请输入密码').first()).toHaveValue(
    '123456'
  )
  expect(pageErrors).toEqual([])
})

test('真实业务构建不会预填演示账号与密码', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174/#/login')
  await expect(page.getByPlaceholder('请输入用户名')).toHaveValue('')
  await expect(page.getByPlaceholder('请输入密码').first()).toHaveValue('')
})

test('认证壳层、地图及退出登录在正式产物中可用', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('token', JSON.stringify('mock-access.e2e'))
    localStorage.setItem(
      'userInfo',
      JSON.stringify({ username: 'E2E', displayName: 'E2E' })
    )
  })

  await page.goto('/#/home')
  await expect(page.locator('#guide-menu')).toBeVisible()

  await page.goto('/#/plugins/map')
  await expect(page.locator('.leaflet-container')).toHaveCount(4)
  await expect(page.locator('.n-message--error')).toHaveCount(0)

  await page.locator('.user-info').first().click()
  await page.getByText('退出登录', { exact: true }).click()
  await page.getByRole('button', { name: '确认退出' }).click()
  await expect(page).toHaveURL(/#\/login$/)
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
  expect(pageErrors).toEqual([])
})
