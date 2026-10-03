/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\e2e\production-smoke.pw.ts
 * @Description: 演示生产构建的关键页面浏览器回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const vercelConfig = JSON.parse(
  readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')
) as {
  headers: Array<{ headers: Array<{ key: string; value: string }> }>
}
const productionCsp =
  vercelConfig.headers[0]?.headers.find(
    header => header.key === 'Content-Security-Policy'
  )?.value ?? ''

test('生产 CSP 允许登录页所需的 WebAssembly 编译', async ({ page }) => {
  expect(productionCsp).toBeTruthy()
  expect(productionCsp).toContain("media-src 'self' data: blob: https:;")

  const probeScript = `
    window.__cspProbe = (async () => {
      let jsEvalBlocked = false
      try { eval('1 + 1') } catch (error) {
        jsEvalBlocked = error instanceof EvalError
      }
      let wasmAvailable = false
      try {
        await WebAssembly.compile(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]))
        wasmAvailable = true
      } catch {}
      return { jsEvalBlocked, wasmAvailable }
    })()
  `

  await page.route('**/*', async route => {
    if (route.request().url().endsWith('/csp-probe.js')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: probeScript,
      })
      return
    }

    if (route.request().resourceType() !== 'document') {
      await route.continue()
      return
    }

    const response = await route.fetch()
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'content-security-policy': productionCsp,
      },
    })
  })

  await page.goto('/#/login')
  await page.addScriptTag({ url: new URL('/csp-probe.js', page.url()).href })
  const capabilities = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __cspProbe: Promise<{
            jsEvalBlocked: boolean
            wasmAvailable: boolean
          }>
        }
      ).__cspProbe
  )
  expect(capabilities).toEqual({ jsEvalBlocked: true, wasmAvailable: true })
})

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
  await installMockAdminSession(page)

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
