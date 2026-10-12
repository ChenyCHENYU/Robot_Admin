/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-12
 * @FilePath: \Robot_Admin\e2e\mach-table-widths.pw.ts
 * @Description: MachTable 容器宽度、内容自适应与列偏好回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const route = '/#/demo/table-manage/mach-table'
const header = (page: Page, id: string) =>
  page.locator(`.mach-header-cell[data-col-id="${id}"]`)

const layout = (page: Page) =>
  page.locator('.mach-root').evaluate(root => {
    const viewport = root.querySelector<HTMLElement>(
      '.mach-body-viewport--scroll'
    )!
    const headers = Array.from(
      root.querySelectorAll<HTMLElement>('.mach-header-cell[data-col-id]')
    )
    const widths = Object.fromEntries(
      headers.map(cell => [
        cell.dataset.colId!,
        cell.getBoundingClientRect().width,
      ])
    )
    const centerHeaders = headers.filter(cell =>
      cell.closest('.mach-pane--center')
    )
    return {
      available: viewport.clientWidth,
      filled: centerHeaders.reduce(
        (sum, cell) => sum + cell.getBoundingClientRect().width,
        0
      ),
      scrollWidth: viewport.scrollWidth,
      widths,
    }
  })

const expectFilled = async (page: Page) => {
  await expect
    .poll(async () => {
      const state = await layout(page)
      return Math.abs(state.available - state.filled)
    })
    .toBeLessThan(2)
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto(route)
  await expect(header(page, 'customer')).toBeVisible()
})

test('固定列只扣一次，宽屏填满、短内容列受限，窄屏保留最小宽度', async ({
  page,
}) => {
  // 连续缩放验证同一表格实例，等待前一次布局完成。
  await [1920, 2560, 3440, 1920].reduce(async (previous, width) => {
    await previous
    await page.setViewportSize({ width, height: 1080 })
    await expectFilled(page)
    const state = await layout(page)
    expect(state.widths.sel).toBe(40)
    expect(state.widths.idx).toBe(52)
    expect(state.widths.op).toBe(126)
    expect(state.widths.quantity).toBeLessThanOrEqual(120.1)
    expect(state.widths.status).toBeLessThanOrEqual(160.1)
  }, Promise.resolve())
  await page.setViewportSize({ width: 1200, height: 900 })
  await expect
    .poll(async () => (await layout(page)).scrollWidth)
    .toBeGreaterThan((await layout(page)).available)
  const narrow = await layout(page)
  expect(narrow.widths.customer).toBeGreaterThanOrEqual(140)
  expect(narrow.widths.product).toBeGreaterThanOrEqual(165)
  expect(narrow.widths.amount).toBeGreaterThanOrEqual(138)
})

test('内容自适应以后继续填满，刷新和手动拖拽保留各自列宽语义', async ({
  page,
}) => {
  await header(page, 'customer').locator('.mach-menu-btn').click()
  await page.getByRole('button', { name: '全部自适应', exact: true }).click()
  await expectFilled(page)
  const measured = await layout(page)
  await page.setViewportSize({ width: 2560, height: 1080 })
  await expectFilled(page)
  const wide = await layout(page)
  expect(wide.widths.customer).toBeGreaterThan(measured.widths.customer!)
  expect(wide.widths.op).toBe(126)
  await expect
    .poll(() =>
      page.evaluate(() => {
        const value = localStorage.getItem(
          'mach-table:grid-state:robot-admin:demo:mach-table:orders:v3'
        )
        const state = value ? JSON.parse(value).state : null
        return state?.columns.find(
          (column: { colId: string }) => column.colId === 'customer'
        )?.contentWidth
      })
    )
    .toBeGreaterThan(0)
  await page.reload()
  await expectFilled(page)
  await expect
    .poll(async () => (await layout(page)).widths.customer)
    .toBeCloseTo(wide.widths.customer!, 0)
  const customer = header(page, 'customer')
  const resize = customer.locator('.mach-header-resize')
  // 等待启动遮罩退场及手柄可交互，避免原始鼠标事件点中遮罩。
  await resize.hover()
  const before = (await customer.boundingBox())!
  const handle = (await resize.boundingBox())!
  await page.mouse.move(
    handle.x + handle.width / 2,
    handle.y + handle.height / 2
  )
  await page.mouse.down()
  await expect(page.locator('.mach-root')).toHaveClass(/mach-root--resizing/)
  await page.mouse.move(
    handle.x + handle.width / 2 + 50,
    handle.y + handle.height / 2,
    { steps: 4 }
  )
  await page.mouse.up()
  await expect(page.locator('.mach-root')).not.toHaveClass(
    /mach-root--resizing/
  )
  await expectFilled(page)
  await expect
    .poll(async () => (await customer.boundingBox())?.width)
    .toBeCloseTo(before.width + 50, 0)
  await page.setViewportSize({ width: 3440, height: 1080 })
  await expectFilled(page)
  await expect
    .poll(async () => (await customer.boundingBox())?.width)
    .toBeCloseTo(before.width + 50, 0)
})
