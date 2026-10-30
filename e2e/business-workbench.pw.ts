/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\e2e\business-workbench.pw.ts
 * @Description: 通过真实公开控件验证主从工作台、精确数值、校验导航和部分失败批改
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const route = '/#/production-sales/sales-orders'
const formField = (container: Locator, label: string): Locator =>
  container.locator('.n-form-item').filter({
    has: container
      .page()
      .locator('.n-form-item-label')
      .filter({ hasText: label }),
  })
const lineCell = (page: Page, id: string, column: string): Locator =>
  page
    .getByTestId('line-panel')
    .locator(`.mach-row[data-id="${id}"] .mach-cell[data-col-id="${column}"]`)
const open = async (page: Page): Promise<void> => {
  await page.goto(route)
  await expect(page.getByTestId('business-workbench')).toBeVisible()
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  await expect(lineCell(page, 'ORDER-1-L01', 'quantity')).toHaveText('0.000')
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
}
const editQuantity = async (
  page: Page,
  id: string,
  value: string
): Promise<void> => {
  await lineCell(page, id, 'quantity').dblclick()
  const editor = page.getByTestId('line-panel').locator('.mach-editor-input')
  await expect(editor).toBeFocused()
  await editor.fill(value)
  await editor.press('Enter')
  await expect(editor).toHaveCount(0)
}
const selectOption = async (
  page: Page,
  control: Locator,
  text: string
): Promise<void> => {
  await control.click()
  await page
    .locator('.n-base-select-option:visible')
    .getByText(text, { exact: true })
    .click()
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1080 })
})

test('拖动分割手柄保留页面滚动位置，标题与完整搜索区域不被头部遮挡', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1720, height: 840 })
  await open(page)
  const workbench = page.getByTestId('business-workbench')
  await workbench.evaluate(element => {
    for (
      let parent = element.parentElement;
      parent;
      parent = parent.parentElement
    )
      parent.scrollTop = 0
  })
  const scrollPositions = () =>
    workbench.evaluate(element => {
      const positions: number[] = []
      for (
        let parent = element.parentElement;
        parent;
        parent = parent.parentElement
      )
        positions.push(parent.scrollTop)
      return positions
    })
  const gutter = page.getByRole('separator', {
    name: '订单与单据详情',
    exact: true,
  })
  const handle = gutter.locator('.split-gutter__visual')
  await expect(page.getByTestId('business-workbench')).not.toHaveClass(
    /-enter-|-leave-/
  )
  await expect(handle).toBeInViewport()
  await expect(page.locator('.form-search-card')).toBeInViewport({ ratio: 1 })
  const before = await scrollPositions()
  const box = (await handle.boundingBox())!
  const originalSize = await gutter.getAttribute('aria-valuenow')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await expect(page.locator('.c-split-pane')).toHaveClass(
    /c-split-pane--dragging/
  )
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 55, {
    steps: 10,
  })
  await page.mouse.up()
  await expect(gutter).not.toHaveAttribute('aria-valuenow', originalSize!)
  await expect.poll(scrollPositions).toEqual(before)
  await expect(
    page.getByRole('heading', { name: '销售订单协同', exact: true })
  ).toBeInViewport()
  await expect(page.locator('.form-search-card')).toBeInViewport({ ratio: 1 })
})

