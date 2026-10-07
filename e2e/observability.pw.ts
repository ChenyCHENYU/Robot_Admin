/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\e2e\observability.pw.ts
 * @Description: 工程报告真实读取、访问采集、图表主题和稳定分页浏览器回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import type {
  TelemetryEvent,
  ProjectMetrics,
  UsageSummary,
} from '../src/types/observability'
import { installMockAdminSession } from './auth-fixture'

const cacheKey = 'robot-admin:observability:v1'
/** 仅读取测试上下文中的匿名缓存。 */
const records = (page: Page): Promise<TelemetryEvent[]> =>
  page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '[]'), cacheKey)

test('工程报告与产物一致，图表保持容器尺寸，切换体积口径不污染实测值', async ({
  page,
}) => {
  await installMockAdminSession(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const report = (await (
    await page.request.get('/project-metrics.json')
  ).json()) as ProjectMetrics
  await page.goto('/#/dashboard/analysis')
  await expect(page.locator('.obs-metric strong').first()).toHaveText(
    String(report.inventory.vueFiles)
  )
  await expect(page.locator('.obs-metric strong').nth(1)).toHaveText(
    String(report.inventory.components)
  )
  await expect(page.locator('.observatory-chart svg')).toHaveCount(4)
  const sizes = await page
    .locator('.observatory-chart svg')
    .evaluateAll(items =>
      items.map(svg => ({
        svg: svg.getBoundingClientRect().width,
        container: svg.parentElement!.getBoundingClientRect().width,
      }))
    )
  for (const size of sizes) {
    expect(size.svg).toBeGreaterThan(150)
    expect(Math.abs(size.svg - size.container)).toBeLessThan(2)
  }
  expect(report.build?.initialBytes).toBeGreaterThan(0)
  await page.getByLabel('体积口径').selectOption('true')
  await expect(page.locator('.bundle-budget')).toContainText(
    'gzip 只估算传输压缩'
  )
  await expect(page.locator('.runtime-metrics')).toContainText('FCP')
  await expect(page.locator('.architecture-grid a')).toHaveCount(4)
  expect(errors).toEqual([])
})

test('真实导航记录 PV，查询参数变化不重复统计，恢复会话不冒充成功登录', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.goto('/#/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  await expect
    .poll(
      async () =>
        (await records(page)).filter(event => event.route === 'home').length
    )
    .toBe(1)
  await page.goto('/#/home?token=qa-private&account=qa-private')
  await expect(page.locator('.project-homepage')).toBeVisible()
  await page.goto('/#/dashboard/analysis')
  await expect(page.locator('.project-analysis')).toBeVisible()
  await page.goto('/#/dashboard/statistics')
  await expect
    .poll(
      async () =>
        (await records(page)).filter(event => event.type === 'page_view').length
    )
    .toBe(3)
  await expect(page.locator('.obs-metric strong')).toHaveText([
    '3',
    '1',
    '0',
    '0',
  ])
  const data = await records(page)
  expect(JSON.stringify(data)).not.toContain('qa-private')
  expect(JSON.stringify(data)).not.toContain('mock-access')
  expect(data.every(event => event.mode === 'mock')).toBe(true)
  await page.reload()
  await expect(page.locator('.obs-metric strong')).toHaveText([
    '4',
    '1',
    '0',
    '0',
  ])
  await expect(
    page.getByLabel('统计数据范围').locator('option[value="site"]')
  ).toBeDisabled()
  await expect(page.locator('.collection-panel')).toContainText('尚未连接')
})

test('Star 与报告导出只统计明确操作，报告保持本机范围且没有身份字段', async ({
  page,
  context,
}) => {
  await installMockAdminSession(page)
  await context.route('https://github.com/ChenyCHENYU/Robot_Admin', route =>
    route.fulfill({ body: '<title>navigation fixture</title>' })
  )
  await page.goto('/#/home')
  const popupPromise = context.waitForEvent('page')
  await page.locator('.home-repository__metrics a').first().click()
  const popup = await popupPromise
  await popup.close()
  await page.goto('/#/dashboard/statistics')
  await expect(page.locator('.obs-metric strong').last()).toHaveText('1')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出报告' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('usage-browser-')
  const path = await download.path()
  const payload = JSON.parse(await readFile(path!, 'utf8'))
  expect(payload.summary.scope).toBe('browser')
  expect(
    payload.events.some(
      (event: TelemetryEvent) => event.action === 'repository_star'
    )
  ).toBe(true)
  expect(JSON.stringify(payload)).not.toContain('mock-access')
  await expect(page.locator('.obs-metric strong').last()).toHaveText('2')
})

test('事件分页末页与空筛选保持固定高度，演示与远端记录分别筛选', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.addInitScript(key => {
    const now = Date.now()
    const events = Array.from({ length: 14 }, (_, index) => ({
      id: `fixture-${index}`,
      type: 'page_view',
      timestamp: now - index - 1000,
      route: 'home',
      session: 'fixture-session',
      mode: 'mock',
      device: 'desktop',
      durationMs: index + 10,
    }))
    localStorage.setItem(key, JSON.stringify(events))
  }, cacheKey)
  await page.goto('/#/dashboard/statistics')
  await expect(page.locator('.recent-table tbody tr')).toHaveCount(6)
  const { height } = (await page.locator('.recent-table').boundingBox())!
  await page.getByRole('button', { name: '下一页' }).click()
  await page.getByRole('button', { name: '下一页' }).click()
  await expect(page.locator('.recent-table tbody tr')).toHaveCount(3)
  expect((await page.locator('.recent-table').boundingBox())!.height).toBe(
    height
  )
  await page.getByLabel('事件来源').selectOption('remote')
  await expect(page.locator('.obs-metric strong')).toHaveText([
    '0',
    '0',
    '0',
    '0',
  ])
  await expect(page.locator('.recent-table .n-empty')).toBeVisible()
  expect((await page.locator('.recent-table').boundingBox())!.height).toBe(
    height
  )
})

