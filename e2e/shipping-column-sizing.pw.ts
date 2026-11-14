/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-13
 * @FilePath: \\Robot_Admin\\e2e\\shipping-column-sizing.pw.ts
 * @Description: 发运两种表格在宽屏下的内容列宽与真实拖动隔离回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 通过正式页面进入发运任务及关联库存。 */
async function openShipping(page: Page, width: number) {
  await installMockAdminSession(page)
  await page.setViewportSize({ width, height: 1200 })
  await page.goto('/#/production-sales/shipping')
  await expect(page.getByTestId('shipping-workbench')).toBeVisible({
    timeout: 20000,
  })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  await expect(page.locator('.shipping-queue tbody tr').first()).toBeVisible()
  await expect(page.locator('.mach-row[data-id]').first()).toBeVisible()
}

/** 记录完整宽度向量，防止目标列可拖但邻列同时跳动。 */
function nativeWidths(table: Locator) {
  return table
    .locator('thead th')
    .evaluateAll(headers =>
      Object.fromEntries(
        headers
          .filter(header => header.getBoundingClientRect().width > 0)
          .map(header => [
            header
              .querySelector('.n-data-table-th__title')
              ?.textContent?.trim() ??
              header.textContent?.trim() ??
              '',
            header.getBoundingClientRect().width,
          ])
      )
    )
}

/** 按公开列标识记录库存表的实际宽度。 */
function machWidths(table: Locator) {
  return table
    .locator('.mach-header-cell--leaf[data-col-id]')
    .evaluateAll(headers =>
      Object.fromEntries(
        headers.map(header => [
          (header as HTMLElement).dataset.colId!,
          header.getBoundingClientRect().width,
        ])
      )
    )
}

/** 目标之外的列在拖动各阶段均保持原宽。 */
function expectOtherWidthsStable(
  before: Record<string, number>,
  after: Record<string, number>,
  target: string
) {
  expect(Object.keys(after).sort()).toEqual(Object.keys(before).sort())
  for (const [key, width] of Object.entries(before)) {
    if (key !== target)
      expect(after[key], `${key} 不应联动`).toBeCloseTo(width, 1)
  }
}

/** 等待本帧宽度写入完成后再读真实几何。 */
async function nextPaint(page: Page) {
  await page.evaluate(
    () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  )
}

/** 少列在不同容器按同一基准比例铺满，功能列不参与放大。 */
async function captureLayout(page: Page) {
  const nativeTable = page.locator('.shipping-queue')
  const machTable = page.locator('.shipping-stock-grid')
  return {
    native: await nativeWidths(nativeTable),
    mach: await machWidths(machTable),
    nativeAvailable: await nativeTable
      .locator('.n-data-table-wrapper')
      .evaluate(element => element.clientWidth),
    machAvailable: await machTable
      .locator('.mach-root')
      .evaluate(element => element.clientWidth),
  }
}