test('主题网格、当前订单与状态标签可辨认，主档控件宽度一致', async ({
  page,
}, testInfo) => {
  await open(page)
  const grids = page.locator('.business-workbench .mach-root:visible')
  await expect(grids).toHaveCount(2)
  await Promise.all(
    (await grids.all()).map(async grid => {
      await expect(grid).toHaveClass(/mach-striped/)
      await expect(grid).toHaveClass(/mach-cell-borders/)
      const colors = await grid.evaluate(element => ({
        primary: getComputedStyle(element)
          .getPropertyValue('--mach-primary')
          .trim(),
        app: getComputedStyle(element).getPropertyValue('--app-primary').trim(),
      }))
      expect(colors.primary).toBe(colors.app)
      expect(colors.primary).not.toBe('')
    })
  )
  await expect(
    page.locator(
      '.workbench-orders .mach-pane--center .mach-row[data-id="ORDER-1"]'
    )
  ).toHaveAttribute('data-row-tone', 'info')
  await Promise.all(
    ['待下达', '执行中', '已完成'].map(status =>
      expect(
        page
          .locator('.workbench-orders .mach-tag')
          .filter({ hasText: status })
          .first()
      ).toBeVisible()
    )
  )

  const form = page.locator('.workbench-header')
  const controls = [
    formField(form, '订单编号').locator('.n-input'),
    formField(form, '订货客户').locator('.c-data-picker'),
    formField(form, '计划状态').locator('.n-select'),
    formField(form, '业务人员').locator('.n-input'),
  ]
  await expect
    .poll(async () => {
      const widths = await Promise.all(
        controls.map(async control => (await control.boundingBox())!.width)
      )
      return Math.max(...widths) - Math.min(...widths)
    })
    .toBeLessThanOrEqual(2)
  await page
    .locator(
      '.workbench-master-grid .mach-row[data-id="ORDER-2"] .mach-cell[data-col-id="customer"]'
    )
    .click()
  await expect(
    page.locator(
      '.workbench-orders .mach-pane--center .mach-row[data-id="ORDER-2"]'
    )
  ).toHaveAttribute('data-row-tone', 'info')
  await expect(lineCell(page, 'ORDER-2-L01', 'quantity')).toHaveText('0.000')
  await page.screenshot({
    path: testInfo.outputPath('workbench-polished-light.png'),
  })
})

test('搜索草稿和已应用条件分离，固定组织保留，状态0与精确小数正确显示', async ({
  page,
}, testInfo) => {
  await open(page)
  const search = page.locator('.form-search-card')
  await expect(search).toHaveClass(/form-search-card--compact/)
  await expect(formField(search, '组织').getByRole('textbox')).toHaveValue(
    '001'
  )
  await expect(formField(search, '组织').getByRole('textbox')).toBeDisabled()
  await expect(
    page.getByRole('region', { name: '订单列表', exact: true })
  ).toContainText('18 笔本地订单')
  await expect(
    page.locator(
      '.workbench-orders .mach-row[data-id="ORDER-1"] .mach-cell[data-col-id="status"]'
    )
  ).toHaveText('待下达')
  await expect(lineCell(page, 'ORDER-1-L03', 'quantity')).toHaveText('—')
  await expect(lineCell(page, 'ORDER-1-L01', 'amount')).toHaveText('1.01')
  await expect(page.getByTestId('line-totals')).toContainText('12,027.01')
  await expect(page.getByTestId('line-totals')).toContainText('12.125')
  await selectOption(
    page,
    formField(search, '计划状态').locator('.n-select'),
    '待下达'
  )
  await expect(page.locator('.workbench-orders')).toContainText('18 笔本地订单')
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(page.locator('.workbench-orders')).toContainText('1 笔本地订单')
  await expect(
    page.locator(
      '.workbench-master-grid .mach-row[data-id="ORDER-1"] .mach-cell[data-col-id="customer"]'
    )
  ).toBeVisible()
  await search.getByRole('button', { name: '重置', exact: true }).click()
  await expect(formField(search, '组织').getByRole('textbox')).toHaveValue(
    '001'
  )
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(page.locator('.workbench-orders')).toContainText('18 笔本地订单')
  await page
    .getByTestId('business-workbench')
    .screenshot({ path: testInfo.outputPath('business-workbench-light.png') })
})

