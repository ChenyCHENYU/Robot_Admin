/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\e2e\repository-stats.pw.ts
 * @Description: 首页真实统计的异步加载、限流降级、主动重试和会话缓存浏览器回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const api = 'https://api.github.com/repos/ChenyCHENYU/Robot_Admin'

test('缺少 AbortSignal.any 和 timeout 的浏览器仍能读取真实仓库统计', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.addInitScript(() => {
    Object.defineProperty(AbortSignal, 'any', {
      value: undefined,
      configurable: true,
    })
    Object.defineProperty(AbortSignal, 'timeout', {
      value: undefined,
      configurable: true,
    })
  })
  await page.route(`${api}**`, route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(
        route.request().url().includes('/commits?')
          ? [{ sha: 'compatibility' }]
          : { stargazers_count: 12, forks_count: 3, default_branch: 'main' }
      ),
    })
  )
  await page.goto('/#/home')
  await expect(page.locator('.home-repository__metrics strong')).toHaveText([
    '12',
    '3',
    '1',
  ])
  await expect(page.locator('.home-repository__status')).toContainText(
    '实时获取'
  )
})

test('仓库统计使用公开响应与默认分支，跨页面返回读取会话缓存', async ({
  page,
}) => {
  await installMockAdminSession(page)
  const requests: string[] = []
  await page.route(`${api}**`, async route => {
    requests.push(route.request().url())
    expect(route.request().headers()).not.toHaveProperty('authorization')
    const commits = route.request().url().includes('/commits?')
    await route.fulfill({
      contentType: 'application/json',
      headers: commits
        ? {
            'Access-Control-Expose-Headers': 'Link',
            Link: '<https://api.github.com/repositories/123/commits?per_page=1&page=789>; rel="last"',
          }
        : {},
      body: JSON.stringify(
        commits
          ? [{ sha: 'commit' }]
          : {
              stargazers_count: 1020,
              forks_count: 70,
              default_branch: 'release',
            }
      ),
    })
  })
  await page.goto('/#/home')
  const metrics = page.locator('.home-repository__metrics')
  await expect(metrics).toContainText('1,020')
  await expect(metrics).toContainText('70')
  await expect(metrics).toContainText('789')
  await expect(metrics.locator('a').last()).toHaveAttribute(
    'href',
    /commits\/release$/
  )
  expect(requests[1]).toContain('sha=release')
  await page.goto('/#/about')
  await expect(page.locator('.about-profile')).toBeVisible()
  await page.goto('/#/home')
  await expect(page.locator('.home-repository__status')).toContainText(
    '会话缓存'
  )
  await expect(metrics).toContainText('789')
  expect(requests).toHaveLength(2)
  await expect(page.locator('.home-architecture__item')).toHaveCount(4)
  await Promise.all(
    ['main', 'monorepo', 'module-federation', 'micro-app'].map(branch =>
      expect(
        page.locator(`.home-architecture__item[href$="/tree/${branch}"]`)
      ).toBeVisible()
    )
  )
})

test('GitHub 限流不阻塞工作空间，未知数保留占位并可主动重试', async ({
  page,
}) => {
  await installMockAdminSession(page)
  let unavailable = true
  await page.route(`${api}**`, async route => {
    if (unavailable) return route.fulfill({ status: 403, body: '{}' })
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(
        route.request().url().includes('/commits?')
          ? [{ sha: 'only-commit' }]
          : { stargazers_count: 5, forks_count: 2, default_branch: 'main' }
      ),
    })
  })
  await page.goto('/#/home')
  await expect(page.locator('.enterprise-overview')).toContainText(
    '江苏金恒（南京）'
  )
  await expect(page.locator('.home-entry')).toHaveCount(8)
  await expect(page.locator('.home-repository__status')).toContainText(
    'GitHub 暂不可用'
  )
  await expect(page.locator('.home-repository__metrics strong')).toHaveText([
    '—',
    '—',
    '—',
  ])
  unavailable = false
  await page
    .locator('.home-repository')
    .getByRole('button', { name: '重试' })
    .click()
  await expect(page.locator('.home-repository__metrics strong')).toHaveText([
    '5',
    '2',
    '1',
  ])
})

test('仅提交请求失败时仍展示 Star 和 Fork，提交数保持未知', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.route(`${api}**`, route =>
    route.request().url().includes('/commits?')
      ? route.fulfill({ status: 403, body: '{}' })
      : route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            stargazers_count: 5,
            forks_count: 2,
            default_branch: 'main',
          }),
        })
  )
  await page.goto('/#/home')
  await expect(page.locator('.home-repository__status')).toContainText(
    '提交统计暂不可用'
  )
  await expect(page.locator('.home-repository__metrics strong')).toHaveText([
    '5',
    '2',
    '—',
  ])
})
