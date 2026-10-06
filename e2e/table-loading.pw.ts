/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @FilePath: \Robot_Admin\e2e\table-loading.pw.ts
 * @Description: 验证线上组件表格加载态的主题、数据保留、无障碍与减少动画行为
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

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
  await expect(loading.locator('.c-loading__scan')).toBeHidden()
  const animationNames = await loading
    .locator('.c-loading__frame, .c-loading__eyes, .c-loading__packet')
    .evaluateAll(elements =>
      elements.map(el => getComputedStyle(el).animationName)
    )
  expect(animationNames.every(name => name === 'none')).toBe(true)
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
  ).toHaveCount(2)
  const spinners = workspace.locator('.n-spin')
  await expect(spinners).toHaveCount(2)
  expect(
    await spinners.evaluateAll(elements =>
      elements.every(el => !el.classList.contains('n-spin--rotate'))
    )
  ).toBe(true)
  const glyphSizes = await workspace
    .locator('.c-loading svg')
    .evaluateAll(elements =>
      elements.map(el => Math.round(el.getBoundingClientRect().width))
    )
  expect(glyphSizes).toEqual([48, 48])
  await page.clock.runFor(500)
  await expect(workspace.locator('.c-loading')).toHaveCount(0)
  await expect(workspace.locator('tbody')).toContainText('正常')
})