test('暗色、窄屏与反复导航保持图表可见，不累积旧 SVG 或出现运行时异常', async ({
  page,
}) => {
  await installMockAdminSession(page)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#/dashboard/analysis')
  await expect(page.locator('.observatory-chart svg')).toHaveCount(4)
  await page.evaluate(() => {
    const app = (
      document.querySelector('#app') as HTMLElement & {
        __vue_app__: import('vue').App
      }
    ).__vue_app__
    const pinia = app.config.globalProperties.$pinia as {
      _s: Map<string, { setMode: (mode: string) => void }>
    }
    pinia._s.get('theme-extended')!.setMode('dark')
  })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const inheritedText = page.locator(
    '.observatory-chart svg text[fill="inherit"]'
  )
  expect(await inheritedText.count()).toBeGreaterThan(0)
  await expect
    .poll(() =>
      inheritedText.evaluateAll(items =>
        items.every(item => getComputedStyle(item).fill !== 'rgb(0, 0, 0)')
      )
    )
    .toBe(true)
  const roundTrip = async () => {
    await page.goto('/#/dashboard/statistics')
    await expect(page.locator('.observatory-chart svg')).toHaveCount(3)
    await page.goto('/#/dashboard/analysis')
    await expect(page.locator('.observatory-chart svg')).toHaveCount(4)
  }
  await roundTrip()
  await roundTrip()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(() =>
      page
        .locator('.obs-grid')
        .first()
        .evaluate(
          element =>
            getComputedStyle(element).gridTemplateColumns.split(' ').length
        )
    )
    .toBe(1)
  const assertResponsive = async (selector: string) => {
    await expect
      .poll(() =>
        page
          .locator(selector)
          .evaluate(element => element.scrollWidth - element.clientWidth)
      )
      .toBeLessThanOrEqual(1)
    await expect
      .poll(() =>
        page.locator('.observatory-chart svg').evaluateAll(items =>
          items.every(svg => {
            const width = svg.parentElement!.clientWidth
            return Math.abs(Number(svg.getAttribute('width')) - width) < 2
          })
        )
      )
      .toBe(true)
  }
  await assertResponsive('.project-analysis')
  await page.goto('/#/dashboard/statistics')
  await expect(page.locator('.observatory-chart svg')).toHaveCount(3)
  await assertResponsive('.usage-statistics')
  expect(errors).toEqual([])
})

