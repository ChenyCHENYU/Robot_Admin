/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-30
 * @FilePath: \Robot_Admin\e2e\production-sales-row-actions.pw.ts
 * @Description: 序号、逐行操作、独立详情快照和未保存切单保护
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page, type Locator } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const open = async (page: Page, path: string, root: string) => {
  await page.goto(`/#/production-sales/${path}`)
  await expect(page.getByTestId(root)).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
}
const field = (scope: Locator, label: string) =>
  scope
    .locator('.n-form-item')
    .filter({
      has: scope
        .page()
        .locator('.n-form-item-label')
        .filter({ hasText: label }),
    })
    .locator('input')
    .first()
const modal = (page: Page) => page.locator('.c-form-modal:visible')
const action = (scope: Locator, id: string, name: string) =>
  scope
    .locator(`.mach-row[data-id="${id}"] .mach-cell[data-col-id="op"]`)
    .getByRole('button', { name, exact: true })

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1720, height: 1200 })
})

test('计划序号和行操作：无需预选，编辑删除对应点击行，详情不切换当前计划', async ({
  page,
}, info) => {
  await open(page, 'production-plan', 'production-plan')
  const table = page.locator('[aria-label="排产计划台账"]')
  await expect(
    table.locator('.mach-header-cell[data-col-id="idx"]')
  ).toContainText('序号')
  await expect(
    table.locator('.mach-row[data-id="PLAN-1"] .mach-cell[data-col-id="idx"]')
  ).toHaveText('1')
  await expect(
    table
      .locator('.ps-toolbar')
      .getByRole('button', { name: /编辑|删除|详情|复制/ })
  ).toHaveCount(0)
  await action(table, 'PLAN-5', '编辑计划').click()
  await expect(field(modal(page), '生产计划号')).toHaveValue('PP-20261029-005')
  await field(modal(page), '客户').fill('第 5 行客户')
  await modal(page).getByRole('button', { name: '保存', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'PP-20261029-001 · 计划协同' })
  ).toBeVisible()
  await action(table, 'PLAN-1', '编辑计划').click()
  await expect(field(modal(page), '客户')).toHaveValue('华东建设')
  await modal(page).getByRole('button', { name: '取消', exact: true }).click()
  await table
    .getByRole('button', { name: 'PP-20261029-002', exact: true })
    .click()
  await expect(page.locator('.ps-detail-modal')).toContainText(
    'PP-20261029-002'
  )
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
  await expect(action(table, 'PLAN-2', '编辑计划')).toBeDisabled()
  await action(table, 'PLAN-6', '删除计划').click()
  await expect(page.locator('.n-dialog')).toContainText('PP-20261029-006')
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '确认删除', exact: true })
    .click()
  await expect(table).toContainText('17 项')
  await expect(
    page.getByRole('heading', { name: 'PP-20261029-001 · 计划协同' })
  ).toBeVisible()
  await expect
    .poll(() =>
      table.locator('.mach-row[data-id="PLAN-1"]').evaluateAll(rows => {
        const tops = rows.map(row => row.getBoundingClientRect().top)
        return tops.length === 3
          ? Math.max(...tops) - Math.min(...tops)
          : Infinity
      })
    )
    .toBeLessThanOrEqual(1)
  await table.screenshot({ path: info.outputPath('plan-row-actions.png') })
})

test('销售订单和明细：蓝色编号只读查看，行编辑删除无需勾选且保留其他行', async ({
  page,
}, info) => {
  await open(page, 'sales-orders', 'business-workbench')
  const table = page.locator('.workbench-master-grid')
  const lines = page.getByTestId('line-panel')
  await expect(
    table.locator('.mach-header-cell[data-col-id="idx"]')
  ).toContainText('序号')
  await expect(
    lines.locator('.mach-header-cell[data-col-id="idx"]')
  ).toContainText('序号')
  await expect(
    page
      .locator('.workbench-detail-actions')
      .getByRole('button', { name: '编辑订单', exact: true })
  ).toHaveCount(0)
  const note = field(page.locator('.workbench-header'), '订单备注')
  await note.fill('保留当前订单草稿')
  await table
    .getByRole('button', { name: '查看SO-2026-002详情', exact: true })
    .click()
  await expect(page.locator('.ps-detail-modal')).toContainText('SO-2026-002')
  await expect(page.locator('.ps-detail-modal .n-alert')).toHaveCount(0)
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-001')
  await expect(note).toHaveValue('保留当前订单草稿')
  await expect(action(table, 'ORDER-2', '编辑订单')).toBeDisabled()
  await action(lines, 'ORDER-1-L02', '编辑明细').click()
  await expect(field(modal(page), '数量')).toHaveValue('12.125')
  await field(modal(page), '数量').fill('1.005')
  await modal(page).getByRole('button', { name: '保存', exact: true }).click()
  await expect(
    lines.locator(
      '.mach-row[data-id="ORDER-1-L02"] .mach-cell[data-col-id="quantity"]'
    )
  ).toHaveText('1.005')
  await lines.getByRole('button', { name: 'ORDER-1-L02', exact: true }).click()
  await expect(page.locator('.ps-detail-modal')).toContainText('商品明细详情')
  await expect(page.locator('.ps-detail-modal')).toContainText('1.005')
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
  await action(lines, 'ORDER-1-L02', '删除明细').click()
  await expect(page.locator('.n-dialog')).toContainText('ORDER-1-L02')
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '删除明细', exact: true })
    .click()
  await expect(lines.locator('.mach-row[data-id="ORDER-1-L02"]')).toHaveCount(0)
  await expect(
    lines.locator(
      '.mach-row[data-id="ORDER-1-L01"] .mach-cell[data-col-id="quantity"]'
    )
  ).toHaveText('0.000')
  await lines.screenshot({ path: info.outputPath('sales-line-actions.png') })
})

