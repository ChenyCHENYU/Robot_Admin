/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-13
 * @FilePath: \\Robot_Admin\\e2e\\shipping-column-sizing.pw.ts
 * @Description: 发运两种表格在宽屏下的内容列宽与真实拖动隔离回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
import assertBrowserLaunchEnvironment from './runtime-browser-setup'

test.beforeAll(assertBrowserLaunchEnvironment)

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
          .filter(
            header =>
              header.getBoundingClientRect().width > 0 &&
              !header.classList.contains('c-table-layout-gap')
          )
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

/** 记录右固定列锚点和可见文本行数，不把表内补白列当成业务列。 */
async function captureNativeResizeState(table: Locator) {
  const widths = await nativeWidths(table)
  const geometry = await table.evaluate(element => {
    const headers = [...element.querySelectorAll('thead th')]
    const rows = [...element.querySelectorAll('tbody tr')].filter(
      row => row.getBoundingClientRect().height > 0
    )
    const container = element.querySelector('.n-data-table-wrapper')!
    const { right } = container.getBoundingClientRect()
    const actionHeader = headers.find(header =>
      header.classList.contains('c-table-actions-column')
    )!
    const cells = ['发运单号', '钢种'].map(title => {
      const index = headers.findIndex(
        header =>
          header
            .querySelector('.n-data-table-th__title')
            ?.textContent?.trim() === title
      )
      return {
        title,
        lines: rows.map(row => {
          const cell = row.querySelectorAll('td')[index]!
          const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT)
          const tops = new Set<number>()
          let text = walker.nextNode()
          while (text) {
            if (text.textContent?.trim()) {
              const range = document.createRange()
              range.selectNodeContents(text)
              for (const rect of range.getClientRects()) {
                if (rect.width > 0 && rect.height > 0)
                  tops.add(Math.round(rect.top))
              }
            }
            text = walker.nextNode()
          }
          return tops.size
        }),
      }
    })
    return {
      available: container.clientWidth,
      right,
      headerLabels: headers.flatMap(header => {
        const title = header.querySelector('.n-data-table-th__title')
        if (!title?.textContent?.trim()) return []
        const range = document.createRange()
        range.selectNodeContents(title)
        const text = range.getBoundingClientRect()
        const cell = header.getBoundingClientRect()
        return [
          {
            title: title.textContent.trim(),
            left: text.left - cell.left,
            right: cell.right - text.right,
          },
        ]
      }),
      actionHeaderRight: actionHeader.getBoundingClientRect().right,
      actionBodyRights: rows.map(
        row =>
          row.querySelector('.c-table-actions-column')!.getBoundingClientRect()
            .right
      ),
      rowHeights: rows.map(row => row.getBoundingClientRect().height),
      cells,
    }
  })
  return { widths, ...geometry }
}

type NativeResizeState = Awaited<ReturnType<typeof captureNativeResizeState>>

/** 固定操作列始终贴住视口右侧，允许外框一像素边线。 */
function expectRightAnchor(state: NativeResizeState, phase: string) {
  for (const edge of [state.actionHeaderRight, ...state.actionBodyRights])
    expect.soft(Math.abs(edge - state.right), phase).toBeLessThanOrEqual(1)
}

/** 缩列不折断短标识，不抬高整行，且不联动其他业务列。 */
function expectNativeShrinkState(
  before: NativeResizeState,
  state: NativeResizeState,
  target: string,
  phase: string
) {
  const utility = new Set(['序号', '操作', ''])
  for (const [key, width] of Object.entries(before.widths)) {
    if (key !== target && !utility.has(key))
      expect
        .soft(state.widths[key], `${phase}: ${key} 不应联动`)
        .toBeCloseTo(width, 1)
  }
  for (const [index, height] of state.rowHeights.entries())
    expect
      .soft(height, `${phase}: 第${index + 1}行高度`)
      .toBeLessThanOrEqual(before.rowHeights[index]! + 1)
  for (const cell of state.cells)
    for (const lines of cell.lines)
      expect
        .soft(lines, `${phase}: ${cell.title} 不应折成多行`)
        .toBeLessThanOrEqual(1)
  for (const label of state.headerLabels) {
    expect
      .soft(label.left, `${phase}: ${label.title} 左边界`)
      .toBeGreaterThanOrEqual(-0.5)
    expect
      .soft(label.right, `${phase}: ${label.title} 完整表头`)
      .toBeGreaterThanOrEqual(-0.5)
  }
  expectRightAnchor(state, phase)
}