test('非安全上下文缺少 randomUUID 时依然采集真实访问，且不影响页面启动', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.addInitScript(() => {
    Object.defineProperty(crypto, 'randomUUID', { value: undefined })
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#/dashboard/statistics')
  await expect(page.locator('.obs-metric strong').first()).toHaveText('1')
  const data = await records(page)
  expect(data[0].id).toMatch(/^anon-/)
  expect(data[0].session).toMatch(/^anon-/)
  expect(errors).toEqual([])
})

test.describe('已配置远程汇总与采集', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/observability/events', route =>
      route.fulfill({ status: 204 })
    )
  })
  test.skip(
    !process.env.ROBOT_E2E_OBSERVABILITY_REMOTE,
    '需要显式配置 telemetry 端点的测试构建或开发服务'
  )
  /** 构造声明为测试数据的服务端聚合响应，生产代码不包含此数据。 */
  const summaryFixture = (url: string): UsageSummary => {
    const query = new URL(url).searchParams
    const from = Number(query.get('from')),
      to = Number(query.get('to'))
    return {
      schemaVersion: 1,
      scope: 'site',
      from,
      to,
      updatedAt: to,
      totals: {
        views: 42,
        sessions: 10,
        loginSuccess: 3,
        loginFailure: 1,
        companySwitches: 2,
        actions: 5,
      },
      daily: [
        { date: new Date(to).toISOString().slice(0, 10), views: 42, logins: 3 },
      ],
      pages: [{ route: 'home', views: 42, p50Ms: 30, p95Ms: 80 }],
      events: [
        { type: 'page_view', count: 42 },
        { type: 'login_success', count: 3 },
      ],
      devices: [{ device: 'desktop', count: 42 }],
    }
  }
  test('远程汇总使用服务端范围，导出聚合数据剔除附加身份字段', async ({
    page,
  }) => {
    await installMockAdminSession(page)
    await page.route('**/api/observability/summary?**', route =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            ...summaryFixture(route.request().url()),
            token: 'qa-private',
          },
        }),
      })
    )
    await page.goto('/#/dashboard/statistics')
    await page.getByLabel('统计数据范围').selectOption('site')
    await expect(page.locator('.obs-metric strong')).toHaveText([
      '42',
      '10',
      '3',
      '5',
    ])
    await expect(page.locator('.recent-panel')).toHaveCount(0)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出报告' }).click()
    const download = await downloadPromise
    const payload = JSON.parse(await readFile((await download.path())!, 'utf8'))
    expect(payload.summary.scope).toBe('site')
    expect(payload).not.toHaveProperty('events')
    expect(JSON.stringify(payload)).not.toContain('qa-private')
  })
  test('远程汇总失败与错误范围不会静默替换为本机数字', async ({ page }) => {
    await installMockAdminSession(page)
    let invalid = false
    await page.route('**/api/observability/summary?**', route =>
      invalid
        ? route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({
              code: 0,
              data: {
                ...summaryFixture(route.request().url()),
                scope: 'browser',
              },
            }),
          })
        : route.fulfill({ status: 503, body: '{}' })
    )
    await page.goto('/#/dashboard/statistics')
    await page.getByLabel('统计数据范围').selectOption('site')
    await expect(page.locator('.obs-status')).toContainText('获取失败')
    await expect(page.locator('.obs-metric strong')).toHaveText([
      '—',
      '—',
      '—',
      '—',
    ])
    invalid = true
    await page.getByRole('button', { name: '刷新', exact: true }).click()
    await expect(page.locator('.obs-status')).toContainText('获取失败')
    await expect(page.locator('.obs-metric strong')).toHaveText([
      '—',
      '—',
      '—',
      '—',
    ])
    await page.getByLabel('统计数据范围').selectOption('browser')
    await expect(page.locator('.obs-metric strong').first()).toHaveText('1')
  })
  test('配置采集后只发送脱敏事件小批次，不发布历史缓存与登录凭据', async ({
    page,
  }) => {
    await installMockAdminSession(page)
    const batches: Array<{ events: TelemetryEvent[] }> = []
    await page.route('**/api/observability/events', async route => {
      batches.push(route.request().postDataJSON())
      await route.fulfill({ status: 204 })
    })
    await page.goto('/#/home?token=qa-private')
    await expect(page.locator('.project-homepage')).toBeVisible()
    await page.goto('/#/dashboard/statistics')
    await expect
      .poll(() => batches.length, { timeout: 10_000 })
      .toBeGreaterThan(0)
    const events = batches.flatMap(batch => batch.events)
    expect(events.some(event => event.type === 'page_view')).toBe(true)
    expect(batches.every(batch => batch.events.length <= 20)).toBe(true)
    expect(JSON.stringify(batches)).not.toContain('qa-private')
    expect(JSON.stringify(batches)).not.toContain('mock-access')
    expect(
      events.every(event =>
        Object.keys(event).every(key =>
          [
            'id',
            'type',
            'timestamp',
            'session',
            'route',
            'mode',
            'device',
            'durationMs',
            'action',
          ].includes(key)
        )
      )
    ).toBe(true)
  })
})