test('发运原生表格：序号与行操作固定，详情保留车辆草稿，编辑删除绑定目标行', async ({
  page,
}, info) => {
  await open(page, 'shipping', 'shipping-workbench')
  const table = page.locator('.shipping-queue')
  const row = (id: string) => table.locator(`tr[data-shipment-id="${id}"]`)
  await expect(
    table.getByRole('columnheader', { name: '序号', exact: true })
  ).toBeVisible()
  await expect(row('SHIP-1').locator('td').first()).toHaveText('1')
  await expect(
    table.locator('.ps-toolbar').getByRole('button', { name: /编辑|删除|详情/ })
  ).toHaveCount(0)
  await row('SHIP-2').getByRole('button', { name: '编辑', exact: true }).click()
  await expect(field(modal(page), '发运单号')).toHaveValue('DN-261029-002')
  await field(modal(page), '计划量').fill('33001')
  await modal(page).getByRole('button', { name: '保存', exact: true }).click()
  await expect(page.locator('.shipping-current')).toContainText('DN-261029-002')
  await row('SHIP-1').getByRole('button', { name: '编辑', exact: true }).click()
  await expect(field(modal(page), '计划量')).toHaveValue('22800')
  await modal(page).getByRole('button', { name: '取消', exact: true }).click()
  const driver = field(page.locator('.shipping-vehicle'), '驾驶员')
  await driver.fill('尚未保存的驾驶员')
  await row('SHIP-1')
    .getByRole('button', { name: 'DN-261029-001', exact: true })
    .click()
  await expect(page.locator('.ps-detail-modal')).toContainText('DN-261029-001')
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
  await expect(driver).toHaveValue('尚未保存的驾驶员')
  await expect(page.locator('.shipping-current')).toContainText('DN-261029-002')
  await page.getByRole('button', { name: '恢复车辆', exact: true }).click()
  await row('SHIP-3').getByRole('button', { name: '删除', exact: true }).click()
  await expect(page.locator('.n-dialog')).toContainText('DN-261029-003')
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '确认删除', exact: true })
    .click()
  await expect(row('SHIP-3')).toHaveCount(0)
  await expect(page.locator('.shipping-current')).toContainText('DN-261029-002')
  await row('SHIP-1').focus()
  await row('SHIP-1').press('Enter')
  await expect(page.locator('.shipping-current')).toContainText('DN-261029-001')
  await table.screenshot({ path: info.outputPath('shipping-row-actions.png') })
})

test('跨行编辑保留切单保护，取消不遗留动作，放弃后继续编辑目标行', async ({
  page,
}) => {
  await open(page, 'sales-orders', 'business-workbench')
  const table = page.locator('.workbench-master-grid')
  await expect(action(table, 'ORDER-1', '复制订单')).toBeEnabled()
  await action(table, 'ORDER-1', '复制订单').click()
  await modal(page)
    .getByRole('button', { name: '建立订单', exact: true })
    .click()
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-019')
  await expect(
    page
      .getByTestId('line-panel')
      .locator(
        '.mach-row[data-id="ORDER-19-L01"] .mach-cell[data-col-id="quantity"]'
      )
  ).toHaveText('0.000')
  const note = field(page.locator('.workbench-header'), '订单备注')
  await note.fill('第 19 笔尚未保存')
  await table.locator('.mach-body-viewport--scroll').evaluate(element => {
    element.scrollTop = 0
  })
  await action(table, 'ORDER-1', '编辑订单').click()
  await expect(page.locator('.workbench-switch-dialog')).toBeVisible()
  await page.getByRole('button', { name: '取消切换', exact: true }).click()
  await expect(modal(page)).toHaveCount(0)
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-019')
  await expect(note).toHaveValue('第 19 笔尚未保存')
  await action(table, 'ORDER-1', '编辑订单').click()
  await page.getByRole('button', { name: '放弃并切换', exact: true }).click()
  await expect(modal(page)).toBeVisible()
  await expect(field(modal(page), '订单编号')).toHaveValue('SO-2026-001')
  await modal(page).getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-001')
})
