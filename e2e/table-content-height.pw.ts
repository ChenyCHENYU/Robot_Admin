/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @Description: 原生分页与内容高度回归，覆盖少量数据、空态、横向滚动和大数据退回虚拟视口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { installMockAdminSession } from './auth-fixture'
import { contentGridOptions } from '../src/views/production-sales/shared/presentation'

/** 读取实际布局，检查正文、滚动条和表格容器之间的边界。 */
const geometry = (scope: Locator) =>
  scope.evaluate(element => {
    const root = element.querySelector('.mach-root')!
    const viewport = root.querySelector('.mach-body-viewport--scroll')!
    const rows = [...viewport.querySelectorAll('.mach-row[data-index]')]
    const last = rows
      .sort(
        (a, b) =>
          Number(a.getAttribute('data-index')) -
          Number(b.getAttribute('data-index'))
      )
      .at(-1)
    const bounds = viewport.getBoundingClientRect()
    return {
      height: root.getBoundingClientRect().height,
      gap:
        element.getBoundingClientRect().bottom -
        root.getBoundingClientRect().bottom,
      viewportBottom: bounds.top + viewport.clientHeight,
      lastBottom: last?.getBoundingClientRect().bottom ?? bounds.top,
    }
  })

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1720, height: 1100 })
})

test('MachTable 使用内置分页，少量炉次随内容收起并保留底部间距', async ({
  page,
}) => {
  await page.goto('/#/production-sales/production-plan')
  const root = page.getByTestId('production-plan')
  await expect(root).toBeVisible({ timeout: 20_000 })
  const ledger = root.locator('[aria-label="排产计划台账"]')
  await expect(ledger.locator('.mach-pagination')).toBeVisible()
  await expect(ledger.locator('.mach-pagination-total')).toContainText('18')
  await ledger.locator('.mach-pagination-next').click()
  await expect(ledger.locator('.mach-pagination-page')).toContainText('2 / 2')
  await expect(
    ledger.locator('.mach-pane--center .mach-row[data-id="PLAN-11"]')
  ).toBeVisible()
  // 第二页调整顺序仍保留第一页及其余记录，避免分页后只写回当前页数据。
  await ledger
    .locator('.mach-row[data-id="PLAN-12"] .mach-row-drag-handle')
    .focus()
  await page.keyboard.press('Alt+ArrowUp')
  await expect(
    ledger.locator('.mach-pane--center .mach-row[data-index="0"]')
  ).toHaveAttribute('data-id', 'PLAN-12')
  await expect(ledger.locator('.mach-pagination-total')).toContainText('18')
  await ledger.locator('.mach-pagination-first').click()
  await expect(
    ledger.locator('.mach-pane--center .mach-row[data-index="0"]')
  ).toHaveAttribute('data-id', 'PLAN-1')

  const heats = root.locator('[aria-label="计划协同详情"] .ps-grid')
  const first = await geometry(heats)
  expect(first.height).toBeLessThan(150)
  expect(first.gap).toBeGreaterThanOrEqual(7)
  expect(first.lastBottom).toBeLessThanOrEqual(first.viewportBottom + 1)
  await ledger
    .locator('.mach-row[data-id="PLAN-3"] .mach-cell[data-col-id="line"]')
    .click()
  await expect
    .poll(async () => (await geometry(heats)).height)
    .toBeGreaterThan(first.height + 40)
  await ledger
    .locator('.mach-row[data-id="PLAN-1"] .mach-cell[data-col-id="line"]')
    .click()
  await expect
    .poll(async () => (await geometry(heats)).height)
    .toBe(first.height)
})

test('C_Table 保留 Naive 分页条，筛选短列表后收起任务池留白', async ({
  page,
}) => {
  await page.goto('/#/production-sales/shipping')
  const queue = page.locator('.shipping-queue')
  await expect(queue).toBeVisible({ timeout: 20_000 })
  await expect(queue.locator('.n-pagination')).toBeVisible()
  const before = await queue.evaluate(
    element => element.getBoundingClientRect().height
  )
  await page.locator('.shipping-stages > button').last().click()
  await expect
    .poll(async () =>
      queue.evaluate(element => element.getBoundingClientRect().height)
    )
    .toBeLessThan(before - 80)
  await expect(queue.locator('.n-pagination')).toBeVisible()
  const stock = page.locator('.shipping-stock-grid')
  const bounds = await geometry(stock)
  expect(bounds.gap).toBeGreaterThanOrEqual(7)
  expect(bounds.lastBottom).toBeLessThanOrEqual(bounds.viewportBottom + 1)
})

