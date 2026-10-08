/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @FilePath: \Robot_Admin\e2e\table-loading.pw.ts
 * @Description: 验证线上组件表格加载态的主题、数据保留、无障碍与减少动画行为
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
import { utils, write } from 'xlsx'

for (const route of ['table-expand', 'table-dynamic']) {
  test(`${route} 的演示不依赖员工接口或第三方代理`, async ({ page }) => {
    const requests: string[] = []
    await installMockAdminSession(page)
    await page.route('**/employees/**', request => {
      requests.push(request.request().url())
      return request.abort()
    })
    await page.goto(`/#/demo/table-manage/${route}`)
    const table = page.locator('.c-table-wrapper').first()
    await expect(table.locator('tbody tr')).toHaveCount(5)
    await expect(table.locator('tbody')).toContainText('张三')
    expect(requests).toEqual([])
  })
}

const openRoleTable = async (page: Page, dark = false) => {
  await installMockAdminSession(page)
  if (dark) {
    await page.addInitScript(() => localStorage.setItem('theme-mode', 'dark'))
  }
  await page.setViewportSize({ width: 1480, height: 1000 })
  await page.goto('/#/sys-manage/role-manage')
  const table = page.locator('.role-management .c-table-wrapper')
  await expect(table.locator('tbody')).toContainText('超级管理员')
  await expect(table.locator('.n-spin')).toHaveCount(0)
  await expect(page.locator('.app-loading')).toBeHidden()
  return table
}

const startRefresh = async (page: Page) => {
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 100))
  await page
    .locator('.role-management .header-card')
    .getByRole('button', { name: '刷新', exact: true })
    .click()
  // Advance the overlay entrance transition, while the 500 ms request is pending.
  await page.clock.runFor(250)
}

test('表格刷新展示 SVG 状态、保留数据，完成后卸载动画', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const table = await openRoleTable(page)
  const rowsBefore = await table.locator('tbody tr').count()
  await startRefresh(page)
  const loading = table.getByRole('status', {
    name: '正在加载数据',
    exact: true,
  })
  await expect(loading).toBeVisible()
  await expect(loading.locator('svg')).toHaveAttribute('aria-hidden', 'true')
  await expect(loading.locator('linearGradient')).toHaveCount(2)
  await expect(table).toHaveAttribute('aria-busy', 'true')
  await expect(table.locator('tbody tr')).toHaveCount(rowsBefore)
  await expect(table.locator('tbody')).toContainText('超级管理员')
  const colors = await page.evaluate(() => {
    const indicator = document.querySelector('.role-management .c-loading')!
    const root = document.querySelector('.role-management')!
    const probe = document.createElement('span')
    probe.style.color = 'var(--c-primary)'
    root.append(probe)
    const primary = getComputedStyle(probe).color
    probe.remove()
    return {
      indicator: getComputedStyle(indicator).color,
      primary,
    }
  })
  expect(colors.indicator).toBe(colors.primary)
  await page.screenshot({ path: testInfo.outputPath('loading-light.png') })
  await page.clock.runFor(1200)
  await expect(loading).toHaveCount(0)
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(table.locator('tbody tr')).toHaveCount(rowsBefore)
  expect(errors).toEqual([])
})

test('暗色加载态跟随主色，并遵循减少动态效果设置', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const table = await openRoleTable(page, true)
  await startRefresh(page)
  const loading = table.getByRole('status', {
    name: '正在加载数据',
    exact: true,
  })
  await expect(loading).toBeVisible()
  const animationNames = await loading
    .locator('.c-loading__orbit, .c-loading__row')
    .evaluateAll(elements =>
      elements.map(el => getComputedStyle(el).animationName)
    )
  expect(animationNames.every(name => name === 'none')).toBe(true)
  expect(
    await loading.evaluate(el => getComputedStyle(el, '::after').display)
  ).toBe('none')
  const indicatorColor = await loading.evaluate(
    el => getComputedStyle(el).color
  )
  const themeColor = await page.locator('.role-management').evaluate(el => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--c-primary)'
    el.append(probe)
    const { color } = getComputedStyle(probe)
    probe.remove()
    return color
  })
  expect(indicatorColor).toBe(themeColor)
  await page.screenshot({ path: testInfo.outputPath('loading-dark.png') })
  await page.clock.runFor(1200)
  await expect(loading).toHaveCount(0)
})