test('主记录切换保护草稿，隐藏Tab和局部全屏不改变稳定行身份或已编辑数量', async ({
  page,
}) => {
  await open(page)
  await editQuantity(page, 'ORDER-1-L01', '2.125')
  await expect(lineCell(page, 'ORDER-1-L01', 'quantity')).toHaveText('2.125')
  await expect(page.getByTestId('draft-status')).toHaveText('有未保存修改')
  const tabs = page.getByRole('tablist', { name: '订单明细分类', exact: true })
  await tabs.getByRole('tab', { name: '商品明细', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(
    tabs.getByRole('tab', { name: '收款安排', exact: true })
  ).toBeFocused()
  await expect(
    tabs.getByRole('tab', { name: '收款安排', exact: true })
  ).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: '收款安排', exact: true }).click()
  await expect(page.getByTestId('payment-panel')).toBeVisible()
  await expect(page.getByTestId('line-panel')).not.toBeVisible()
  await page.getByRole('tab', { name: '商品明细', exact: true }).click()
  const readGridTheme = () =>
    page
      .getByTestId('line-panel')
      .locator('.mach-root')
      .evaluate(element => {
        const style = getComputedStyle(element)
        return ['--mach-primary', '--mach-header-bg', '--mach-body-bg'].map(
          name => style.getPropertyValue(name).trim()
        )
      })
  const inlineTheme = await readGridTheme()
  await page.getByRole('button', { name: '明细全屏', exact: true }).click()
  await expect(page.locator('.workbench-details--fullscreen')).toBeVisible()
  await expect.poll(readGridTheme).toEqual(inlineTheme)
  await expect(lineCell(page, 'ORDER-1-L01', 'quantity')).toHaveText('2.125')
  await page.getByRole('button', { name: '退出明细全屏', exact: true }).click()
  await expect(page.locator('.workbench-details--fullscreen')).toHaveCount(0)
  await page
    .locator(
      '.workbench-master-grid .mach-row[data-id="ORDER-2"] .mach-cell[data-col-id="customer"]'
    )
    .click()
  const guard = page.locator('.workbench-switch-dialog')
  await expect(guard).toBeVisible()
  await guard.getByRole('button', { name: '取消切换', exact: true }).click()
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-001')
  await expect(lineCell(page, 'ORDER-1-L01', 'quantity')).toHaveText('2.125')
  await page
    .locator(
      '.workbench-master-grid .mach-row[data-id="ORDER-2"] .mach-cell[data-col-id="customer"]'
    )
    .click()
  await guard.getByRole('button', { name: '放弃并切换', exact: true }).click()
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-002')
  await expect(lineCell(page, 'ORDER-2-L01', 'quantity')).toHaveText('0.000')
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
  await page
    .locator(
      '.workbench-master-grid .mach-row[data-id="ORDER-1"] .mach-cell[data-col-id="customer"]'
    )
    .click()
  await expect(lineCell(page, 'ORDER-1-L01', 'quantity')).toHaveText('0.000')
})

test('跨表单和隐藏网格定位校验错误，远程Picker取消不写入、确认回显客户编码', async ({
  page,
}) => {
  await open(page)
  await page.getByRole('button', { name: '填入缺失样例', exact: true }).click()
  await expect(page.getByTestId('payment-panel')).toBeVisible()
  await page.getByRole('button', { name: '保存整单', exact: true }).click()
  const summary = page.locator('.c-error-summary')
  await expect(summary).toContainText('请选择订货客户')
  await expect(summary).toContainText('ORDER-1-L01')
  await summary
    .getByRole('button', { name: '请选择订货客户', exact: true })
    .click()
  const pickerOpen = page.locator('.workbench-header .c-data-picker__open')
  await expect(pickerOpen).toBeFocused()
  await pickerOpen.click()
  const picker = page.locator('.c-data-picker__modal')
  await expect(picker).toBeVisible()
  await picker
    .getByRole('textbox', { name: '搜索候选数据', exact: true })
    .fill('0002')
  await picker.getByRole('button', { name: '搜索', exact: true }).click()
  const customer = picker.locator('tr').filter({ hasText: '云帆智造' })
  await expect(customer).toBeVisible()
  await customer.locator('.n-radio').click()
  await expect(customer.getByRole('radio')).toBeChecked()
  await picker.getByRole('button', { name: '取消', exact: true }).click()
  await expect(pickerOpen).not.toContainText('云帆智造')
  await pickerOpen.click()
  await picker
    .getByRole('textbox', { name: '搜索候选数据', exact: true })
    .fill('0002')
  await picker.getByRole('button', { name: '搜索', exact: true }).click()
  await customer.locator('.n-radio').click()
  await expect(customer.getByRole('radio')).toBeChecked()
  await picker.getByRole('button', { name: '确定', exact: true }).click()
  await expect(picker).not.toBeVisible()
  await expect(pickerOpen).toContainText('云帆智造')
  await summary.getByRole('button', { name: /ORDER-1-L01/ }).click()
  await expect(page.getByTestId('line-panel')).toBeVisible()
  const editor = page.getByTestId('line-panel').locator('.mach-editor-input')
  await expect(editor).toBeFocused()
  await editor.fill('0')
  await editor.press('Enter')
  await editQuantity(page, 'ORDER-1-L03', '0')
  await page.getByRole('button', { name: '保存整单', exact: true }).click()
  await expect(summary).toHaveCount(0)
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
  await expect(page.getByTestId('workbench-status')).toHaveText(
    '整单保存成功（本地示例）'
  )
})