test('销售订单主表复用 MachTable 分页且详情弹窗不继承工作区固定高度', async ({
  page,
}) => {
  await page.goto('/#/production-sales/sales-orders')
  const master = page.locator('[aria-label="订单列表"]')
  await expect(master.locator('.mach-pagination')).toBeVisible({
    timeout: 20_000,
  })
  await master.locator('.mach-pagination-next').click()
  await expect(master.locator('.mach-pagination-page')).toContainText('2 / 2')
  await master.locator('.mach-pagination-first').click()
  await master
    .getByRole('button', { name: '查看SO-2026-001详情', exact: true })
    .click()
  const detail = page
    .locator('.ps-detail-modal,.workbench-order-detail')
    .filter({ has: page.locator('.workbench-content-grid') })
  await expect(detail).toBeVisible()
  const bounds = await geometry(detail.locator('.workbench-content-grid'))
  expect(bounds.height).toBeLessThan(200)
  expect(bounds.gap).toBeGreaterThanOrEqual(7)
})

test('自动高度空态可见且恢复一行后释放高度，大数据继续使用有界虚拟视口', async ({
  page,
}) => {
  await page.goto('/#/production-sales/production-plan')
  await expect(page.getByTestId('production-plan')).toBeVisible({
    timeout: 20_000,
  })
  // 使用已安装正式包的公开 API，不依赖生产构建会剔除的 Vue 调试属性。
  const resolve = createRequire(import.meta.url)
  const core = createRequire(resolve.resolve('@agile-team/mach-table-vue'))
  const source = await readFile(
    core.resolve('@agile-team/mach-table').replace(/\.cjs$/, '.js'),
    'utf8'
  )
  const scenarios = [0, 1, 10_000].map(rowCount => ({
    rowCount,
    options: contentGridOptions(rowCount),
  }))
  const layouts = await page.evaluate(
    async ({ source, scenarios }) => {
      const url = URL.createObjectURL(
        new Blob([source], { type: 'text/javascript' })
      )
      const { createGrid } = (await import(
        url
      )) as typeof import('@agile-team/mach-table-vue')
      URL.revokeObjectURL(url)
      const host = document.createElement('div')
      host.style.width = '800px'
      document.body.append(host)
      const api = createGrid(host, {
        columnDefs: [{ field: 'heatNo', headerName: '炉号' }],
        rowKey: 'id',
        pagination: false,
        domLayout: 'autoHeight',
        rowData: [],
      })
      const layouts = []
      for (const { rowCount, options } of scenarios) {
        host.style.height = options.style.height
        api.updateOptions({ domLayout: options.domLayout })
        api.rows.setData(
          Array.from({ length: rowCount }, (_, index) => ({
            id: `test-${index}`,
            heatNo: `H-${index}`,
          }))
        )
        // 同一实例必须依次完成空态、恢复与虚拟化布局，验证高度确实释放。
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>(done =>
          requestAnimationFrame(() => requestAnimationFrame(() => done()))
        )
        const grid = host.querySelector('.mach-root')!
        layouts.push({
          height: grid.getBoundingClientRect().height,
          empty: !!grid.querySelector('.mach-empty'),
          autoHeight: grid.classList.contains('mach-dom-layout--auto-height'),
          rows: grid.querySelectorAll(
            '.mach-pane--center .mach-row[data-index]'
          ).length,
        })
      }
      api.destroy()
      host.remove()
      return layouts
    },
    { source, scenarios }
  )
  expect(layouts[0].empty).toBe(true)
  expect(layouts[0].height).toBeGreaterThanOrEqual(180)
  expect(layouts[1].height).toBeLessThan(100)
  expect(layouts[2].autoHeight).toBe(false)
  expect(layouts[2].height).toBeLessThanOrEqual(331)
  expect(layouts[2].rows).toBeGreaterThan(0)
  expect(layouts[2].rows).toBeLessThan(50)
})
