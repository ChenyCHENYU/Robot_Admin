/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-15
 * @FilePath: \Robot_Admin\e2e\table-composite.pw.ts
 * @Description: 真实产销页的动态列、拖宽、固定操作、分页选择、弹窗校验及 tags 连续操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
import { expectSameDocument } from './d_documentIdentity'

const remotePath = '/production-sales/remote-workbench'
const planPath = '/production-sales/production-plan'

/** 首次从首页建立真实标签；后续往返点击标签，不用刷新代替 KeepAlive 恢复。 */
async function openFromHome(page: Page, path: string) {
  await page.goto('/#/home')
  await expect(page.locator('.project-homepage')).toBeVisible()
  await page.evaluate(target => {
    location.hash = target
  }, path)
  await expect(page.locator(`.tags-track [data-path="${path}"]`)).toBeVisible()
}

/** 标签往返必须沿用同一文档，且不能留下页面过渡遮挡操作区。 */
async function roundTrip(page: Page, path: string, view: Locator) {
  const originalDocument = await page.evaluateHandle(() => document)
  await page.locator('.tags-track [data-path="/home"]').click()
  await expect(page.locator('.project-homepage')).toBeVisible()
  await page.locator(`.tags-track [data-path="${path}"]`).click()
  await expect(view).toBeVisible()
  await expect(view).not.toHaveClass(/\S+-(?:enter|leave)-(?:active|from|to)/)
  await expectSameDocument(page, originalDocument)
}

/** 在当前明细范围读取实际列宽；不调用组件私有实例或 GridApi。 */
const widths = (grid: Locator) =>
  grid
    .locator('.mach-header-cell--leaf')
    .evaluateAll(headers =>
      Object.fromEntries(
        headers.map(header => [
          header.getAttribute('data-col-id')!,
          header.getBoundingClientRect().width,
        ])
      )
    )

/** 拖动真实命中位置，并核验保存后仍只改变目标列。 */
async function resizeProduct(page: Page, grid: Locator) {
  const header = grid.locator('.mach-header-cell[data-col-id="product"]')
  const handle = header.locator('.mach-header-resize')
  await handle.hover()
  const box = (await handle.boundingBox())!
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  expect(
    await handle.evaluate((element, point) => {
      const target = document.elementFromPoint(point.x, point.y)
      return target !== null && element.contains(target)
    }, point)
  ).toBe(true)
  const before = await widths(grid)
  await page.mouse.move(point.x, point.y)
  await page.mouse.down()
  await page.mouse.move(point.x + 44, point.y, { steps: 6 })
  await page.mouse.up()
  await expect
    .poll(async () => (await widths(grid)).product)
    .toBeCloseTo(before.product! + 44, 0)
  const after = await widths(grid)
  for (const [id, width] of Object.entries(before))
    if (id !== 'product')
      expect(after[id], `拖宽不能改变 ${id}`).toBeCloseTo(width, 1)
  return after.product!
}

/** 即使列位于横向视口外，标题自身也必须完整排版，不能因拖宽或恢复被省略。 */
async function expectFullHeader(header: Locator) {
  const geometry = await header.evaluate(element => {
    const label = element.querySelector('.mach-header-label')!
    const range = document.createRange()
    range.selectNodeContents(label)
    const text = range.getBoundingClientRect()
    const cell = element.getBoundingClientRect()
    return {
      left: text.left - cell.left,
      right: cell.right - text.right,
      overflow: getComputedStyle(label).textOverflow,
    }
  })
  expect(geometry.left).toBeGreaterThanOrEqual(-1)
  expect(geometry.right).toBeGreaterThanOrEqual(-1)
  expect(geometry.overflow).not.toBe('ellipsis')
}

