/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-30
 * @FilePath: \Robot_Admin\e2e\table-column-presentation.pw.ts
 * @Description: 两套表格的内容测宽、状态标签与真实拖动列头保护
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1720, height: 1100 })
})

test('生产计划和销售订单复用包内状态列，完整展示业务字典文字', async ({
  page,
}) => {
  await page.goto('/#/production-sales/production-plan')
  await expect(page.getByTestId('production-plan')).toBeVisible({
    timeout: 15000,
  })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  const table = page.locator('[aria-label="排产计划台账"]')
  await Promise.all(
    ['待下达', '已下达', '执行中', '已完成'].map(label =>
      expect(
        table.locator('.mach-tag').filter({ hasText: label }).first()
      ).toBeVisible()
    )
  )
  await page.goto('/#/production-sales/sales-orders')
  await expect(page.getByTestId('business-workbench')).toBeVisible({
    timeout: 15000,
  })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  await Promise.all(
    ['待下达', '执行中', '已完成'].map(label =>
      expect(
        page
          .locator('.workbench-orders .mach-tag')
          .filter({ hasText: label })
          .first()
      ).toBeVisible()
    )
  )
})

test('C_Table 可以实际调宽，缩到下限仍完整容纳四字列头', async ({
  page,
}, info) => {
  await page.goto('/#/production-sales/shipping')
  await expect(page.getByTestId('shipping-workbench')).toBeVisible({
    timeout: 15000,
  })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  const table = page.locator('section[aria-label="发运任务池"]')
  const header = table.getByRole('columnheader', {
    name: '装车窗口',
    exact: true,
  })
  const handle = header.locator('.n-data-table-resize-button')
  const original = (await header.boundingBox())!
  let box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 180, box.y + box.height / 2, { steps: 8 })
  await page.mouse.up()
  expect((await header.boundingBox())!.width).toBeGreaterThan(
    original.width + 50
  )
  const grownWidth = (await header.boundingBox())!.width
  await handle.scrollIntoViewIfNeeded()
  box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(0, box.y + box.height / 2, { steps: 10 })
  await page.mouse.up()
  const bounds = await header.evaluate(element => {
    const title = element.querySelector('.n-data-table-th__title')!
    const range = document.createRange()
    range.selectNodeContents(title)
    const text = range.getBoundingClientRect()
    const cell = element.getBoundingClientRect()
    return {
      textLeft: text.left,
      textRight: text.right,
      cellLeft: cell.left,
      cellRight: cell.right,
      width: cell.width,
    }
  })
  expect(bounds.width).toBeLessThan(grownWidth - 50)
  expect(bounds.width).toBeGreaterThanOrEqual(75)
  expect(bounds.textLeft).toBeGreaterThanOrEqual(bounds.cellLeft)
  expect(bounds.textRight).toBeLessThanOrEqual(bounds.cellRight)
  await expect(
    table.locator('.n-tag').filter({ hasText: '待配载' }).first()
  ).toBeVisible()
  await table.screenshot({
    path: info.outputPath('native-header-min-width.png'),
  })
})