for (const width of [1720, 3200]) {
  test(`${width}px 少列按基准比例铺满，结构列固定且操作不贴边`, async ({
    page,
  }, info) => {
    await openShipping(page, width)
    const sum = (values: Record<string, number>) =>
      Object.values(values).reduce((total, value) => total + value, 0)
    await expect
      .poll(async () => {
        const current = await captureLayout(page)
        return Math.max(
          Math.abs(sum(current.native) - current.nativeAvailable),
          Math.abs(sum(current.mach) - current.machAvailable)
        )
      })
      .toBeLessThanOrEqual(3)
    const first = await captureLayout(page)
    await page.screenshot({ path: info.outputPath(`shipping-${width}.png`) })
    await page.setViewportSize({
      width: width === 1720 ? 3200 : 1720,
      height: 1200,
    })
    await expect
      .poll(async () => (await captureLayout(page)).native['客户名称'])
      .not.toBe(first.native['客户名称'])
    const second = await captureLayout(page)
    await info.attach('adaptive-widths.json', {
      body: JSON.stringify({ width, first, second }, null, 2),
      contentType: 'application/json',
    })
    const nativeRatio = second.native['客户名称']! / first.native['客户名称']!
    for (const name of [
      '钢种',
      '目的地',
      '装车窗口',
      '计划量 (t)',
      '车辆',
      '状态',
    ]) {
      expect(second.native[name]! / first.native[name]!, name).toBeCloseTo(
        nativeRatio,
        1
      )
    }
    const machRatio = second.mach.specification! / first.mach.specification!
    for (const key of ['batch', 'location', 'grade', 'weightKg']) {
      expect(second.mach[key]! / first.mach[key]!, key).toBeCloseTo(
        machRatio,
        1
      )
    }
    for (const name of ['序号', '操作'])
      expect(second.native[name]).toBeCloseTo(first.native[name]!, 1)
    for (const key of ['sel', 'idx', 'quality']) {
      if (key in first.mach)
        expect(second.mach[key]).toBeCloseTo(first.mach[key]!, 1)
    }
    const action = page
      .locator('.shipping-queue tbody tr')
      .first()
      .locator('.c-table-actions-column')
    const buttons = await action.getByRole('button').all()
    const bounds = (await action.boundingBox())!
    await buttons.reduce(async (previous, button) => {
      await previous
      const box = (await button.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(bounds.x + 11)
      expect(box.x + box.width).toBeLessThanOrEqual(
        bounds.x + bounds.width - 11
      )
      await button.click({ trial: true })
    }, Promise.resolve())
    await expect(
      page.locator(
        '.shipping-queue thead .c-table-index-column .n-data-table-resize-button'
      )
    ).toHaveCount(0)
    await expect(
      page.locator(
        '.shipping-queue thead .c-table-actions-column .n-data-table-resize-button'
      )
    ).toHaveCount(0)
  })
}

test('C_Table 首个像素、拖动及偏好提交后仅改变目标列', async ({
  page,
}, info) => {
  await openShipping(page, 3200)
  const table = page.locator('.shipping-queue')
  const target = table.getByRole('columnheader', {
    name: '客户名称',
    exact: true,
  })
  const handle = target.locator('.n-data-table-resize-button')
  await handle.hover()
  const box = (await handle.boundingBox())!
  const before = await nativeWidths(table)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 1, y)
  await nextPaint(page)
  const firstPixel = await nativeWidths(table)
  await page.mouse.move(x + 40, y, { steps: 6 })
  await nextPaint(page)
  const moving = await nativeWidths(table)
  await page.mouse.up()
  // 覆盖库内150ms偏好提交窗口；每帧采样，验证松手后也不会换列或反跳。
  const frames = await table.evaluate(
    element =>
      new Promise<Array<Record<string, number>>>(resolve => {
        const started = performance.now()
        const frames: Array<Record<string, number>> = []
        const capture = () => {
          frames.push(
            Object.fromEntries(
              [...element.querySelectorAll('thead th')].map(header => [
                header
                  .querySelector('.n-data-table-th__title')
                  ?.textContent?.trim() ??
                  header.textContent?.trim() ??
                  '',
                header.getBoundingClientRect().width,
              ])
            )
          )
          if (performance.now() - started < 240) requestAnimationFrame(capture)
          else resolve(frames)
        }
        requestAnimationFrame(capture)
      })
  )
  await info.attach('resize-widths.json', {
    body: JSON.stringify({ before, firstPixel, moving, frames }, null, 2),
    contentType: 'application/json',
  })
  expect(firstPixel['客户名称']).toBeCloseTo(before['客户名称']! + 1, 0)
  expect(moving['客户名称']).toBeCloseTo(before['客户名称']! + 40, 0)
  for (const widths of [firstPixel, moving, ...frames]) {
    expectOtherWidthsStable(before, widths, '客户名称')
  }
  for (const widths of frames) {
    expect(widths['客户名称']).toBeCloseTo(moving['客户名称']!, 1)
  }
})

test('MachTable 实际库存列拖宽和缩窄只改变目标列', async ({ page }, info) => {
  await openShipping(page, 3200)
  const table = page.locator('.shipping-stock-grid')
  const target = table.locator('.mach-header-cell[data-col-id="specification"]')
  const handle = target.locator('.mach-header-resize')
  const before = await machWidths(table)
  await [40, -20].reduce(async (previous, delta) => {
    await previous
    await handle.hover()
    const box = (await handle.boundingBox())!
    const start = await machWidths(table)
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + delta, y, { steps: 5 })
    await nextPaint(page)
    const moving = await machWidths(table)
    await page.mouse.up()
    const after = await machWidths(table)
    await info.attach(`mach-resize-${delta}.json`, {
      body: JSON.stringify({ before, start, moving, after }, null, 2),
      contentType: 'application/json',
    })
    expect(after.specification).toBeCloseTo(start.specification! + delta, 0)
    expectOtherWidthsStable(before, moving, 'specification')
    expectOtherWidthsStable(before, after, 'specification')
  }, Promise.resolve())
})
