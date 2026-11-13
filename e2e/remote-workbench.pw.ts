/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\e2e\remote-workbench.pw.ts
 * @Description: 远程订单页的真实分页、切单、字段方案、局部恢复与末页删除
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'
import { expectFirstPagerUsable } from './d_paginationGeometry'

/** 用实际页面与正式组件验收，接口仅使用本页隔离的异步演示。 */
async function open(page: Page) {
  await page.goto('/#/production-sales/remote-workbench')
  await expect(page.getByTestId('remote-workbench')).toBeVisible({
    timeout: 15_000,
  })
  await expect(
    page.locator(
      '[aria-label="远程商品明细"] .mach-pane--center .mach-row[data-id="RO-1-L1"]'
    )
  ).toBeVisible()
}

/** 演练集中于可选弹层，不侵入正常业务操作区。 */
async function exercise(page: Page, name: string) {
  await page.getByRole('button', { name: '异常演练', exact: true }).click()
  await page.getByRole('button', { name, exact: true }).click()
  await page.getByTestId('remote-active-order').click()
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1720, height: 1100 })
})

test('左右工作区等高，右侧上下可拖动；调整尺寸保留搜索位置和草稿，窄屏堆叠', async ({
  page,
}, info) => {
  await open(page)
  const root = page.getByTestId('remote-workbench')
  const orders = root.locator('[aria-label="远程订单列表"]')
  const document = root.locator('[aria-label="当前订单草稿"]')
  const details = root.locator('[aria-label="远程商品明细"]')
  const outer = root.getByRole('separator', {
    name: '订单列表与单据协同分栏',
    exact: true,
  })
  const inner = root.getByRole('separator', {
    name: '订单主档与商品明细分栏',
    exact: true,
  })
  await expect(outer).toHaveAttribute('aria-orientation', 'vertical')
  await expect(inner).toHaveAttribute('aria-orientation', 'horizontal')
  const boxes = await Promise.all(
    [orders, document, details].map(item => item.boundingBox())
  )
  expect(Math.abs(boxes[0]!.y - boxes[1]!.y)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(boxes[0]!.y + boxes[0]!.height - boxes[2]!.y - boxes[2]!.height)
  ).toBeLessThanOrEqual(1)
  await expect(root.locator('.ps-search')).toBeInViewport({ ratio: 1 })
  await expectFirstPagerUsable(details.locator('.mach-pagination'))
  await page
    .getByRole('textbox', { name: '订单备注', exact: true })
    .fill('调整尺寸时保留此草稿')
  const searchBefore = await root.locator('.ps-search').boundingBox()
  await outer.focus()
  await outer.press('ArrowRight')
  const valueBefore = await inner.getAttribute('aria-valuenow')
  const handle = await inner.locator('.split-gutter__visual').boundingBox()
  await page.mouse.move(
    handle!.x + handle!.width / 2,
    handle!.y + handle!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    handle!.x + handle!.width / 2,
    handle!.y + handle!.height / 2 + 35,
    { steps: 4 }
  )
  await page.mouse.up()
  await expect(inner).not.toHaveAttribute('aria-valuenow', valueBefore!)
  const searchAfter = await root.locator('.ps-search').boundingBox()
  expect(Math.abs(searchBefore!.y - searchAfter!.y)).toBeLessThanOrEqual(1)
  await expect(
    page.getByRole('textbox', { name: '订单备注', exact: true })
  ).toHaveValue('调整尺寸时保留此草稿')
  await expectFirstPagerUsable(details.locator('.mach-pagination'))
  await expect(
    page.getByRole('button', { name: '保存当前订单', exact: true })
  ).toBeInViewport({ ratio: 1 })
  await page.screenshot({
    path: info.outputPath('remote-resizable-workspace.png'),
    fullPage: true,
  })
  await page.setViewportSize({ width: 980, height: 800 })
  await expect(root).toHaveClass(/remote-page--stacked/)
  await expect(outer).toHaveAttribute('aria-orientation', 'horizontal')
  await expect(
    page.getByRole('textbox', { name: '订单备注', exact: true })
  ).toHaveValue('调整尺寸时保留此草稿')
  await expect(
    details.locator('.mach-pane--center .mach-row[data-id="RO-1-L1"]')
  ).toHaveCount(1)
  expect(
    await root.evaluate(
      element => element.scrollWidth <= element.clientWidth + 1
    )
  ).toBe(true)
})

test('主从各自分页，切单清选择回首页；草稿先确认，编号只打开详情', async ({
  page,
}, info) => {
  await open(page)
  const master = page.locator('[aria-label="远程订单列表"]')
  const details = page.locator('[aria-label="远程商品明细"]')
  await details.locator('.mach-pagination-next').click()
  await expect(
    details.locator('.mach-pane--center .mach-row[data-id="RO-1-L5"]')
  ).toBeVisible()
  await details
    .locator('.mach-row[data-id="RO-1-L5"] input[type="checkbox"]')
    .check()
  await expect(details).toContainText('已选 1 项')
  await page
    .getByRole('textbox', { name: '订单备注', exact: true })
    .fill('等待交付确认，先保留草稿')
  await master
    .locator('.mach-row[data-id="RO-2"] .mach-cell[data-col-id="customer"]')
    .click()
  await expect(page.locator('.n-dialog')).toContainText('有未保存修改')
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '继续编辑', exact: true })
    .click()
  await expect(page.getByTestId('remote-active-order')).toHaveText(
    'SO-20261112-001'
  )
  await expect(
    page.getByRole('textbox', { name: '订单备注', exact: true })
  ).toHaveValue('等待交付确认，先保留草稿')
  await master
    .locator('.mach-row[data-id="RO-2"] .mach-cell[data-col-id="customer"]')
    .click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '放弃并切换', exact: true })
    .click()
  await expect(
    details.locator('.mach-pane--center .mach-row[data-id="RO-2-L1"]')
  ).toBeVisible()
  await expect(details).toContainText('已选 0 项')
  await expect(details.locator('.mach-pagination-prev')).toBeDisabled()
  await expect(master.locator('.mach-pagination-prev')).toBeDisabled()
  await master
    .getByRole('button', { name: 'SO-20261112-003', exact: true })
    .click()
  await expect(page.locator('.remote-order-modal')).toContainText(
    'SO-20261112-003'
  )
  await expect(page.getByTestId('remote-active-order')).toHaveText(
    'SO-20261112-002'
  )
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
  await expect(page.locator('.remote-order-modal')).toBeHidden()
  await page.screenshot({
    path: info.outputPath('remote-orders.png'),
    fullPage: true,
  })
})