/** 原生滚动改变后仍由右固定操作区接收真实指针，不能只有视觉上贴右。 */
async function expectFixedActions(page: Page, master: Locator) {
  const operation = master.locator(
    '.mach-pane--right .mach-row[data-id="RO-4"] .mach-cell[data-col-id="op"]'
  )
  const before = (await operation.boundingBox())!
  const center = master.locator(
    '.mach-pane--center .mach-row[data-id="RO-4"] .mach-cell[data-col-id="customer"]'
  )
  const centerBefore = (await center.boundingBox())!
  const scroll = master.locator('.mach-body-viewport--scroll')
  const initialScroll = await scroll.evaluate(element => element.scrollLeft)
  expect(
    await scroll.evaluate(element => element.scrollWidth - element.clientWidth)
  ).toBeGreaterThan(1)
  await scroll.evaluate(element => {
    element.scrollLeft = element.scrollWidth
  })
  await expect
    .poll(() => scroll.evaluate(element => element.scrollLeft))
    .toBeGreaterThan(initialScroll + 1)
  await expect
    .poll(async () => (await center.boundingBox())!.x)
    .toBeLessThan(centerBefore.x - 1)
  await expect
    .poll(async () => (await operation.boundingBox())!.x)
    .toBeCloseTo(before.x, 1)
  const remove = operation.getByRole('button', {
    name: '删除订单',
    exact: true,
  })
  await expect(remove).toBeEnabled()
  await remove.click({ trial: true })
  await scroll.evaluate(element => {
    element.scrollLeft = 0
  })
  await expect
    .poll(() => scroll.evaluate(element => element.scrollLeft))
    .toBe(0)
  await expect(page.getByTestId('remote-active-order')).toHaveText(
    'SO-20261112-001'
  )
}

/** 用表单自身标签定位，字段顺序及列数变化不影响业务含义。 */
const field = (form: Locator, label: string) =>
  form
    .locator('.n-form-item')
    .filter({
      has: form.page().locator('.n-form-item-label').filter({ hasText: label }),
    })
    .locator('input')
    .first()

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

test('远程主从连续操作：动态列与拖宽、固定操作、跨页选择和 tags 草稿恢复', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await openFromHome(page, remotePath)
  const root = page.getByTestId('remote-workbench')
  const master = root.locator('[aria-label="远程订单列表"]')
  const details = root.locator('[aria-label="远程商品明细"]')
  await expect(
    details.locator('.mach-pane--center .mach-row[data-id="RO-1-L1"]')
  ).toBeVisible()
  await expect(root).not.toHaveClass(/\S+-enter-(?:active|from|to)/)
  await page.getByLabel('明细字段方案').click()
  await page
    .locator('.n-base-select-option:visible')
    .getByText('质量追溯', { exact: true })
    .click()
  const inspection = details.locator(
    '.mach-header-cell[data-col-id="inspectionNo"]'
  )
  await expect(inspection).toContainText('第三方质量检验报告编号')
  await expect(details).toContainText('质量追溯字段')
  await expectFullHeader(inspection)
  const resized = await resizeProduct(page, details)
  await details
    .locator('.mach-row[data-id="RO-1-L1"] input[type="checkbox"]')
    .check()
  await details.locator('.mach-pagination-next').click()
  await expect(
    details.locator('.mach-pane--center .mach-row[data-id="RO-1-L5"]')
  ).toBeVisible()
  await details
    .locator('.mach-row[data-id="RO-1-L5"] input[type="checkbox"]')
    .check()
  await expect(details).toContainText('已选 2 项')
  await page
    .getByRole('textbox', { name: '订单备注', exact: true })
    .fill('复合操作保留的订单草稿')
  await expectFixedActions(page, master)
  await roundTrip(page, remotePath, root)
  await expect(details).toContainText('质量追溯字段')
  await expectFullHeader(inspection)
  await expect(details).toContainText('已选 2 项')
  await expect(
    details.locator('.mach-row[data-id="RO-1-L5"] input[type="checkbox"]')
  ).toBeChecked()
  expect((await widths(details)).product).toBeCloseTo(resized, 1)
  await expect(
    page.getByRole('textbox', { name: '订单备注', exact: true })
  ).toHaveValue('复合操作保留的订单草稿')
  await master
    .getByRole('button', { name: 'SO-20261112-003', exact: true })
    .click()
  const detail = page.locator('.remote-order-modal')
  await expect(detail).toContainText('SO-20261112-003')
  await detail.getByRole('button', { name: '关闭详情', exact: true }).click()
  await expect(detail).toBeHidden()
  await expect(page.getByTestId('remote-active-order')).toHaveText(
    'SO-20261112-001'
  )
  await page.getByRole('button', { name: '保存当前订单', exact: true }).click()
  await expect(
    root.locator('.remote-document > .ps-panel-heading')
  ).toContainText('已保存')
  await details.locator('.mach-pagination-prev').click()
  await expect(
    details.locator('.mach-row[data-id="RO-1-L1"] input[type="checkbox"]')
  ).toBeChecked()
  await info.attach('continuous-workspace.json', {
    body: JSON.stringify(
      {
        schema: 'quality',
        productWidth: resized,
        selectedRows: ['RO-1-L1', 'RO-1-L5'],
        errors,
      },
      null,
      2
    ),
    contentType: 'application/json',
  })
  await page.screenshot({
    path: info.outputPath('remote-composite-restored.png'),
  })
  expect(errors).toEqual([])
})

