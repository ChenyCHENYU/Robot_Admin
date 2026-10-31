/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\e2e\production-sales-actions.pw.ts
 * @Description: 真实操作栏、表单弹窗、确认取消、状态锁定与详情弹窗回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect, type Page, type Locator } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 表单用实际标签定位，避免字段顺序影响业务回归。 */
const field = (container: Locator, label: string) =>
  container.locator('.n-form-item').filter({
    has: container
      .page()
      .locator('.n-form-item-label')
      .filter({ hasText: label }),
  })
/** 每个动作绑定可见业务行，禁止依赖上一次选中项。 */
const rowAction = (scope: Locator, id: string, name: string) =>
  scope
    .locator(`.mach-row[data-id="${id}"] .mach-cell[data-col-id="op"]`)
    .getByRole('button', { name, exact: true })
const shipmentRow = (page: Page, id: string) =>
  page.locator(`.shipping-queue tr[data-shipment-id="${id}"]`)
const modal = (page: Page) => page.locator('.c-form-modal:visible')
const dialog = (page: Page) => page.locator('.n-dialog:visible')
/** 首次加载完成后才操作，后续交互保持默认断言时限。 */
const open = async (page: Page, path: string, root: string) => {
  await page.goto(`/#/production-sales/${path}`)
  await expect(page.getByTestId(root)).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
}
const choose = async (page: Page, control: Locator, label: string) => {
  await control.click()
  await page
    .locator('.n-base-select-option:visible')
    .getByText(label, { exact: true })
    .click()
}

/** 测量实际控件与弹窗壳的距离，避免仅检查紧凑类名却遗漏贴边或遮挡。 */
const expectCompactModalGeometry = async (
  scope: Locator,
  columns: 1 | 2
): Promise<void> => {
  await expect(scope.locator('.c-form')).toHaveClass(/c-form--compact/)
  await expect(scope).toHaveAccessibleName(
    (await scope.locator('.n-card-header__main').textContent())!.trim()
  )
  await expect(scope).toHaveCSS('transform', 'none')
  await expect
    .poll(
      async () => {
        const geometry = await scope.evaluate(element => {
          const bounds = element.getBoundingClientRect()
          const headerElement = element.querySelector('.n-card-header')!
          const header = headerElement.getBoundingClientRect()
          const footer = element
            .querySelector('.c-form-modal__footer')!
            .getBoundingClientRect()
          const form = element.querySelector('.c-form')!.getBoundingClientRect()
          const fields = Array.from(
            element.querySelectorAll('.c-form .c-form-field')
          ).map(item => ({
            item: item.getBoundingClientRect(),
            control: item
              .querySelector('.n-form-item-blank')!
              .getBoundingClientRect(),
          }))
          const firstTop = Math.min(...fields.map(field => field.item.top))
          const firstRow = fields.filter(
            field => Math.abs(field.item.top - firstTop) <= 1
          )
          const controlTops = firstRow.map(field => field.control.top)
          const controlWidths = firstRow.map(field => field.control.width)
          return {
            headerHeight: header.height,
            headerInset: parseFloat(
              getComputedStyle(headerElement).paddingLeft
            ),
            topGap: Math.min(...controlTops) - header.bottom,
            leftInset: form.left - bounds.left,
            rightInset: bounds.right - form.right,
            bottomGap:
              footer.top -
              Math.max(...fields.map(field => field.control.bottom)),
            firstRowCount: firstRow.length,
            rowTopDifference:
              Math.max(...controlTops) - Math.min(...controlTops),
            rowWidthDifference:
              Math.max(...controlWidths) - Math.min(...controlWidths),
            insideViewport:
              bounds.left >= 0 &&
              bounds.top >= 0 &&
              bounds.right <= innerWidth + 1 &&
              bounds.bottom <= innerHeight + 1,
            horizontalOverflow: element.scrollWidth - element.clientWidth,
          }
        })
        return Object.entries({
          标题高度适中:
            geometry.headerHeight >= 36 && geometry.headerHeight <= 48,
          首行与标题保持小间距: geometry.topGap >= 8 && geometry.topGap <= 18,
          左右留白紧凑对称:
            geometry.leftInset >= 8 &&
            geometry.leftInset <= 24 &&
            geometry.rightInset >= 8 &&
            geometry.rightInset <= 24 &&
            Math.abs(geometry.leftInset - geometry.rightInset) <= 2,
          标题与内容留白一致:
            Math.abs(geometry.headerInset - geometry.leftInset) <= 2,
          末行与操作区保持间距:
            geometry.bottomGap >= 6 && geometry.bottomGap <= 24,
          响应式列数正确: geometry.firstRowCount === columns,
          同排控件对齐:
            geometry.rowTopDifference <= 2 && geometry.rowWidthDifference <= 2,
          弹窗完整落在视口内: geometry.insideViewport,
          弹窗没有横向溢出: geometry.horizontalOverflow <= 1,
        })
          .filter(([, passed]) => !passed)
          .map(([label]) => label)
      },
      { message: '公共紧凑表单弹窗应保持合理间距、对齐和视口边界' }
    )
    .toEqual([])
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1720, height: 1280 })
})

