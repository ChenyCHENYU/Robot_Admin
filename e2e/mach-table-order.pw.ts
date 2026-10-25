/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\e2e\mach-table-order.pw.ts
 * @Description: MachTable 行顺序调整、场景保留、搜索与主题交互回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const route = '/#/demo/table-manage/mach-table'

/** 读取虚拟行当前显示顺序，不依赖行 DOM 的复用顺序。 */
const visibleOrder = (page: Page) =>
  page
    .locator('.mach-row[data-id] .mach-cell[data-col-id="orderNo"]')
    .evaluateAll(cells =>
      cells
        .map(cell => cell.closest<HTMLElement>('.mach-row')!)
        .sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index))
        .map(row => row.dataset.id)
    )

/** Naive UI 的选项使用实际菜单节点，不声明原生 option role。 */
const chooseSaveMode = async (page: Page, label: string): Promise<void> => {
  await page.locator('.mach-reorder-save-control__select').click()
  await page
    .locator('.n-base-select-option:visible')
    .getByText(label, { exact: true })
    .click()
}

/** 从第一行手柄拖至指定行下半区，保持按下以验证移动反馈或取消。 */
const beginMove = async (page: Page, targetId = '3') => {
  const handle = page.locator('.mach-row[data-id="1"] .mach-row-drag-handle')
  await handle.hover()
  const start = (await handle.boundingBox())!
  const target = (await page
    .locator(
      `.mach-row[data-id="${targetId}"] .mach-cell[data-col-id="orderNo"]`
    )
    .boundingBox())!
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    start.x + start.width / 2,
    target.y + target.height * 0.8,
    { steps: 8 }
  )
  await expect(page.locator('.mach-row-drag-preview')).toBeVisible()
  await expect(page.locator('.mach-row-drop-indicator').first()).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1000 })
  await page.goto(route)
  await expect(page.locator('.mach-root')).toBeVisible()
  await page.getByText('顺序调整', { exact: true }).click()
  await expect(page.getByText('Grid Ready', { exact: true })).toBeVisible()
  await expect(page.locator('.mach-row-drag-handle').first()).toBeEnabled()
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['1', '2', '3'])
})

test('真实拖拽同步顺序，切换场景保留结果并可恢复', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await expect(
    page.getByRole('button', { name: '恢复初始顺序', exact: true })
  ).toBeDisabled()
  await beginMove(page)
  await page.screenshot({ path: testInfo.outputPath('reorder-light.png') })
  await page.mouse.up()
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['2', '3', '1'])
  await expect(page.locator('.mach-reorder-status [role="status"]')).toHaveText(
    '已调整 1 项顺序（模拟保存成功）'
  )
  await expect(page.locator('.mach-reorder-status__preview')).toContainText(
    'MT-2026-00002 → MT-2026-00003 → MT-2026-00001'
  )
  await expect(page.locator('.mach-row-drag-preview')).toHaveCount(0)
  await page.getByText('标准 CRUD', { exact: true }).click()
  await expect(page.locator('.mach-row-drag-handle')).toHaveCount(0)
  await page.getByText('顺序调整', { exact: true }).click()
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['2', '3', '1'])
  await page.getByRole('button', { name: '恢复初始顺序', exact: true }).click()
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['1', '2', '3'])
  await expect(page.locator('.mach-reorder-status [role="status"]')).toHaveText(
    '已恢复初始顺序'
  )
  expect(errors).toEqual([])
})

test('Esc 取消，搜索后键盘移动仍保留完整订单与顺序', async ({ page }) => {
  await beginMove(page)
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(page.locator('.mach-row-drag-preview')).toHaveCount(0)
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['1', '2', '3'])
  const search = page.getByPlaceholder('搜索订单、客户、产品或区域')
  await search.fill('星海科技')
  await expect
    .poll(() => visibleOrder(page))
    .toEqual(['1', '7', '13', '19', '25'])
  const firstHandle = page.locator(
    '.mach-row[data-id="1"] .mach-row-drag-handle'
  )
  await firstHandle.focus()
  await page.keyboard.press('Alt+ArrowDown')
  await expect
    .poll(() => visibleOrder(page))
    .toEqual(['7', '1', '13', '19', '25'])
  await expect(page.locator('.mach-reorder-status')).toHaveAttribute(
    'data-status',
    'saved'
  )
  await search.fill('')
  await page.getByText('标准 CRUD', { exact: true }).click()
  await page.getByText('顺序调整', { exact: true }).click()
  await search.fill('星海科技')
  await expect
    .poll(() => visibleOrder(page))
    .toEqual(['7', '1', '13', '19', '25'])
  await search.fill('')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出 CSV', exact: true }).click()
  const download = await downloadPromise
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
  const csv = Buffer.concat(chunks).toString('utf8')
  expect(csv.match(/MT-2026-\d{5}/g)).toHaveLength(30)
})

