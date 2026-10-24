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

/** 从第一行手柄拖至第三行下半区，保持按下以验证移动反馈或取消。 */
const beginMove = async (page: Page) => {
  const handle = page.locator('.mach-row[data-id="1"] .mach-row-drag-handle')
  await handle.hover()
  const start = (await handle.boundingBox())!
  const target = (await page
    .locator('.mach-row[data-id="3"] .mach-cell[data-col-id="orderNo"]')
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
    'MT-2026-00001：由第 1 项移至第 3 项'
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