for (const item of [
  { path: 'production-plan', root: 'production-plan', action: '新增计划' },
  { path: 'production-actual', root: 'production-actual', action: '实绩复核' },
  { path: 'sales-orders', root: 'business-workbench', action: '新增订单' },
  { path: 'shipping', root: 'shipping-workbench', action: '新增发运任务' },
]) {
  for (const width of [390, 540]) {
    test(`暗色 ${width}px ${item.action}：弹窗保留紧凑主题并完整落在视口内`, async ({
      page,
    }, info) => {
      await page.addInitScript(() => localStorage.setItem('theme-mode', 'dark'))
      await page.setViewportSize({ width, height: 1100 })
      await open(page, item.path, item.root)
      const action = page.getByRole('button', {
        name: item.action,
        exact: true,
      })
      await expect(action).toBeEnabled()
      await action.click()
      await expect(modal(page)).toBeVisible()
      await expectCompactModalGeometry(modal(page), 1)
      await modal(page).screenshot({
        path: info.outputPath(`${item.path}-${width}-dark-narrow-modal.png`),
        animations: 'disabled',
      })
      await modal(page)
        .getByRole('button', { name: '取消', exact: true })
        .click()
      await expect(modal(page)).toHaveCount(0)
    })
  }
}

test('计划编制弹窗真实增改复制，确认取消和状态约束保持台账一致', async ({
  page,
}, info) => {
  await open(page, 'production-plan', 'production-plan')
  const table = page.locator('[aria-label="排产计划台账"]')
  await page.getByRole('button', { name: '新增计划', exact: true }).click()
  await expectCompactModalGeometry(modal(page), 2)
  await modal(page)
    .getByRole('button', { name: '保存计划', exact: true })
    .click()
  await expect(modal(page)).toContainText('请填写浇次')
  await expect(table).toContainText('18 项')
  await field(modal(page), '浇次').locator('input').fill('J2000')
  await field(modal(page), '断面').locator('input').fill('220 × 1600')
  await field(modal(page), '客户').locator('input').fill('华东新材')
  await field(modal(page), '计划量').locator('input').fill('120.001')
  await field(modal(page), '炉数').locator('input').fill('3')
  await expect(modal(page)).not.toContainText('请填写浇次')
  await expect(modal(page)).not.toContainText('计划量必须大于零')
  await modal(page).screenshot({
    path: info.outputPath('plan-create-modal.png'),
    animations: 'disabled',
  })
  await modal(page)
    .getByRole('button', { name: '保存计划', exact: true })
    .click()
  await expect(modal(page)).toHaveCount(0)
  await expect(table).toContainText('19 项')
  const detail = page.locator('[aria-label="计划协同详情"]')
  await expect(detail).toContainText('PP-20261029-019')
  await rowAction(table, 'PLAN-19', '编辑计划').click()
  await field(modal(page), '客户').locator('input').fill('取消的修改')
  await modal(page).getByRole('button', { name: '取消', exact: true }).click()
  await rowAction(table, 'PLAN-19', '编辑计划').click()
  await expect(field(modal(page), '客户').locator('input')).toHaveValue(
    '华东新材'
  )
  await field(modal(page), '客户').locator('input').fill('华东新材二厂')
  await modal(page).getByRole('button', { name: '保存', exact: true }).click()
  await expect(modal(page)).toHaveCount(0)
  await rowAction(table, 'PLAN-19', '复制编制').click()
  await expect(modal(page)).toHaveCount(0)
  await expect(dialog(page)).toContainText('复制生产计划')
  await expect(dialog(page)).toContainText('PP-20261029-019')
  await dialog(page).getByRole('button', { name: '取消', exact: true }).click()
  await expect(dialog(page)).toHaveCount(0)
  await expect(table).toContainText('19 项')
  await expect(detail).toContainText('PP-20261029-019')
  await rowAction(table, 'PLAN-19', '复制编制').click()
  await expect(modal(page)).toHaveCount(0)
  await expect(dialog(page)).toContainText('复制生产计划')
  await dialog(page).screenshot({
    path: info.outputPath('plan-copy-confirmation.png'),
    animations: 'disabled',
  })
  await dialog(page)
    .getByRole('button', { name: '确认复制', exact: true })
    .click()
  await expect(dialog(page)).toHaveCount(0)
  await expect(modal(page)).toHaveCount(0)
  await expect(table).toContainText('20 项')
  await expect(detail).toContainText('PP-20261029-020')
  await expect(rowAction(table, 'PLAN-20', '编辑计划')).toBeEnabled()
  await rowAction(table, 'PLAN-20', '编辑计划').click()
  await expect(field(modal(page), '生产计划号').locator('input')).toHaveValue(
    'PP-20261029-020'
  )
  await expect(field(modal(page), '客户').locator('input')).toHaveValue(
    '华东新材二厂'
  )
  await field(modal(page), '客户').locator('input').fill('副本独立客户')
  await modal(page).getByRole('button', { name: '保存', exact: true }).click()
  await rowAction(table, 'PLAN-19', '编辑计划').click()
  await expect(field(modal(page), '生产计划号').locator('input')).toHaveValue(
    'PP-20261029-019'
  )
  await expect(field(modal(page), '客户').locator('input')).toHaveValue(
    '华东新材二厂'
  )
  await modal(page).getByRole('button', { name: '取消', exact: true }).click()
  await rowAction(table, 'PLAN-20', '删除计划').click()
  await dialog(page).getByRole('button', { name: '取消', exact: true }).click()
  await expect(table).toContainText('20 项')
  await rowAction(table, 'PLAN-20', '删除计划').click()
  await dialog(page)
    .getByRole('button', { name: '确认删除', exact: true })
    .click()
  await expect(table).toContainText('19 项')
  await table.locator('.mach-body-viewport--scroll').evaluate(element => {
    element.scrollTop = 0
  })
  await table.locator('.mach-row[data-id="PLAN-1"] .mach-row-checkbox').check()
  await page.getByRole('button', { name: '下达选中计划', exact: true }).click()
  await dialog(page).getByRole('button', { name: '取消', exact: true }).click()
  await expect(rowAction(table, 'PLAN-1', '编辑计划')).toBeEnabled()
  await page.getByRole('button', { name: '下达选中计划', exact: true }).click()
  await dialog(page)
    .getByRole('button', { name: '确认下达', exact: true })
    .click()
  await expect(rowAction(table, 'PLAN-1', '编辑计划')).toBeDisabled()
  await page.getByRole('button', { name: '撤销下达', exact: true }).click()
  await dialog(page)
    .getByRole('button', { name: '确认撤销', exact: true })
    .click()
  await expect(rowAction(table, 'PLAN-1', '编辑计划')).toBeEnabled()
  await table
    .getByRole('button', { name: 'PP-20261029-001', exact: true })
    .click()
  await expect(page.locator('.ps-detail-modal')).toContainText(
    'PP-20261029-001'
  )
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
})

