/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\e2e\mach-table-features.pw.ts
 * @Description: MachTable 导入确认、类型边界与千万行有界视口的真实交互回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const route = '/#/demo/table-manage/mach-table'
const longId = '900719925474099312345'

/** 使用真实页签导航，窄屏先让滚动导航中的目标进入可点击视口。 */
const changeScenario = async (page: Page, label: string): Promise<void> => {
  const tab = page
    .locator('.mach-scenario-tabs')
    .getByText(label, { exact: true })
  await tab.scrollIntoViewIfNeeded()
  await expect(tab).toBeInViewport()
  await tab.click()
}

/** 只从真实行和列身份读取单元格，固定列不按 DOM 顺序推算。 */
const cell = (panel: Locator, id: string, column: string): Locator =>
  panel.locator(
    `.mach-row[data-id="${id}"] .mach-cell[data-col-id="${column}"]`
  )

/** 进入独立导入场景，等待其自己的表格和确认入口就绪。 */
const openImport = async (page: Page): Promise<Locator> => {
  await changeScenario(page, '导入校验')
  const panel = page.locator('.mach-import-validation')
  await expect(panel).toBeVisible()
  await expect(
    panel.getByRole('button', { name: '校验预览', exact: true })
  ).toBeEnabled()
  return panel
}

/** 进入千万逻辑行场景，只等待首块实际内容，不访问组件内部 API。 */
const openLarge = async (page: Page): Promise<Locator> => {
  await changeScenario(page, '千万行视口')
  const panel = page.locator('.mach-large-data')
  await expect(panel).toBeVisible()
  await expect(cell(panel, 'large-1', 'orderNo')).toHaveText('ML-00000001')
  await expect(
    panel.getByRole('button', { name: '定位首行', exact: true })
  ).toBeEnabled()
  return panel
}

/** 校验可以展示规范值，但确认之前仍须保留原有本地记录。 */
const expectOriginal = async (panel: Locator): Promise<void> => {
  await expect(panel.locator('.mach-import-count output')).toHaveText('1')
  await expect(cell(panel, 'BASE-0001', 'name')).toHaveText('原有订单')
  await expect(cell(panel, '000001', 'id')).toHaveCount(0)
  await expect(cell(panel, longId, 'id')).toHaveCount(0)
}

/** 检查预览中的显示值和原始类型，避免把 JSON 文本冒充规范类型。 */
const expectPreviewCell = async (
  row: Locator,
  column: number,
  value: string,
  type: string
): Promise<void> => {
  const field = row.locator('td').nth(column)
  await expect(field.locator('span')).toHaveText(value)
  await expect(field.locator('small')).toHaveText(type)
}

/** 读取公开类型化导出面板，内容来自 exportMatrix，而非测试后门。 */
const exportedMatrix = async (panel: Locator): Promise<unknown[][]> =>
  JSON.parse((await panel.locator('.mach-import-export pre').textContent())!)

/** 保留行号和单元格都精确匹配后，再检查该行确实位于视口中。 */
const expectLocated = async (
  panel: Locator,
  sequence: number
): Promise<void> => {
  const id = `large-${sequence}`
  await expect(cell(panel, id, 'orderNo')).toHaveText(
    `ML-${String(sequence).padStart(8, '0')}`
  )
  await expect(cell(panel, id, 'sequence')).toHaveText(String(sequence))
  await expect(
    panel.locator(`.mach-row[data-id="${id}"]`).first()
  ).toHaveAttribute('data-index', String(sequence - 1))
  await panel.locator('.mach-large-data__grid').scrollIntoViewIfNeeded()
  await expect(cell(panel, id, 'orderNo')).toBeInViewport({ ratio: 0.9 })
  await expect(panel.locator('.mach-large-data__status')).toContainText(
    `已定位第 ${sequence.toLocaleString()} 行`
  )
}