test('字典列表沿用统一 SVG，原生遮罩不会旋转整枚图形', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/sys-manage/dictionary-manage')
  const workspace = page.locator('.dictionary-workspace')
  await expect(workspace.locator('tbody')).toContainText('正常')
  await expect(workspace.locator('.n-spin')).toHaveCount(0)
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 100))
  await page.getByRole('button', { name: '刷新', exact: true }).click()
  await page.clock.runFor(200)
  await expect(
    workspace.getByRole('status', { name: '正在加载', exact: true })
  ).toHaveCount(1)
  await expect(
    workspace.getByRole('status', { name: '正在加载数据', exact: true })
  ).toBeVisible()
  const spinners = workspace.locator('.n-spin')
  await expect(spinners).toHaveCount(1)
  expect(
    await spinners.evaluateAll(elements =>
      elements.every(el => !el.classList.contains('n-spin--rotate'))
    )
  ).toBe(true)
  const glyphSizes = await workspace
    .locator('.c-loading svg')
    .evaluateAll(elements =>
      elements.map(el => Number.parseFloat(getComputedStyle(el).width))
    )
  expect(glyphSizes).toEqual([48, 48])
  const gradientIds = await workspace
    .locator('.c-loading linearGradient[id]')
    .evaluateAll(elements => elements.map(element => element.id))
  expect(gradientIds).toHaveLength(4)
  expect(new Set(gradientIds).size).toBe(4)
  await page.clock.runFor(500)
  await expect(workspace.locator('.c-loading')).toHaveCount(0)
  await expect(workspace.locator('tbody')).toContainText('正常')
})

test('展开子表复用 SVG 加载态，数据返回后移除状态', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/demo/table-manage/table-expand')
  const demo = page.locator('.table-expand-demo')
  await expect(demo.locator('tbody tr').first()).toBeVisible()
  await expect(page.locator('.app-loading')).toBeHidden()
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 100))
  await demo.locator('.n-data-table-expand-trigger').first().click()
  const loading = demo.getByRole('status', {
    name: '正在加载子表数据',
    exact: true,
  })
  await expect(loading).toBeVisible()
  await expect(loading.locator('svg')).toHaveAttribute('aria-hidden', 'true')
  await expect(loading.locator('..').locator('.n-spin')).toHaveCount(0)
  await page.clock.runFor(500)
  await expect(loading).toHaveCount(0)
  await expect(demo.locator('.c-table-wrapper')).toHaveCount(2)
})

/** 推进路由离场动画，目标挂载后立刻停止，让请求等待状态可稳定观测。 */
const advanceToPage = async (page: Page, selector: string) => {
  const target = page.locator(selector)
  await expect
    .poll(
      async () => {
        await page.clock.runFor(50)
        return target.isVisible()
      },
      { intervals: [50], timeout: 15_000 }
    )
    .toBe(true)
}

for (const entry of [
  {
    path: '/account/activity-log',
    root: '.activity-log-page',
    label: '正在加载操作记录',
  },
  {
    path: '/account/security',
    root: '.security-page',
    label: '正在加载登录记录',
  },
]) {
  test(`${entry.label}复用统一 SVG 并在请求完成后移除`, async ({ page }) => {
    await openRoleTable(page)
    await page.clock.install()
    await page.clock.pauseAt(new Date(Date.now() + 100))
    await page.goto(`/#${entry.path}`)
    await advanceToPage(page, entry.root)
    await page.clock.runFor(150)
    const loading = page.getByRole('status', {
      name: entry.label,
      exact: true,
    })
    await expect(loading).toBeVisible()
    await expect(loading.locator('svg')).toHaveAttribute('aria-hidden', 'true')
    await page.clock.runFor(500)
    await expect(loading).toHaveCount(0)
    await expect(page.locator('tbody tr').first()).toBeVisible()
  })
}

