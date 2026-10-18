/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\e2e\interface-polish.pw.ts
 * @Description: 导航图标中心线、菜单折叠与表格工具栏留白的真实浏览器回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1480, height: 1000 })
})

for (const theme of ['light', 'dark']) {
  test(`${theme} 顶部图标统一尺寸、垂直居中且不依赖外部图标请求`, async ({
    page,
  }) => {
    await page.addInitScript(
      mode => localStorage.setItem('theme-mode', mode),
      theme
    )
    await page.route('**/*iconify*/*', route => route.abort())
    await page.goto('/#/demo/action-bar')
    const actions = page.locator('.navbar-right .action-buttons')
    await expect(actions.locator('button')).toHaveCount(6)
    await expect(actions.locator('.c-icon--loading')).toHaveCount(0)
    await expect(actions.locator('.c-icon--error')).toHaveCount(0)
    const geometry = await actions.locator('button').evaluateAll(buttons =>
      buttons.map(button => {
        const box = button.getBoundingClientRect()
        const icon = button.querySelector<HTMLElement>(
          '.c-icon, [class*="i-mdi"]'
        )!
        const iconBox = icon.getBoundingClientRect()
        return {
          width: box.width,
          height: box.height,
          centerY: box.y + box.height / 2,
          iconWidth: iconBox.width,
          iconHeight: iconBox.height,
          offsetX: Math.abs(
            iconBox.x + iconBox.width / 2 - box.x - box.width / 2
          ),
          offsetY: Math.abs(
            iconBox.y + iconBox.height / 2 - box.y - box.height / 2
          ),
        }
      })
    )
    for (const item of geometry) {
      expect(item.width).toBeGreaterThanOrEqual(32)
      expect(item.width).toBeLessThanOrEqual(36)
      expect(item.height).toBe(item.width)
      expect(item.iconWidth).toBe(18)
      expect(item.iconHeight).toBe(18)
      expect(item.offsetX).toBeLessThan(0.6)
      expect(item.offsetY).toBeLessThan(0.6)
    }
    expect(
      Math.max(...geometry.map(item => item.centerY)) -
        Math.min(...geometry.map(item => item.centerY))
    ).toBeLessThan(0.6)
    await expect(actions.locator('.notification-badge__count')).toBeVisible()
    await page.getByRole('button', { name: '布局配置', exact: true }).click()
    await expect(page.locator('.n-drawer')).toBeVisible()
  })
}

test('菜单折叠按钮表达真实状态，键盘与鼠标均可切换', async ({ page }) => {
  await page.goto('/#/demo/action-bar')
  const toggle = page.locator('#guide-menu-collapse')
  await expect(toggle).toHaveAttribute('aria-label', '收起菜单')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-label', '展开菜单')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(toggle).toHaveAttribute('aria-label', '收起菜单')
})

test('ActionBar 按钮与表格保持间距，设置按钮四周留白且可操作', async ({
  page,
}) => {
  await page.goto('/#/demo/action-bar')
  const toolbar = page.locator('.action-bar-demo-toolbar')
  const table = page.locator('.action-bar-demo-table')
  const settings = table.locator('.column-settings-btn')
  await expect(table.locator('tbody tr').first()).toBeVisible()
  const gap =
    (await table.boundingBox())!.y -
    ((await toolbar.boundingBox())!.y + (await toolbar.boundingBox())!.height)
  expect(gap).toBeGreaterThanOrEqual(12)
  const spacing = await table.evaluate(element => {
    const internal = element
      .querySelector('.table-toolbar')!
      .getBoundingClientRect()
    const button = element
      .querySelector('.column-settings-btn')!
      .getBoundingClientRect()
    const data = element.querySelector('.n-data-table')!.getBoundingClientRect()
    return {
      width: button.width,
      height: button.height,
      top: button.top - internal.top,
      right: internal.right - button.right,
      bottom: internal.bottom - button.bottom,
      tableGap: data.top - internal.bottom,
    }
  })
  expect(spacing.width).toBe(32)
  expect(spacing.height).toBe(32)
  expect(spacing.top).toBeGreaterThanOrEqual(8)
  expect(spacing.bottom).toBeGreaterThanOrEqual(8)
  expect(spacing.right).toBeGreaterThanOrEqual(12)
  expect(spacing.tableGap).toBeGreaterThanOrEqual(12)
  await settings.click()
  await expect(page.locator('.n-drawer .column-management-tab')).toBeVisible()
})