/** 快照来自面板的公开诊断文本；DOM 上限另外读取实际渲染结果。 */
const expectBoundedViewport = async (panel: Locator): Promise<void> => {
  await panel.getByRole('button', { name: '刷新缓存快照', exact: true }).click()
  const snapshot = await panel.locator('.mach-large-data__snapshot').innerText()
  const cached = snapshot.match(/缓存\s*([\d,]+)\s*块\s*\/\s*([\d,]+)\s*行/)
  expect(cached).not.toBeNull()
  const blocks = Number(cached![1]!.replaceAll(',', ''))
  const rows = Number(cached![2]!.replaceAll(',', ''))
  expect(blocks).toBeGreaterThan(0)
  expect(blocks).toBeLessThanOrEqual(8)
  expect(rows).toBeLessThanOrEqual(1600)
  expect(snapshot).toContain('320,000,000px')
  const actual = await panel.locator('.mach-root').evaluate(root => {
    const viewport = root.querySelector<HTMLElement>(
      '.mach-body-viewport--scroll'
    )!
    const viewportBounds = viewport.getBoundingClientRect()
    const centerRows = Array.from(
      viewport.querySelectorAll<HTMLElement>('.mach-row[data-id]')
    )
    const visibleRow = centerRows.find(row => {
      const bounds = row.getBoundingClientRect()
      return (
        bounds.bottom > viewportBounds.top && bounds.top < viewportBounds.bottom
      )
    })
    // 表头与表体的初始挂载范围不同；此处只测实际可见数据行的列窗口。
    const columnIds = new Set(
      Array.from(
        visibleRow?.querySelectorAll<HTMLElement>('.mach-cell[data-col-id]') ??
          []
      ).map(cell => cell.dataset.colId)
    )
    return {
      height: viewport.scrollHeight,
      width: viewport.clientWidth,
      scrollWidth: viewport.scrollWidth,
      rootWidth: root.clientWidth,
      hostWidth: root.parentElement?.clientWidth,
      centerRows: centerRows.length,
      cells: root.querySelectorAll('.mach-cell[data-col-id]').length,
      centerColumns: columnIds.size,
      columnIds: [...columnIds],
    }
  })
  expect(actual.height).toBeGreaterThan(15_000_000)
  expect(actual.height).toBeLessThanOrEqual(16_000_000)
  expect(actual.width, JSON.stringify(actual)).toBeGreaterThan(80)
  expect(actual.centerRows).toBeGreaterThan(0)
  expect(actual.centerRows).toBeLessThan(100)
  expect(actual.cells).toBeGreaterThan(0)
  expect(actual.cells).toBeLessThan(3000)
  expect(actual.centerColumns).toBeGreaterThan(0)
  expect(actual.centerColumns, JSON.stringify(actual)).toBeLessThan(46)
}

/** 只模拟用户可操作的原生横向滚动，不调用表格私有方法。 */
const scrollHorizontally = async (
  panel: Locator,
  edge: 'start' | 'end'
): Promise<void> => {
  await panel
    .locator('.mach-body-viewport--scroll')
    .evaluate((element, edge) => {
      element.scrollLeft = edge === 'end' ? element.scrollWidth : 0
      element.dispatchEvent(new Event('scroll'))
    }, edge)
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1000 })
  await page.goto(route)
  await expect(page.locator('.mach-root')).toBeVisible()
})

test('错误和重复编号不换表，规范值须确认后才写入并保留长编号', async ({
  page,
}, testInfo) => {
  const panel = await openImport(page)
  await expectOriginal(panel)
  const confirm = panel.getByRole('button', { name: '确认导入', exact: true })
  await expect(confirm).toBeDisabled()
  await panel.getByRole('button', { name: '错误样例', exact: true }).click()
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'invalid')
  await expect(panel.locator('.mach-import-issues')).toContainText('第 1 行')
  await expect(panel.locator('.mach-import-issues')).toContainText(
    '日期不是有效日历日期'
  )
  await expect(panel.locator('.mach-import-issues')).toContainText(
    '启用的订单金额必须大于 0'
  )
  await expect(confirm).toBeDisabled()
  await expectOriginal(panel)
  await panel.getByRole('button', { name: '重复编号样例', exact: true }).click()
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'invalid')
  await expect(panel.locator('.mach-import-issues')).toContainText('批内重复')
  await expectOriginal(panel)

  await panel.getByRole('button', { name: '正常样例', exact: true }).click()
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'ready')
  await expectOriginal(panel)
  const preview = panel.locator('.mach-import-preview tbody tr')
  await expect(preview).toHaveCount(2)
  await expectPreviewCell(preview.nth(0), 1, '000001', 'string')
  await expectPreviewCell(preview.nth(1), 1, longId, 'string')
  await expectPreviewCell(preview.nth(1), 3, '8', 'number')
  await expectPreviewCell(preview.nth(1), 4, '2460.8', 'number')
  await expectPreviewCell(preview.nth(1), 5, '2026-11-03', 'Date')
  await expectPreviewCell(preview.nth(1), 6, 'false', 'boolean')
  await page.screenshot({
    path: testInfo.outputPath('mach-import-light-preview.png'),
    fullPage: true,
  })
  await confirm.click()
  await expect(panel).toHaveAttribute('data-status', 'applied')
  await expect(panel.locator('.mach-import-count output')).toHaveText('2')
  await expect(cell(panel, 'BASE-0001', 'id')).toHaveCount(0)
  await expect(cell(panel, longId, 'id')).toHaveText(longId)
  await expect(cell(panel, longId, 'amount')).toHaveText('¥ 2460.80')
  await panel
    .getByRole('button', { name: '查看类型化导出', exact: true })
    .click()
  await expect(panel.locator('.mach-import-type-list')).toContainText(
    '编号：string'
  )
  await expect(panel.locator('.mach-import-type-list')).toContainText(
    '金额：number'
  )
  await expect(panel.locator('.mach-import-type-list')).toContainText(
    '交付日期：Date'
  )
  await expect(panel.locator('.mach-import-type-list')).toContainText(
    '启用：boolean'
  )
  const matrix = await exportedMatrix(panel)
  expect(matrix[1]).toEqual([
    '000001',
    '精密控制器',
    12,
    1280.5,
    '2026-10-27T00:00:00.000Z',
    true,
  ])
  expect(matrix[2]).toEqual([
    longId,
    '传感模块',
    8,
    2460.8,
    '2026-11-03T00:00:00.000Z',
    false,
  ])
  await expect(confirm).toBeDisabled()
})