test('权限治理的异步表格使用同一加载组件', async ({ page }) => {
  await openRoleTable(page)
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 100))
  await page.goto('/#/sys-manage/permission-manage')
  await advanceToPage(page, '.permission-management')
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^数据权限$/ })
    .click()
  await page.clock.runFor(100)
  await expect(
    page.getByRole('status', { name: '正在加载数据权限', exact: true })
  ).toBeVisible()
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^临时授权$/ })
    .click()
  await page.clock.runFor(100)
  const loading = page.getByRole('status', {
    name: '正在加载临时授权',
    exact: true,
  })
  await expect(loading).toBeVisible()
  await expect(loading.locator('svg')).toHaveAttribute('aria-hidden', 'true')
  await page.clock.runFor(1000)
  await expect(loading).toHaveCount(0)
})

test('权限资源首次加载和刷新都展示统一 SVG，刷新期间保留列表', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await openRoleTable(page)
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 100))
  await page.goto('/#/sys-manage/permission-manage')
  await advanceToPage(page, '.permission-management')
  const workspace = page.locator('.permission-management')
  const table = workspace.locator('.c-table-wrapper').first()
  const loading = table.getByRole('status', {
    name: '正在加载数据',
    exact: true,
  })
  await expect(table).toHaveAttribute('aria-busy', 'true')
  await expect(loading.locator('linearGradient')).toHaveCount(2)
  await page.clock.runFor(700)
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(table.locator('tbody')).toContainText('系统管理')
  const rowsBefore = await table.locator('tbody tr').count()
  await workspace.getByRole('button', { name: /刷新$/ }).click()
  await page.clock.runFor(100)
  await expect(loading).toBeVisible()
  await expect(table).toHaveAttribute('aria-busy', 'true')
  await expect(table.locator('tbody tr')).toHaveCount(rowsBefore)
  await expect(table.locator('tbody')).toContainText('系统管理')
  await page.screenshot({ path: testInfo.outputPath('permission-loading.png') })
  // 再次刷新取消旧请求，旧请求结束时间不能提前关闭新请求的加载态。
  await workspace.getByRole('button', { name: /刷新$/ }).click()
  await page.clock.runFor(150)
  await expect(table).toHaveAttribute('aria-busy', 'true')
  await page.clock.runFor(700)
  await expect(loading).toHaveCount(0)
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(table.locator('tbody tr')).toHaveCount(rowsBefore)
  expect(errors).toEqual([])
})

for (const entry of [
  { tab: '数据权限', label: '正在加载数据权限' },
  { tab: '临时授权', label: '正在加载临时授权' },
]) {
  test(`刷新${entry.tab}时展示对应表格加载态`, async ({ page }) => {
    await installMockAdminSession(page)
    await page.goto('/#/sys-manage/permission-manage')
    const workspace = page.locator('.permission-management')
    await expect(workspace.locator('tbody').first()).toContainText('系统管理')
    await page.locator('.n-tabs-tab').filter({ hasText: entry.tab }).click()
    const table = workspace.locator('.c-table-wrapper:visible')
    await expect(table).toHaveCount(1)
    await expect(table).toHaveAttribute('aria-busy', 'false')
    const contentsBefore = await table.locator('tbody').innerText()
    await page.clock.install()
    await page.clock.pauseAt(new Date(Date.now() + 100))
    await workspace.getByRole('button', { name: /刷新$/ }).click()
    await page.clock.runFor(150)
    const loading = table.getByRole('status', {
      name: entry.label,
      exact: true,
    })
    await expect(loading).toBeVisible()
    await expect(loading.locator('linearGradient')).toHaveCount(2)
    await expect(table).toHaveAttribute('aria-busy', 'true')
    expect(await table.locator('tbody').innerText()).toBe(contentsBefore)
    await page.clock.runFor(700)
    await expect(loading).toHaveCount(0)
    await expect(table).toHaveAttribute('aria-busy', 'false')
    expect(await table.locator('tbody').innerText()).toBe(contentsBefore)
  })
}