test('订单与明细弹窗连接整单草稿，精确金额、详情只读和复制身份独立', async ({
  page,
}, info) => {
  await open(page, 'sales-orders', 'business-workbench')
  await expect(page.locator('.workbench-detail-grid')).toContainText(
    '零数量样例'
  )
  await page.getByRole('button', { name: '新增订单', exact: true }).click()
  await modal(page)
    .getByRole('button', { name: '建立订单', exact: true })
    .click()
  await expect(modal(page)).toContainText('请选择客户')
  await choose(
    page,
    field(modal(page), '订货客户').locator('.n-select'),
    '云帆智造'
  )
  await field(modal(page), '合同编号').locator('input').fill('HT-TEST-019')
  await field(modal(page), '规格').locator('input').fill('8 × 1500 × 6000')
  await expect(modal(page)).not.toContainText('请选择客户')
  await modal(page).screenshot({
    path: info.outputPath('sales-create-modal.png'),
    animations: 'disabled',
  })
  await modal(page)
    .getByRole('button', { name: '建立订单', exact: true })
    .click()
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-019')
  await expect(
    page.getByTestId('line-panel').locator('.mach-empty')
  ).toBeVisible()
  await page.getByRole('button', { name: '新增明细', exact: true }).click()
  await field(modal(page), '商品名称').locator('input').fill('新增精整卷')
  await field(modal(page), '数量').locator('input').fill('0')
  await field(modal(page), '金额').locator('input').fill('1.005')
  await modal(page)
    .getByRole('button', { name: '加入明细', exact: true })
    .click()
  const line = page.getByTestId('line-panel')
  await expect(
    line.locator('.mach-cell[data-col-id="amount"]').first()
  ).toHaveText('1.01')
  await expect(
    line.locator('.mach-cell[data-col-id="quantity"]').first()
  ).toHaveText('0.000')
  await expect(page.getByTestId('draft-status')).toHaveText('有未保存修改')
  await line.locator('.mach-row-checkbox').first().check()
  await rowAction(line, 'ORDER-19-LINE-1', '编辑明细').click()
  await expect(field(modal(page), '金额').locator('input')).toHaveValue('1.005')
  await field(modal(page), '金额').locator('input').fill('2.005')
  await modal(page).getByRole('button', { name: '保存', exact: true }).click()
  await page.getByRole('button', { name: '保存整单', exact: true }).click()
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
  await rowAction(
    page.locator('.workbench-master-grid'),
    'ORDER-19',
    '编辑订单'
  ).click()
  await field(modal(page), '业务人员').locator('input').fill('新经办')
  await modal(page).getByRole('button', { name: '保存', exact: true }).click()
  await expect(page.getByTestId('draft-status')).toHaveText('有未保存修改')
  await page.getByRole('button', { name: '保存整单', exact: true }).click()
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
  await page
    .getByRole('button', { name: '查看SO-2026-019详情', exact: true })
    .click()
  const detail = page.locator('.ps-detail-modal')
  await expect(detail).toContainText('新经办')
  await detail
    .locator('.mach-row[data-id] .mach-cell[data-col-id="quantity"]')
    .dblclick()
  await expect(detail.locator('.mach-editor-input')).toHaveCount(0)
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
  await rowAction(
    page.locator('.workbench-master-grid'),
    'ORDER-19',
    '复制订单'
  ).click()
  await expect(modal(page)).toHaveCount(0)
  await expect(dialog(page)).toContainText('复制销售订单')
  await expect(dialog(page)).toContainText('SO-2026-019')
  await dialog(page).getByRole('button', { name: '取消', exact: true }).click()
  await expect(dialog(page)).toHaveCount(0)
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-019')
  await expect(
    page.getByRole('button', { name: '查看SO-2026-020详情', exact: true })
  ).toHaveCount(0)
  await rowAction(
    page.locator('.workbench-master-grid'),
    'ORDER-19',
    '复制订单'
  ).click()
  await expect(modal(page)).toHaveCount(0)
  await dialog(page).screenshot({
    path: info.outputPath('sales-copy-confirmation.png'),
    animations: 'disabled',
  })
  await dialog(page)
    .getByRole('button', { name: '确认复制', exact: true })
    .click()
  await expect(dialog(page)).toHaveCount(0)
  await expect(modal(page)).toHaveCount(0)
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-020')
  await expect(
    line.locator('.mach-cell[data-col-id="amount"]').first()
  ).toHaveText('2.01')
  await expect(
    line.locator('.mach-cell[data-col-id="quantity"]').first()
  ).toHaveText('0.000')
  await expect(
    line.locator('.mach-pane--center .mach-row[data-id="ORDER-20-L01"]')
  ).toHaveCount(1)
  await rowAction(
    page.locator('.workbench-master-grid'),
    'ORDER-20',
    '编辑订单'
  ).click()
  await expect(field(modal(page), '订单编号').locator('input')).toHaveValue(
    'SO-2026-020'
  )
  await expect(field(modal(page), '业务人员').locator('input')).toHaveValue(
    '新经办'
  )
  await modal(page).getByRole('button', { name: '取消', exact: true }).click()
  await page
    .getByRole('button', { name: '查看SO-2026-019详情', exact: true })
    .click()
  await expect(detail).toContainText('SO-2026-019')
  await expect(detail).toContainText('新经办')
  await expect(
    detail.locator('.mach-pane--center .mach-row[data-id="ORDER-19-LINE-1"]')
  ).toHaveCount(1)
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-020')
  await line.locator('.mach-row-checkbox').first().check()
  await page.getByRole('button', { name: '删除选中明细', exact: true }).click()
  await dialog(page).getByRole('button', { name: '取消', exact: true }).click()
  await expect(
    line.locator('.mach-cell[data-col-id="amount"]').first()
  ).toHaveText('2.01')
  await page.getByRole('button', { name: '删除选中明细', exact: true }).click()
  await dialog(page)
    .getByRole('button', { name: '删除明细', exact: true })
    .click()
  await expect(line.locator('.mach-row[data-id]')).toHaveCount(0)
  await expect(page.getByTestId('draft-status')).toHaveText('有未保存修改')
})