test('修改输入或模式立即撤销旧预览，追加按当前本地模型检查重复', async ({
  page,
}) => {
  const panel = await openImport(page)
  const confirm = panel.getByRole('button', { name: '确认导入', exact: true })
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'ready')
  await panel
    .getByRole('textbox', { name: '导入 JSON 矩阵', exact: true })
    .fill(JSON.stringify([['000099', '更改候选', 1, 99.5, '2026-10-28', true]]))
  await expect(panel).toHaveAttribute('data-status', 'idle')
  await expect(panel.locator('.mach-import-preview')).toHaveCount(0)
  await expect(confirm).toBeDisabled()
  await expectOriginal(panel)
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'ready')
  await panel.getByText('追加到当前数据', { exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'idle')
  await expect(confirm).toBeDisabled()
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'ready')
  await confirm.click()
  await expect(panel).toHaveAttribute('data-status', 'applied')
  await expect(panel.locator('.mach-import-count output')).toHaveText('2')
  await expect(cell(panel, 'BASE-0001', 'name')).toHaveText('原有订单')
  await expect(cell(panel, '000099', 'name')).toHaveText('更改候选')
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'invalid')
  await expect(panel.locator('.mach-import-issues')).toContainText(
    '与现有记录重复'
  )
  await expect(confirm).toBeDisabled()
  await expect(panel.locator('.mach-import-count output')).toHaveText('2')
})

test('空行保留原始预览行号，非法 JSON 不改变原表或残留可提交计划', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const panel = await openImport(page)
  const input = panel.getByRole('textbox', {
    name: '导入 JSON 矩阵',
    exact: true,
  })
  await input.fill(
    JSON.stringify([
      ['', '', '', '', '', ''],
      ['000007', '空行后订单', 2, 25, '2026-10-29', true],
    ])
  )
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'ready')
  const row = panel.locator('.mach-import-preview tbody tr')
  await expect(row).toHaveCount(1)
  await expect(row.locator('td').first()).toHaveText('2')
  await expectPreviewCell(row, 1, '000007', 'string')
  await expectOriginal(panel)
  await input.fill('[invalid JSON]')
  await panel.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(panel).toHaveAttribute('data-status', 'invalid')
  await expect(panel.locator('.mach-import-issues')).toContainText('合法 JSON')
  await expect(
    panel.getByRole('button', { name: '确认导入', exact: true })
  ).toBeDisabled()
  await expectOriginal(panel)
  expect(errors).toEqual([])
})

test('千万行首中末与指定行精确定位，缓存和实际 DOM 始终有界', async ({
  page,
}, testInfo) => {
  const panel = await openLarge(page)
  await expect(panel).toContainText('v0.33.0')
  await expect(panel).toContainText('10,000,000 行')
  await (
    [
      ['定位首行', 1],
      ['定位中间行', 5_000_000],
      ['定位末行', 10_000_000],
    ] as const
  ).reduce(async (previous, [label, sequence]) => {
    await previous
    await panel.getByRole('button', { name: label, exact: true }).click()
    await expectLocated(panel, sequence)
    await expectBoundedViewport(panel)
  }, Promise.resolve())
  await page.screenshot({
    path: testInfo.outputPath('mach-large-light-last.png'),
    fullPage: true,
  })
  const input = panel.getByRole('spinbutton', {
    name: '定位逻辑行号',
    exact: true,
  })
  await input.fill('7654321')
  await input.press('Enter')
  await expectLocated(panel, 7_654_321)
  await expectBoundedViewport(panel)
  await input.fill('')
  await panel.getByRole('button', { name: '跳转到指定行', exact: true }).click()
  await expect(panel.locator('.mach-large-data__status')).toContainText(
    '请输入 1 至 10,000,000 之间的行号'
  )
  await expect(cell(panel, 'large-7654321', 'orderNo')).toBeInViewport()
})