test('权限治理刷新不会恢复已经撤销的临时授权', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/sys-manage/permission-manage')
  const workspace = page.locator('.permission-management')
  await expect(workspace.locator('tbody').first()).toContainText('系统管理')
  await page.locator('.n-tabs-tab').filter({ hasText: '临时授权' }).click()
  const table = workspace.locator('.c-table-wrapper:visible')
  await expect(table).toHaveCount(1)
  await expect(table).toHaveAttribute('aria-busy', 'false')
  const row = table.locator('tbody tr').filter({ hasText: '内容编辑员' })
  await row.getByRole('button', { name: '撤销', exact: true }).click()
  await page.getByRole('button', { name: '确认撤销', exact: true }).click()
  await expect(row).toContainText('已撤销')
  await workspace.getByRole('button', { name: /刷新$/ }).click()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(row).toContainText('已撤销')
  await expect(
    row.getByRole('button', { name: '撤销', exact: true })
  ).toHaveCount(0)
})

test('角色用户弹窗立即反馈等待，关闭不会被迟到响应重新打开', async ({
  page,
}) => {
  await openRoleTable(page)
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 100))
  await page.getByRole('button', { name: '1 人', exact: true }).click()
  await page.clock.runFor(150)
  const dialog = page.locator('.n-dialog')
  const table = dialog.locator('.c-table-wrapper')
  await expect(table.getByRole('status')).toBeVisible()
  await expect(table).toHaveAttribute('aria-busy', 'true')
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await page.clock.runFor(700)
  await expect(dialog).toBeHidden()
  await page.getByRole('button', { name: '1 人', exact: true }).click()
  await page.clock.runFor(600)
  await expect(table.getByRole('status')).toHaveCount(0)
  await expect(table.locator('tbody tr')).toHaveCount(1)
})

test('Excel 首次读取就显示 SVG，预览挂载后结束等待且不增加虚假延时', async ({
  page,
}) => {
  await installMockAdminSession(page)
  await page.goto('/#/hooks/excel-all')
  await expect(page.locator('.app-loading')).toBeHidden()
  // 只在测试中延迟真实读取，稳定观察首次导入还没有预览表格的阶段。
  await page.evaluate(() => {
    const readBuffer = File.prototype.arrayBuffer
    /** 在测试中控制文件读取时间，生产逻辑保持浏览器的原始读取速度。 */
    File.prototype.arrayBuffer = async function (this: File) {
      await new Promise<void>(resolve => setTimeout(resolve, 600))
      return readBuffer.call(this)
    }
  })
  const workbook = utils.book_new()
  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet([{ 姓名: '张三', 部门: '技术部' }]),
    '员工'
  )
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 100))
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: 'loading-check.xlsx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: write(workbook, { type: 'buffer', bookType: 'xlsx' }),
    })
  await page.clock.runFor(200)
  const loading = page
    .locator('.excel-demo .n-spin-container')
    .getByRole('status')
  await expect(loading).toBeVisible()
  await expect(loading.locator('linearGradient')).toHaveCount(2)
  await expect(
    page.getByText('正在读取 Excel 文件', { exact: true })
  ).toBeVisible()
  await expect(page.locator('.preview-table')).toHaveCount(0)
  await page.clock.runFor(800)
  await expect(page.locator('.preview-table tbody')).toContainText('张三')
  await page.clock.runFor(500)
  await expect(loading).toHaveCount(0)
})
