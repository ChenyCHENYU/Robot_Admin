/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-13
 * @FilePath: \Robot_Admin\e2e\table-empty-compact.pw.ts
 * @Description: 矮表默认空态文字真实裁切与标准插画尺寸回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 空态节点可见不等于文字可读：逐项核对根裁切边界与中点命中。 */
async function expectEmptyFits(empty: Locator) {
  const geometry = await empty.evaluate(element => {
    const root = element.closest('.mach-root')!
    const bounds = root.getBoundingClientRect()
    return [...element.children].map(child => {
      const box = child.getBoundingClientRect()
      const hit = root.ownerDocument.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2
      )
      return {
        name: child.classList.value,
        inside:
          box.top >= bounds.top &&
          box.bottom <= bounds.bottom &&
          box.left >= bounds.left &&
          box.right <= bounds.right,
        height: box.height,
        hit: hit === child || child.contains(hit),
      }
    })
  })
  for (const item of geometry) {
    expect(item.inside, `${item.name} 超出根裁切边界`).toBe(true)
    expect(item.height, `${item.name} 应保有可见高度`).toBeGreaterThan(0)
    expect(item.hit, `${item.name} 中点应真实可见`).toBe(true)
  }
}

test('Sales 矮屏空明细保留完整标题、提示与插画，大屏恢复标准插画', async ({
  page,
}, info) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1720, height: 600 })
  await page.goto('/#/production-sales/sales-orders')
  const root = page.getByTestId('business-workbench')
  await expect(root).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  const search = root.locator('.workbench-search')
  await search
    .locator('.n-form-item')
    .filter({
      has: page
        .locator('.n-form-item-label')
        .filter({ hasText: '订单 / 客户' }),
    })
    .getByRole('textbox')
    .fill('无此销售订单')
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  const master = root.locator('.workbench-master-grid .mach-root')
  await master.scrollIntoViewIfNeeded()
  const height = await master.evaluate(
    element => element.getBoundingClientRect().height
  )
  expect(height, '本例应实际进入短表根高度').toBeLessThanOrEqual(160)
  await page.screenshot({ path: info.outputPath('sales-empty-short.png') })
  await expectEmptyFits(master.locator('.mach-empty'))
  await page.getByRole('button', { name: '清除订单筛选', exact: true }).click()
  await page.getByRole('button', { name: '全选明细', exact: true }).click()
  await page.getByRole('button', { name: '删除选中明细', exact: true }).click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '删除明细', exact: true })
    .click()
  await expect(page.locator('.n-dialog')).toHaveCount(0)
  const panel = page.getByTestId('line-panel')
  const empty = panel.locator('.mach-empty')
  await expect(empty.locator('.mach-empty__title')).toHaveText(
    '当前订单还没有商品明细'
  )
  await expect(empty.locator('.mach-empty__hint')).toContainText(
    '新增明细后即可核对数量和金额'
  )
  await panel.locator('.mach-root').scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath('sales-empty-auto-height.png'),
  })
  await expectEmptyFits(empty)
  await page.setViewportSize({ width: 1720, height: 1200 })
  await panel.locator('.mach-root').scrollIntoViewIfNeeded()
  await expectEmptyFits(empty)
  await expect(empty.locator('svg')).toHaveCSS('width', '96px')
  await expect(empty.locator('svg')).toHaveCSS('height', '84px')
  await page.screenshot({ path: info.outputPath('sales-empty-large.png') })
})