test('不连续多行一起移动，并用相同模拟保存协议撤销和重做', async ({ page }) => {
  await page.getByRole('button', { name: '选中两项订单', exact: true }).click()
  await Promise.all(
    ['1', '3'].map(id =>
      expect(
        page.locator(`.mach-row[data-id="${id}"] .mach-row-checkbox`)
      ).toBeChecked()
    )
  )
  await beginMove(page, '5')
  await page.mouse.up()
  await expect(page.locator('.mach-reorder-status')).toHaveAttribute(
    'data-status',
    'saving'
  )
  await expect(
    page.getByRole('button', { name: '撤销顺序', exact: true })
  ).toBeDisabled()
  await expect(page.locator('.mach-row-drag-handle').first()).toBeDisabled()
  await expect(page.locator('.mach-reorder-status')).toHaveAttribute(
    'data-status',
    'saved'
  )
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 6))
    .toEqual(['2', '4', '5', '1', '3', '6'])
  await expect(
    page.locator('.mach-reorder-status [role="status"]')
  ).toContainText('已调整 2 项')
  await page.getByRole('button', { name: '撤销顺序', exact: true }).click()
  await expect(
    page.locator('.mach-reorder-status [role="status"]')
  ).toContainText('已撤销 2 项')
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 6))
    .toEqual(['1', '2', '3', '4', '5', '6'])
  await page.getByRole('button', { name: '重做顺序', exact: true }).click()
  await expect(
    page.locator('.mach-reorder-status [role="status"]')
  ).toContainText('已重做 2 项')
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 6))
    .toEqual(['2', '4', '5', '1', '3', '6'])
})

test('模拟保存失败自动补偿，版本冲突须加载服务器顺序后再保存', async ({
  page,
}) => {
  await chooseSaveMode(page, '模拟保存失败')
  await beginMove(page)
  await page.mouse.up()
  await expect(page.locator('.mach-reorder-status')).toHaveAttribute(
    'data-status',
    'error'
  )
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['1', '2', '3'])
  await expect(
    page.getByRole('button', { name: '撤销顺序', exact: true })
  ).toBeDisabled()
  await chooseSaveMode(page, '模拟版本冲突')
  await beginMove(page)
  await page.mouse.up()
  await expect(page.locator('.mach-reorder-status')).toHaveAttribute(
    'data-status',
    'conflict'
  )
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['1', '2', '3'])
  await expect(page.locator('.mach-reorder-status')).toContainText(
    '客户端 r1 · 模拟服务器 r2'
  )
  await page
    .getByRole('button', { name: '重新加载服务器顺序', exact: true })
    .click()
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['2', '3', '4'])
  await expect(page.locator('.mach-reorder-status')).toContainText(
    '客户端 r2 · 模拟服务器 r2'
  )
  await chooseSaveMode(page, '保存成功')
  const handle = page.locator('.mach-row[data-id="2"] .mach-row-drag-handle')
  await handle.focus()
  await page.keyboard.press('Alt+ArrowDown')
  await expect(page.locator('.mach-reorder-status')).toHaveAttribute(
    'data-status',
    'saved'
  )
  await expect(page.locator('.mach-reorder-status')).toContainText(
    '客户端 r3 · 模拟服务器 r3'
  )
})

test('切换场景取消尚未确认的模拟保存，不污染 CRUD 数据', async ({ page }) => {
  await beginMove(page)
  await page.mouse.up()
  await expect(page.locator('.mach-reorder-status')).toHaveAttribute(
    'data-status',
    'saving'
  )
  await page.getByText('标准 CRUD', { exact: true }).click()
  await expect(page.locator('.mach-row-drag-handle')).toHaveCount(0)
  await page.getByText('顺序调整', { exact: true }).click()
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['1', '2', '3'])
  await expect(
    page.locator('.mach-reorder-status [role="status"]')
  ).toContainText('已取消未完成')
  await expect(
    page.getByRole('button', { name: '撤销顺序', exact: true })
  ).toBeDisabled()
})

test('深色主题的手柄与移动反馈正常显示', async ({ page }, testInfo) => {
  await page.evaluate(() => localStorage.setItem('theme-mode', 'dark'))
  await page.reload()
  await page.getByText('顺序调整', { exact: true }).click()
  await expect(page.locator('.mach-root')).toHaveClass(/mach-theme-dark/)
  await beginMove(page)
  await page.screenshot({ path: testInfo.outputPath('reorder-dark.png') })
  await page.mouse.up()
  await expect
    .poll(async () => (await visibleOrder(page)).slice(0, 3))
    .toEqual(['2', '3', '1'])
})
