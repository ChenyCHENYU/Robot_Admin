/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\e2e\mach-table-tree.pw.ts
 * @Description: 树表真实点击、文字可读性、列宽反馈与配置抽屉交互回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const route = '/#/demo/table-manage/mach-table'
const treeCell = (page: Page, id: string) =>
  page.locator(`.mach-row[data-id="${id}"] .mach-cell[data-col-id="treeLabel"]`)

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1000 })
  await page.goto(route)
  await expect(page.locator('.mach-root')).toBeVisible()
  await page.getByText('树形表格', { exact: true }).click()
  await expect(treeCell(page, 'tree:华东')).toBeVisible()
})

test('树节点真实点击收起和展开，三级文本保留完整阅读空间', async ({ page }) => {
  const region = treeCell(page, 'tree:华东')
  const customer = treeCell(page, 'tree:华东:星海科技')
  await expect(region.locator('.mach-tree-text')).toHaveText('华东区域')
  await expect(customer).toBeVisible()
  await region
    .getByRole('button', { name: 'Collapse row', exact: true })
    .click()
  await expect(region).toHaveAttribute('aria-expanded', 'false')
  await expect(customer).toHaveCount(0)
  await region.getByRole('button', { name: 'Expand row', exact: true }).click()
  await expect(customer).toBeVisible()
  await customer
    .getByRole('button', { name: 'Collapse row', exact: true })
    .click()
  await expect(customer).toHaveAttribute('aria-expanded', 'false')
  await customer
    .getByRole('button', { name: 'Expand row', exact: true })
    .click()
  await expect(customer).toHaveAttribute('aria-expanded', 'true')

  const geometry = await page.locator('.mach-tree-cell').evaluateAll(cells =>
    cells.slice(0, 9).map(cell => {
      const text = cell.querySelector<HTMLElement>('.mach-tree-text')!
      const control = cell.querySelector<HTMLElement>(
        '.mach-tree-toggle, .mach-tree-toggle-spacer'
      )!
      return {
        text: text.textContent,
        width: text.clientWidth,
        truncated: text.scrollWidth > text.clientWidth,
        controlWidth: control.getBoundingClientRect().width,
        gap:
          text.getBoundingClientRect().left -
          control.getBoundingClientRect().right,
      }
    })
  )
  expect(geometry.length).toBe(9)
  for (const cell of geometry) {
    expect(cell.text).toBeTruthy()
    expect(cell.truncated).toBe(false)
    expect(cell.width).toBeGreaterThan(180)
    expect(cell.controlWidth).toBe(20)
    expect(cell.gap).toBeLessThanOrEqual(5)
  }
})

test('拖动树列显示全高参考线与实时宽度，释放后清理并保持列宽', async ({
  page,
}) => {
  const header = page.locator('.mach-header-cell[data-col-id="treeLabel"]')
  const handle = header.locator('.mach-header-resize')
  await handle.hover()
  const before = (await header.boundingBox())!
  const bounds = (await handle.boundingBox())!
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 70,
    bounds.y + bounds.height / 2,
    { steps: 5 }
  )
  const guide = page.locator('.mach-column-resize-guide')
  await expect(guide).toBeVisible()
  await expect(page.locator('.mach-column-resize-label')).toHaveText(
    `${Math.round(before.width + 70)} px`
  )
  expect((await guide.boundingBox())!.height).toBeGreaterThan(350)
  await expect(page.locator('.mach-header-resize--active')).toHaveCount(1)
  await page.mouse.up()
  await expect(guide).toHaveCount(0)
  await expect
    .poll(async () => (await header.boundingBox())!.width)
    .toBeCloseTo(before.width + 70, 0)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await expect
    .poll(async () => (await header.boundingBox())!.width)
    .toBeCloseTo(before.width + 70, 0)
})

test('配置预设与单项调整即时生效，窄屏抽屉没有横向溢出或缺失图标', async ({
  page,
}) => {
  await page.getByRole('button', { name: '功能配置', exact: true }).click()
  const drawer = page.locator('.mach-feature-drawer')
  await expect(drawer).toBeVisible()
  await expect
    .poll(async () => Math.round((await drawer.boundingBox())!.x))
    .toBe(1057)
  const presets = drawer.locator('.mach-feature-preset')
  await expect(presets).toHaveCount(4)
  await presets.filter({ hasText: '数据工作台' }).click()
  await expect(
    page.locator('.mach-root').getByText('合计 45 行', { exact: true })
  ).toHaveCount(1)
  await presets.filter({ hasText: '精简只读' }).click()
  await expect(presets.filter({ hasText: '精简只读' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await drawer
    .getByRole('button', { name: '恢复推荐配置', exact: true })
    .click()
  await expect(presets.filter({ hasText: '企业列表' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  const resizeSwitch = drawer
    .locator('.n-form-item')
    .filter({ hasText: '调整列宽' })
    .getByRole('switch')
  await resizeSwitch.click()
  await expect(
    drawer.getByText('当前：自定义配置', { exact: true })
  ).toBeVisible()
  await expect(page.locator('.mach-header-resize')).toHaveCount(0)
  await drawer
    .getByRole('button', { name: '恢复推荐配置', exact: true })
    .click()
  await expect(page.locator('.mach-header-resize').first()).toBeVisible()
  await expect(drawer.locator('.c-icon--error')).toHaveCount(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect
    .poll(async () => (await drawer.boundingBox())!.width)
    .toBeCloseTo(390, 0)
  const overflow = await drawer.evaluate(element => ({
    width: element.clientWidth,
    scroll: element.scrollWidth,
    items: Array.from(
      element.querySelectorAll<HTMLElement>('.n-form-item')
    ).map(item => item.scrollWidth - item.clientWidth),
  }))
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.width + 1)
  expect(Math.max(...overflow.items)).toBeLessThanOrEqual(1)
  await expect(
    drawer.getByRole('button', { name: '复制当前配置', exact: true })
  ).toBeInViewport()
})

test('深色主题保留树节点与配置面板的文字对比度和本地图标', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('theme-mode', 'dark'))
  await page.reload()
  await page.getByText('树形表格', { exact: true }).click()
  await expect(treeCell(page, 'tree:华东')).toBeVisible()
  await expect(page.locator('.mach-root')).toHaveClass(/mach-theme-dark/)
  await page.getByRole('button', { name: '功能配置', exact: true }).click()
  const drawer = page.locator('.mach-feature-drawer')
  await expect(drawer).toBeVisible()
  await expect
    .poll(async () => Math.round((await drawer.boundingBox())!.x))
    .toBe(1057)
  await expect(drawer.locator('.c-icon--error')).toHaveCount(0)
  const colors = await drawer.evaluate(element => {
    const group = element.querySelector<HTMLElement>('.mach-feature-group')!
    const heading = group.querySelector('strong')!
    const label = group.querySelector('.n-form-item-label')!
    return {
      background: getComputedStyle(group).backgroundColor,
      heading: getComputedStyle(heading).color,
      label: getComputedStyle(label).color,
    }
  })
  const channels = (value: string) =>
    value
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
  expect(Math.max(...channels(colors.background))).toBeLessThan(80)
  expect(Math.min(...channels(colors.heading))).toBeGreaterThan(150)
  expect(Math.min(...channels(colors.label))).toBeGreaterThan(150)
})