test('计划连续操作：弹窗校验与新增、分页选择、tags 恢复、逐行编辑和独立详情', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await openFromHome(page, planPath)
  const root = page.getByTestId('production-plan')
  const ledger = root.locator('[aria-label="排产计划台账"]')
  const modal = page.locator('.c-form-modal:visible')
  await expect(ledger).toContainText('18 项')
  await page.getByRole('button', { name: '新增计划', exact: true }).click()
  await modal.getByRole('button', { name: '保存计划', exact: true }).click()
  await expect(modal).toContainText('请填写浇次')
  await expect(ledger).toContainText('18 项')
  await field(modal, '浇次').fill('J-COMPOSITE')
  await field(modal, '断面').fill('220 × 1600')
  await field(modal, '客户').fill('连续操作验收客户')
  await field(modal, '计划量').fill('120.001')
  await field(modal, '炉数').fill('3')
  await expect(modal).not.toContainText('请填写浇次')
  await modal.getByRole('button', { name: '保存计划', exact: true }).click()
  await expect(modal).toHaveCount(0)
  await expect(ledger).toContainText('19 项')
  const checkbox = ledger.locator(
    '.mach-row[data-id="PLAN-19"] input[type="checkbox"]'
  )
  // 页面保存后主动定位新记录；先确认这一行为，再真实往返分页，不能点击已禁用的末页。
  await expect(checkbox).toBeVisible()
  await expect(ledger.locator('.mach-pagination-last')).toBeDisabled()
  await ledger.locator('.mach-pagination-first').click()
  await expect(checkbox).toHaveCount(0)
  await ledger.locator('.mach-pagination-last').click()
  await checkbox.check()
  await roundTrip(page, planPath, root)
  await expect(checkbox).toBeChecked()
  await expect(ledger).toContainText('已选 1 项')
  await ledger
    .locator('.mach-row[data-id="PLAN-19"] .mach-cell[data-col-id="op"]')
    .getByRole('button', { name: '编辑计划', exact: true })
    .click()
  await expect(field(modal, '生产计划号')).toHaveValue('PP-20261029-019')
  await field(modal, '客户').fill('保存后的独立客户')
  await modal.getByRole('button', { name: '保存', exact: true }).click()
  await expect(modal).toHaveCount(0)
  await ledger
    .getByRole('button', { name: 'PP-20261029-019', exact: true })
    .click()
  const detail = page.locator('.ps-detail-modal')
  await expect(detail).toContainText('保存后的独立客户')
  await expect(detail).toContainText('120.001')
  await expect(
    detail.locator('.mach-header-cell[data-col-id]')
  ).not.toHaveCount(0)
  await detail.getByRole('button', { name: '关闭详情', exact: true }).click()
  await expect(detail).toBeHidden()
  await expect(checkbox).toBeChecked()
  await roundTrip(page, planPath, root)
  await expect(checkbox).toBeChecked()
  await expect(ledger).toContainText('19 项')
  await page.screenshot({
    path: info.outputPath('plan-composite-restored.png'),
  })
  expect(errors).toEqual([])
})