test('实绩退回、复核锁定和撤回形成闭环，历史意见按文本展示且参考不写当前值', async ({
  page,
}, info) => {
  await open(page, 'production-actual', 'production-actual')
  const carbon = field(
    page.locator('[data-section="chemistry"]'),
    '碳 C'
  ).locator('input')
  await carbon.fill('0.6')
  await carbon.press('Tab')
  await page.getByRole('button', { name: '实绩复核', exact: true }).click()
  await expect(page.locator('.ps-status-line')).toContainText('请先保存')
  await page.getByRole('button', { name: '保存实绩', exact: true }).click()
  await page.getByRole('button', { name: '实绩复核', exact: true }).click()
  await modal(page)
    .getByRole('button', { name: '提交复核', exact: true })
    .click()
  await expect(modal(page)).toContainText('请填写复核意见')
  await choose(
    page,
    field(modal(page), '复核结论').locator('.n-select'),
    '退回补录'
  )
  await field(modal(page), '复核意见')
    .locator('textarea')
    .fill('请补充实验室处置说明')
  await modal(page)
    .getByRole('button', { name: '提交复核', exact: true })
    .click()
  await expect(page.locator('.actual-heat-list .is-active')).toContainText(
    '退回补录'
  )
  await expect(carbon).toBeEnabled()
  await page.getByRole('button', { name: '实绩复核', exact: true }).click()
  await field(modal(page), '复核意见')
    .locator('textarea')
    .fill('<b>实验室复核可放行</b>')
  await modal(page).screenshot({
    path: info.outputPath('actual-review-modal.png'),
    animations: 'disabled',
  })
  await modal(page)
    .getByRole('button', { name: '提交复核', exact: true })
    .click()
  await expect(carbon).toBeDisabled()
  await expect(
    page.getByRole('button', { name: '保存实绩', exact: true })
  ).toBeDisabled()
  await page.getByRole('button', { name: '复核记录', exact: true }).click()
  await expect(page.locator('.ps-detail-modal')).toContainText(
    '<b>实验室复核可放行</b>'
  )
  await expect(page.locator('.ps-detail-modal b')).toHaveCount(0)
  await expect(page.locator('.ps-detail-modal')).toContainText('实绩退回补录')
  await page.locator('.ps-detail-modal').screenshot({
    path: info.outputPath('actual-review-history.png'),
    animations: 'disabled',
  })
  await page.getByRole('button', { name: '关闭记录', exact: true }).click()
  await page.getByRole('button', { name: '撤回复核', exact: true }).click()
  await dialog(page)
    .getByRole('button', { name: '确认撤回', exact: true })
    .click()
  await expect(carbon).toBeEnabled()
  await page
    .locator('.actual-heat-list button')
    .filter({ hasText: 'L261029102' })
    .click()
  await page.getByRole('button', { name: '上一炉参考', exact: true }).click()
  await expect(page.locator('.actual-reference-grid')).toContainText('0.6')
  await page.getByRole('button', { name: '关闭参考', exact: true }).click()
  await expect(carbon).toHaveValue('0.180')
})