test('批改明确区分不修改、清空和赋值，部分失败重试成功后草稿才变干净', async ({
  page,
}) => {
  await open(page)
  await page.getByRole('button', { name: '全选明细', exact: true }).click()
  await page.getByRole('button', { name: '预览批改', exact: true }).click()
  await expect(page.getByTestId('batch-preview')).toContainText('零数量样例')
  await page.getByRole('button', { name: '确认执行批改', exact: true }).click()
  await expect(page.getByTestId('workbench-status')).toHaveText(
    '没有需要提交的修改'
  )
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
  await selectOption(page, page.getByLabel('批改备注操作'), '清空备注')
  await page.getByRole('button', { name: '预览批改', exact: true }).click()
  await expect(
    page.getByTestId('batch-preview').getByText('清空为未填写', { exact: true })
  ).toHaveCount(3)
  await page.getByRole('button', { name: '确认执行批改', exact: true }).click()
  const result = page.getByRole('region', { name: '本次批改结果', exact: true })
  await expect(result).toContainText('成功 2')
  await expect(result).toContainText('失败 1')
  await expect(page.getByTestId('draft-status')).toHaveText('有未保存修改')
  await result
    .getByRole('button', { name: '重试可重试项（1）', exact: true })
    .click()
  await expect(result).toContainText('成功 3')
  await expect(result).toContainText('失败 0')
  await expect(
    result.getByRole('button', { name: '重试可重试项（0）', exact: true })
  ).toBeDisabled()
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
  await selectOption(page, page.getByLabel('批改备注操作'), '统一赋值')
  await page
    .getByRole('textbox', { name: '统一备注内容', exact: true })
    .fill('新批次交期')
  await page.getByRole('button', { name: '预览批改', exact: true }).click()
  await page.getByRole('button', { name: '确认执行批改', exact: true }).click()
  await expect(lineCell(page, 'ORDER-1-L02', 'note')).toHaveText('新批次交期')
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
})

test('本地空列表不回退旧数据，暗色窄容器可堆叠且页面没有横向溢出', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('theme-mode', 'dark'))
  await page.setViewportSize({ width: 720, height: 1080 })
  await open(page)
  await page.getByRole('button', { name: '体验空明细', exact: true }).click()
  await expect(page.getByTestId('line-totals')).toContainText('暂无明细')
  await expect(
    page.getByTestId('line-panel').locator('.mach-row[data-id]')
  ).toHaveCount(0)
  await page.getByRole('button', { name: '恢复当前单据', exact: true }).click()
  await expect(lineCell(page, 'ORDER-1-L01', 'quantity')).toHaveText('0.000')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect
    .poll(() =>
      page
        .getByTestId('business-workbench')
        .evaluate(element => element.scrollWidth - element.clientWidth)
    )
    .toBeLessThanOrEqual(1)
  await page.getByTestId('business-workbench').evaluate(element => {
    for (
      let parent = element.parentElement;
      parent;
      parent = parent.parentElement
    )
      parent.scrollTop = 0
  })
  await page.screenshot({
    path: testInfo.outputPath('business-workbench-dark-narrow.png'),
  })
})
