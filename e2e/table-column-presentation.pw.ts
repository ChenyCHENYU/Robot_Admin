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
  await page.goto('/#/production-sales/production-plan', {
    waitUntil: 'domcontentloaded',
  })
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
  await page.goto('/#/production-sales/sales-orders', {
    waitUntil: 'domcontentloaded',
  })
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
  await page.goto('/#/production-sales/shipping', {
    waitUntil: 'domcontentloaded',
  })
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

test('详情居中弹窗完整展示列头，窄屏只在表格内部滚动', async ({
  page,
}, info) => {
  await page.goto('/#/production-sales/production-plan', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.getByTestId('production-plan')).toBeVisible({
    timeout: 15000,
  })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  const trigger = page.getByRole('button', {
    name: 'PP-20261029-006',
    exact: true,
  })
  // 用键盘打开后验证焦点恢复，避免依赖 Safari 的鼠标点击聚焦偏好。
  await trigger.focus()
  await trigger.press('Enter')
  const detail = page.locator('.ps-detail-modal')
  await expect(detail).toBeVisible()
  await expect(detail).toContainText('生产计划详情')
  await expect(detail.locator('.n-descriptions-table-row')).toHaveCount(3)
  expect(
    (await detail.locator('.n-descriptions').boundingBox())!.height
  ).toBeLessThan(130)
  await expect(page.locator('.n-drawer')).toHaveCount(0)
  const verifyViewport = async (viewport: {
    width: number
    height: number
  }) => {
    await page.setViewportSize(viewport)
    await expect
      .poll(async () =>
        detail.locator('.mach-header-cell--leaf').evaluateAll(cells =>
          cells.flatMap(cell => {
            const label = cell.querySelector('.mach-header-label')!
            if (!label.textContent) return []
            const range = document.createRange()
            range.selectNodeContents(label)
            const text = range.getBoundingClientRect()
            const bounds = cell.getBoundingClientRect()
            return text.left < bounds.left ||
              text.right > bounds.right ||
              getComputedStyle(label).textOverflow === 'ellipsis'
              ? [label.textContent]
              : []
          })
        )
      )
      .toEqual([])
    await detail.screenshot({
      path: info.outputPath(`plan-detail-${viewport.width}.png`),
    })
    const box = (await detail.boundingBox())!
    expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(2)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    if (viewport.width === 760) {
      const scroll = detail.locator('.mach-body-viewport--scroll')
      expect(await scroll.evaluate(el => el.scrollWidth > el.clientWidth)).toBe(
        true
      )
      await scroll.evaluate(el => {
        el.scrollLeft = el.scrollWidth
      })
      await expect(
        detail.getByRole('columnheader').filter({ hasText: '工艺路线' })
      ).toBeVisible()
    }
  }
  await verifyViewport({ width: 1440, height: 1000 })
  await verifyViewport({ width: 760, height: 650 })
  await detail.screenshot({
    path: info.outputPath('plan-detail-full-headers.png'),
  })
  await page.keyboard.press('Escape')
  await expect(detail).toBeHidden()
  await expect(
    page.getByRole('button', { name: 'PP-20261029-006', exact: true })
  ).toBeFocused()
})
