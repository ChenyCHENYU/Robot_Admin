/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-09
 * @FilePath: \Robot_Admin\e2e\embedded-docs.pw.ts
 * @Description: 内嵌文档的真实模块、存储、来源限制与新窗口回退验证
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { readFileSync } from 'node:fs'
import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const docsOrigin = 'https://www.tzagileteam.com'
const vercelConfig = JSON.parse(
  readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')
) as {
  headers: Array<{ headers: Array<{ key: string; value: string }> }>
}
const productionCsp =
  vercelConfig.headers[0]?.headers.find(
    header => header.key === 'Content-Security-Policy'
  )?.value ?? ''

const installDocumentFixture = async (
  context: BrowserContext,
  frameAncestors: string
): Promise<void> => {
  await context.route(`${docsOrigin}/**`, async route => {
    const { pathname } = new URL(route.request().url())
    if (pathname === '/embed-state.js') {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `export const visits = Number(localStorage.getItem('embed-visits') ?? 0) + 1;
          localStorage.setItem('embed-visits', String(visits));`,
      })
      return
    }
    if (pathname === '/embed-runtime.js') {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `import { visits } from './embed-state.js';
          document.querySelector('#runtime').textContent = '模块与存储就绪：' + visits;`,
      })
      return
    }
    await route.fulfill({
      contentType: 'text/html',
      headers: {
        'content-security-policy': `frame-ancestors ${frameAncestors};`,
        'x-content-type-options': 'nosniff',
      },
      body: `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
        <script type="module" src="/embed-runtime.js"></script></head>
        <body><main><h1>${pathname === '/' ? '文档首页' : 'Robot Admin 指南'}</h1>
        <p id="runtime">准备中</p><a href="/robot/guide/overview">阅读指南</a></main></body></html>`,
    })
  })
}

const installParentPolicy = async (page: Page): Promise<void> => {
  expect(productionCsp).toBeTruthy()
  await page.route('http://127.0.0.1:4173/**', async route => {
    if (!route.request().isNavigationRequest()) return route.continue()
    const response = await route.fetch()
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'content-security-policy': productionCsp,
      },
    })
  })
}

test('生产策略下文档模块与存储可用，导航后继续正常显示', async ({
  page,
  context,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await installMockAdminSession(page)
  await installParentPolicy(page)
  await installDocumentFixture(context, "'self' http://127.0.0.1:*")

  await page.goto('/#/iframe/embedded-docs')
  const iframe = page.locator('iframe[title="内嵌文档"]')
  await expect(iframe).toBeVisible()
  await expect(iframe).toHaveAttribute('sandbox', /\ballow-same-origin\b/)
  const docs = page.frameLocator('iframe[title="内嵌文档"]')
  await expect(docs.getByRole('heading', { name: '文档首页' })).toBeVisible()
  await expect(docs.locator('#runtime')).toHaveText('模块与存储就绪：1')
  await docs.getByRole('link', { name: '阅读指南' }).click()
  await expect(
    docs.getByRole('heading', { name: 'Robot Admin 指南' })
  ).toBeVisible()
  await expect(docs.locator('#runtime')).toHaveText('模块与存储就绪：2')
  expect(errors).toEqual([])
  await expect(page.locator('#guide-menu')).toBeVisible()
})

test('文档站拒绝父来源时不绕过策略，仍可在新窗口阅读', async ({
  page,
  context,
}) => {
  await installMockAdminSession(page)
  await installParentPolicy(page)
  await installDocumentFixture(context, "'self' https://other-admin.example")
  const blocked = page.waitForEvent('console', {
    predicate: message =>
      message.type() === 'error' && message.text().includes('frame-ancestors'),
  })
  await page.goto('/#/iframe/embedded-docs')
  await blocked
  await expect(
    page.frameLocator('iframe[title="内嵌文档"]').getByRole('heading')
  ).toHaveCount(0)
  const link = page.getByRole('link', { name: '在新窗口打开' })
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  const [popup] = await Promise.all([page.waitForEvent('popup'), link.click()])
  await expect(popup.getByRole('heading', { name: '文档首页' })).toBeVisible()
  await expect(popup.locator('#runtime')).toHaveText('模块与存储就绪：1')
  expect(await popup.evaluate(() => window.opener)).toBeNull()
  await popup.close()
})