test('旧明细回包不能串单；动态长表头完整，空结果仍保留新字段方案', async ({
  page,
}) => {
  await open(page)
  const master = page.locator('[aria-label="远程订单列表"]')
  const details = page.locator('[aria-label="远程商品明细"]')
  await exercise(page, '慢速明细后切换订单')
  await master
    .locator('.mach-row[data-id="RO-2"] .mach-cell[data-col-id="customer"]')
    .click()
  await expect(
    details.locator('.mach-pane--center .mach-row[data-id="RO-2-L1"]')
  ).toBeVisible()
  // 明确跨过演练接口的旧请求 1400ms，验证迟到回包不能覆盖已接受的新单据。
  await page.waitForTimeout(1500)
  await expect(
    details.locator('.mach-pane--center .mach-row[data-id="RO-1-L1"]')
  ).toHaveCount(0)
  await page.getByLabel('明细字段方案').click()
  await page
    .locator('.n-base-select-option')
    .filter({ hasText: '质量追溯' })
    .click()
  const header = details.locator(
    '.mach-header-cell[data-col-id="inspectionNo"]'
  )
  await expect(header).toContainText('第三方质量检验报告编号')
  expect(
    await header.evaluate(
      element => element.scrollWidth <= element.clientWidth + 1
    )
  ).toBe(true)
  await exercise(page, '返回空明细')
  await expect(details.locator('.mach-row[data-id]')).toHaveCount(0)
  const empty = details.locator('.mach-empty')
  await expect(empty).toBeVisible()
  await expect(empty.locator('svg')).toBeVisible()
  expect(
    await empty
      .locator('svg')
      .evaluate(element => getComputedStyle(element).stroke)
  ).not.toBe('none')
  await expect(empty).toContainText('没有可显示的行')
  await expect(details).toContainText('质量追溯字段')
  await expect(header).toContainText('第三方质量检验报告编号')
  await expect(
    details.getByRole('button', { name: '刷新明细', exact: true })
  ).toBeEnabled()
})

test('明细失败和字典失败局部可重试，不污染另一表，零值和 false 仍正常显示', async ({
  page,
}) => {
  await open(page)
  const master = page.locator('[aria-label="远程订单列表"]')
  const details = page.locator('[aria-label="远程商品明细"]')
  await expect(
    details.locator(
      '.mach-pane--center .mach-row[data-id="RO-1-L1"] .mach-cell[data-col-id="quantity"]'
    )
  ).toHaveText('0.000')
  await expect(
    details.locator(
      '.mach-pane--center .mach-row[data-id="RO-1-L1"] .mach-cell[data-col-id="urgent"]'
    )
  ).toHaveText('普通交付')
  await exercise(page, '明细查询失败一次')
  await expect(
    details.getByRole('button', { name: '重试明细', exact: true })
  ).toBeVisible()
  await expect(
    master.locator('.mach-pane--center .mach-row[data-id="RO-1"]')
  ).toBeVisible()
  await details.getByRole('button', { name: '重试明细', exact: true }).click()
  await expect(
    details.getByRole('button', { name: '刷新明细', exact: true })
  ).toBeEnabled()
  await exercise(page, '状态字典失败一次')
  await expect(
    page.getByRole('button', { name: '重载字典', exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: '重载字典', exact: true }).click()
  await expect(
    page.getByRole('button', { name: '重载字典', exact: true })
  ).toHaveCount(0)
  await expect(page.locator('.remote-dictionary')).toHaveCount(0)
  await expect(
    master.locator(
      '.mach-pane--center .mach-row[data-id="RO-1"] .mach-cell[data-col-id="status"]'
    )
  ).toHaveText('待下达')
})

test('删除最后一页仅有的待下达订单，取消不变更，确认后由 query 回到有效页', async ({
  page,
}) => {
  await open(page)
  const master = page.locator('[aria-label="远程订单列表"]')
  await master.locator('.mach-pagination-last').click()
  const row = master.locator('.mach-pane--center .mach-row[data-id="RO-13"]')
  const remove = master
    .locator(
      '.mach-pane--right .mach-row[data-id="RO-13"] .mach-cell[data-col-id="op"]'
    )
    .getByRole('button', { name: '删除订单', exact: true })
  await expect(row).toBeVisible()
  await remove.click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '取消', exact: true })
    .click()
  await expect(row).toBeVisible()
  await remove.click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '确认删除', exact: true })
    .click()
  await expect(
    master.locator('.mach-pane--center .mach-row[data-id="RO-7"]')
  ).toBeVisible()
  await expect(master.locator('.mach-row[data-id="RO-13"]')).toHaveCount(0)
  await expect(master.locator('.mach-pagination-total')).toContainText('12')
  await expect(master.locator('.mach-pagination-next')).toBeDisabled()
  await expect(master.locator('.mach-pagination-prev')).toBeEnabled()
})