/** 自定义文本按钮必须自行尾省略，不能依赖外层裁掉整块按钮。 */
async function recordTruncation(button: Locator) {
  return button.evaluate(element => {
    const button = element as HTMLElement
    const style = getComputedStyle(button)
    const cell = button.closest('td')!
    const cellStyle = getComputedStyle(cell)
    const bounds = button.getBoundingClientRect()
    const ellipsis = button.closest('.n-ellipsis')!
    const clipLeft = Math.max(
      bounds.left,
      ellipsis.getBoundingClientRect().left
    )
    const text = document
      .createTreeWalker(button, NodeFilter.SHOW_TEXT)
      .nextNode()!
    const prefix = document.createRange()
    prefix.setStart(text, 0)
    prefix.setEnd(text, 1)
    return {
      label: button.textContent!.trim(),
      textOverflow: style.textOverflow,
      overflow: style.overflow,
      whiteSpace: style.whiteSpace,
      clientWidth: button.clientWidth,
      scrollWidth: button.scrollWidth,
      available:
        cell.clientWidth -
        Number.parseFloat(cellStyle.paddingLeft) -
        Number.parseFloat(cellStyle.paddingRight),
      prefixInset: prefix.getBoundingClientRect().left - clipLeft,
    }
  })
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
              [...element.querySelectorAll('thead th')]
                .filter(
                  header => !header.classList.contains('c-table-layout-gap')
                )
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

/* eslint-disable no-await-in-loop -- 连续拖动、逐帧采样及容器切换有先后依赖，必须串行读取真实几何。 */
test('C_Table 连续缩至表头下限后保持单行、右锚及邻列，容器变化重新铺满', async ({
  page,
}, info) => {
  await openShipping(page, 3200)
  const table = page.locator('.shipping-queue')
  await expect
    .poll(async () => {
      const state = await captureNativeResizeState(table)
      return Math.abs(
        Object.values(state.widths).reduce((sum, width) => sum + width, 0) -
          state.available
      )
    })
    .toBeLessThanOrEqual(3)
  const initial = await captureNativeResizeState(table)
  expectRightAnchor(initial, '初始布局')

  for (const title of ['发运单号', '钢种', '客户名称']) {
    const target = table.getByRole('columnheader', { name: title, exact: true })
    const handle = target.locator('.n-data-table-resize-button')
    const before = await captureNativeResizeState(table)
    await handle.hover()
    const box = (await handle.boundingBox())!
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x - 1, y)
    await nextPaint(page)
    const firstPixel = await captureNativeResizeState(table)
    // 越过完整列宽后继续左移，验证真实拖动停在表头下限而非鼠标终点。
    const floorX = x - before.widths[title]! - 100
    await page.mouse.move(floorX, y, { steps: 12 })
    await nextPaint(page)
    const floor = await captureNativeResizeState(table)
    await page.mouse.move(floorX - 100, y, { steps: 3 })
    await nextPaint(page)
    const furtherLeft = await captureNativeResizeState(table)
    await page.mouse.up()
    const frames: NativeResizeState[] = []
    const started = Date.now()
    // 覆盖150ms保存窗口，每帧核验固定锚点和业务列，不能只看松手瞬间。
    while (Date.now() - started < 240) {
      await nextPaint(page)
      frames.push(await captureNativeResizeState(table))
    }
    await info.attach(`native-shrink-${title}.json`, {
      body: JSON.stringify(
        { before, firstPixel, floor, furtherLeft, frames },
        null,
        2
      ),
      contentType: 'application/json',
    })
    expect
      .soft(firstPixel.widths[title])
      .toBeCloseTo(before.widths[title]! - 1, 0)
    expect.soft(floor.widths[title]).toBeLessThan(before.widths[title]! - 20)
    expect.soft(furtherLeft.widths[title]).toBeCloseTo(floor.widths[title]!, 1)
    for (const [phase, state] of [
      ['首像素', firstPixel],
      ['表头下限', floor],
      ['继续左拖', furtherLeft],
      ...frames.map((state, index) => [`偏好提交帧${index}`, state] as const),
    ] as const) {
      expectNativeShrinkState(before, state, title, `${title}: ${phase}`)
      if (phase.startsWith('偏好提交'))
        expect.soft(state.widths[title]).toBeCloseTo(floor.widths[title]!, 1)
    }
    await page.screenshot({
      path: info.outputPath(`native-shrink-${title}.png`),
    })
    if (title === '发运单号') {
      const link = table.locator('.ps-record-link').first()
      const truncation = await recordTruncation(link)
      await info.attach('native-record-truncation.json', {
        body: JSON.stringify(truncation, null, 2),
        contentType: 'application/json',
      })
      expect.soft(truncation.textOverflow, '按钮自身尾省略').toBe('ellipsis')
      expect.soft(truncation.overflow, '按钮自身裁切溢出').toBe('hidden')
      expect.soft(truncation.whiteSpace).toBe('nowrap')
      expect
        .soft(truncation.clientWidth)
        .toBeLessThanOrEqual(truncation.available + 1)
      expect
        .soft(truncation.scrollWidth)
        .toBeGreaterThan(truncation.clientWidth)
      expect
        .soft(truncation.prefixInset, '从完整单号前缀开始展示')
        .toBeGreaterThanOrEqual(-0.5)
      await link.hover()
      // Naive Tooltip 由 Popover 附加 n-tooltip 类；悬浮内容必须是完整业务单号。
      const tooltip = page
        .locator('.n-tooltip')
        .filter({ hasText: truncation.label })
      await expect.soft(tooltip).toBeVisible({ timeout: 2000 })
      if (await tooltip.isVisible()) {
        await expect.soft(tooltip).toHaveText(truncation.label)
        // visible 不要求 opacity>0；等待主题入场结束，截图必须能读到完整单号。
        await expect.soft(tooltip).toHaveCSS('opacity', '1')
      }
      await page.screenshot({
        path: info.outputPath('native-record-tooltip.png'),
      })
      await page.mouse.move(10, 100)
      await expect.soft(tooltip).toBeHidden()
    }
    // 使用真实点击打开详情，避免只验证几何而忽略链接被固定列或遮罩挡住。
    await table.locator('.ps-record-link').first().click()
    const detail = page.getByRole('dialog').filter({ hasText: '发运单详情' })
    await expect(detail).toBeVisible()
    await detail.getByRole('button', { name: '关闭详情', exact: true }).click()
    await expect(detail).toBeHidden()
  }

  const reflow: NativeResizeState[] = []
  for (const width of [1720, 3200]) {
    await page.setViewportSize({ width, height: 1200 })
    await expect
      .poll(async () => {
        const state = await captureNativeResizeState(table)
        return Math.abs(
          Object.values(state.widths).reduce((sum, value) => sum + value, 0) -
            state.available
        )
      })
      .toBeLessThanOrEqual(3)
    const state = await captureNativeResizeState(table)
    reflow.push(state)
    expectRightAnchor(state, `容器${width}px`)
    for (const cell of state.cells)
      for (const lines of cell.lines)
        expect.soft(lines, `${width}px: ${cell.title}`).toBeLessThanOrEqual(1)
  }
  await info.attach('native-shrink-reflow.json', {
    body: JSON.stringify({ initial, reflow }, null, 2),
    contentType: 'application/json',
  })
})
/* eslint-enable no-await-in-loop */