test('发运编制与配载连接，取消不改计划，装车后锁定且出厂需要确认', async ({
  page,
}, info) => {
  await open(page, 'shipping', 'shipping-workbench')
  await page.getByRole('button', { name: '新增发运任务', exact: true }).click()
  await field(modal(page), '客户').locator('input').fill('华东港务')
  await field(modal(page), '计划量').locator('input').fill('25001')
  await modal(page).screenshot({
    path: info.outputPath('shipping-create-modal.png'),
    animations: 'disabled',
  })
  await modal(page)
    .getByRole('button', { name: '建立任务', exact: true })
    .click()
  await expect(page.locator('.shipping-current')).toContainText('DN-261029-013')
  await expect(page.locator('.shipping-current')).toContainText('25.001')
  await shipmentRow(page, 'SHIP-13')
    .getByRole('button', { name: '编辑', exact: true })
    .click()
  await field(modal(page), '计划量').locator('input').fill('24000')
  await modal(page).getByRole('button', { name: '取消', exact: true }).click()
  await expect(page.locator('.shipping-current')).toContainText('25.001')
  await shipmentRow(page, 'SHIP-13')
    .getByRole('button', { name: '编辑', exact: true })
    .click()
  await field(modal(page), '计划量').locator('input').fill('25002')
  await modal(page).getByRole('button', { name: '保存', exact: true }).click()
  await page.getByRole('button', { name: '推荐配载', exact: true }).click()
  await expect(page.locator('.shipping-stock .ps-toolbar')).toContainText(
    '25.002'
  )
  await field(page.locator('.shipping-vehicle'), '驾驶员')
    .locator('input')
    .fill('刘强')
  await page.getByRole('button', { name: '生成装车单', exact: true }).click()
  await expect(
    shipmentRow(page, 'SHIP-13').getByRole('button', {
      name: '编辑',
      exact: true,
    })
  ).toBeDisabled()
  await expect(
    shipmentRow(page, 'SHIP-13').getByRole('button', {
      name: '删除',
      exact: true,
    })
  ).toBeDisabled()
  await shipmentRow(page, 'SHIP-13')
    .getByRole('button', { name: 'DN-261029-013', exact: true })
    .click()
  await expect(page.locator('.ps-detail-modal')).toContainText('刘强')
  await expect(page.locator('.ps-detail-modal')).toContainText('装车单已建立')
  await page.getByRole('button', { name: '关闭详情', exact: true }).click()
  await page.getByRole('button', { name: '确认出厂', exact: true }).click()
  await dialog(page).getByRole('button', { name: '取消', exact: true }).click()
  await expect(dialog(page)).toHaveCount(0)
  await expect(
    page
      .getByTestId('shipping-workbench')
      .getByRole('button', { name: '确认出厂', exact: true })
  ).toBeEnabled()
  await page
    .getByTestId('shipping-workbench')
    .getByRole('button', { name: '确认出厂', exact: true })
    .click()
  await dialog(page)
    .getByRole('button', { name: '确认出厂', exact: true })
    .click()
  await expect(page.locator('.shipping-vehicle')).toContainText('已出厂')
})