test('超过四十列横向往返恢复真实指标，左右固定列位置和内容不变', async ({
  page,
}) => {
  const panel = await openLarge(page)
  const order = cell(panel, 'large-1', 'orderNo')
  const status = cell(panel, 'large-1', 'status')
  await expect(cell(panel, 'large-1', 'metric-1')).toHaveText('3')
  await expect(status).toHaveText('待处理')
  await expect(
    panel.locator('.mach-cell[data-col-id="metric-44"]')
  ).toHaveCount(0)
  const before = {
    order: (await order.boundingBox())!,
    status: (await status.boundingBox())!,
  }
  await scrollHorizontally(panel, 'end')
  await expect(
    panel.locator('.mach-header-cell[data-col-id="metric-44"]')
  ).toHaveText('指标 44')
  await expect(
    panel.locator('.mach-header-cell[data-col-id="metric-44"]')
  ).toBeInViewport()
  await expect(cell(panel, 'large-1', 'metric-44')).toHaveText('46')
  await expect(cell(panel, 'large-1', 'metric-44')).toBeInViewport()
  await expect(order).toHaveText('ML-00000001')
  await expect(status).toHaveText('待处理')
  expect((await order.boundingBox())!.x).toBeCloseTo(before.order.x, 0)
  expect((await status.boundingBox())!.x).toBeCloseTo(before.status.x, 0)
  await scrollHorizontally(panel, 'start')
  await expect(cell(panel, 'large-1', 'metric-1')).toHaveText('3')
  await expect(
    panel.locator('.mach-cell[data-col-id="metric-44"]')
  ).toHaveCount(0)
  await expect(order).toHaveText('ML-00000001')
  await expect(status).toHaveText('待处理')
  await expectBoundedViewport(panel)
})

test('深色窄屏保留交互，切换场景卸载旧表与预览并隔离本地数据', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.evaluate(() => localStorage.setItem('theme-mode', 'dark'))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  const importing = await openImport(page)
  await expect(importing.locator('.mach-root')).toHaveClass(/mach-theme-dark/)
  await importing.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(importing).toHaveAttribute('data-status', 'ready')
  await expectOriginal(importing)
  await page.screenshot({
    path: testInfo.outputPath('mach-import-dark-narrow.png'),
    fullPage: true,
  })
  const large = await openLarge(page)
  await expect(importing).toHaveCount(0)
  await expect(page.locator('.mach-root')).toHaveCount(1)
  await expect(large.locator('.mach-root')).toHaveClass(/mach-theme-dark/)
  await large.getByRole('button', { name: '定位中间行', exact: true }).click()
  await expectLocated(large, 5_000_000)
  await expectBoundedViewport(large)
  await large.locator('.mach-large-data__grid').scrollIntoViewIfNeeded()
  const pinnedOrder = cell(large, 'large-5000000', 'orderNo')
  await expect(pinnedOrder).toBeInViewport({ ratio: 0.9 })
  const pinnedX = (await pinnedOrder.boundingBox())!.x
  await scrollHorizontally(large, 'end')
  const narrowStatus = cell(large, 'large-5000000', 'status')
  await expect(narrowStatus).toHaveText('需关注')
  await expect(narrowStatus).toBeInViewport({ ratio: 0.9 })
  await expect(pinnedOrder).toHaveText('ML-05000000')
  await expect(pinnedOrder).toBeInViewport({ ratio: 0.9 })
  expect((await pinnedOrder.boundingBox())!.x).toBeCloseTo(pinnedX, 0)
  await scrollHorizontally(large, 'start')
  await expect(cell(large, 'large-5000000', 'sequence')).toHaveText('5000000')
  expect(
    await large.evaluate(element => element.scrollWidth - element.clientWidth)
  ).toBeLessThanOrEqual(1)
  await page.screenshot({
    path: testInfo.outputPath('mach-large-dark-narrow.png'),
    fullPage: true,
  })
  const restored = await openImport(page)
  await expect(large).toHaveCount(0)
  await expect(page.locator('.mach-root')).toHaveCount(1)
  await expect(restored).toHaveAttribute('data-status', 'idle')
  await expectOriginal(restored)
  await expect(
    restored.getByRole('button', { name: '确认导入', exact: true })
  ).toBeDisabled()
  await expect(restored.locator('.mach-import-preview')).toHaveCount(0)
  await restored.getByRole('button', { name: '校验预览', exact: true }).click()
  await expect(restored).toHaveAttribute('data-status', 'ready')
  await restored.getByRole('button', { name: '确认导入', exact: true }).click()
  await expect(restored).toHaveAttribute('data-status', 'applied')
  await expect(restored.locator('.mach-import-count output')).toHaveText('2')
  expect(
    await restored.evaluate(
      element => element.scrollWidth - element.clientWidth
    )
  ).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
})
