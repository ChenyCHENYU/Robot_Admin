/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\e2e\business-workbench.pw.ts
 * @Description: 通过真实公开控件验证主从工作台、精确数值、校验导航和部分失败批改
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { installMockAdminSession } from './auth-fixture'
import { expectFirstPagerUsable } from './d_paginationGeometry'

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

test('销售工作区按剩余空间分配，短明细释放高度，分栏和tags往返保留草稿', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1720, height: 1100 })
  await open(page)
  const root = page.getByTestId('business-workbench')
  const detail = root.locator('.workbench-detail-grid .mach-root')
  const note = formField(root.locator('.workbench-header'), '订单备注').locator(
    'input'
  )
  await expectFirstPagerUsable(
    root.locator('.workbench-orders .mach-pagination')
  )
  const fullRows = await root
    .locator('.workbench-master-grid .mach-root')
    .evaluate(grid => {
      const viewport = grid.querySelector('.mach-body-viewport--scroll')!
      const rect = viewport.getBoundingClientRect()
      return [
        ...grid.querySelectorAll('.mach-pane--center .mach-row[data-id]'),
      ].filter(row => {
        const bounds = row.getBoundingClientRect()
        return (
          bounds.top >= rect.top - 0.5 &&
          bounds.bottom <= rect.top + viewport.clientHeight + 0.5
        )
      }).length
    })
  expect(fullRows, '默认分栏应至少展示四条完整主表记录').toBeGreaterThanOrEqual(
    4
  )
  const formBox = (await root
    .locator('.workbench-header .c-form')
    .boundingBox())!
  const noteBox = (await note.boundingBox())!
  expect(noteBox.y + noteBox.height).toBeLessThanOrEqual(
    formBox.y + formBox.height + 0.5
  )
  const naturalHeight = (await detail.boundingBox())!.height
  expect(naturalHeight).toBeLessThan(200)
  const grid = (await root.locator('.workbench-detail-grid').boundingBox())!
  const totals = (await root.getByTestId('line-totals').boundingBox())!
  expect(Math.abs(totals.y - grid.y - grid.height)).toBeLessThanOrEqual(2)
  await note.fill('分栏和tags切换后保留此草稿')
  const separator = root.getByRole('separator', {
    name: '订单与单据详情',
    exact: true,
  })
  await separator.focus()
  await separator.press('ArrowUp')
  await expect(note).toHaveValue('分栏和tags切换后保留此草稿')
  await page.getByRole('tab', { name: '收款安排', exact: true }).click()
  expect(
    (await root.locator('.workbench-payment-grid .mach-root').boundingBox())!
      .height
  ).toBeLessThan(200)
  await page.getByRole('tab', { name: '商品明细', exact: true }).click()
  await page.getByRole('button', { name: '明细全屏', exact: true }).click()
  expect(
    (await page
      .locator('.workbench-details--fullscreen .workbench-detail-grid')
      .boundingBox())!.height
  ).toBeGreaterThan(250)
  await page.getByRole('button', { name: '退出明细全屏', exact: true }).click()
  await expect
    .poll(async () => (await detail.boundingBox())!.height)
    .toBeLessThan(200)
  await page.evaluate(async () => {
    const app = (
      document.querySelector('#app') as HTMLElement & { __vue_app__: App }
    ).__vue_app__
    await (app.config.globalProperties.$router as Router).push(
      '/production-sales/shipping'
    )
  })
  await expect(page.getByTestId('shipping-workbench')).toBeVisible()
  await page
    .locator('.tags-track [data-path="/production-sales/sales-orders"]')
    .click()
  await expect(root).toBeVisible()
  await expect(note).toHaveValue('分栏和tags切换后保留此草稿')
  await expect
    .poll(async () => (await detail.boundingBox())!.height)
    .toBeLessThan(200)
  await page.screenshot({
    path: info.outputPath('sales-window-height.png'),
    fullPage: true,
  })
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
  const canIncrease =
    Number(originalSize) <
    Number(await gutter.getAttribute('aria-valuemax')) - 0.1
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await expect(page.locator('.c-split-pane')).toHaveClass(
    /c-split-pane--dragging/
  )
  await page.mouse.move(
    box.x + box.width / 2,
    box.y + box.height / 2 + (canIncrease ? 55 : -55),
    {
      steps: 10,
    }
  )
  await page.mouse.up()
  await expect(gutter).not.toHaveAttribute('aria-valuenow', originalSize!)
  await expect.poll(scrollPositions).toEqual(before)
  await expect(
    page.getByRole('heading', { name: '销售订单协同', exact: true })
  ).toBeInViewport()
  await expect(page.locator('.form-search-card')).toBeInViewport({ ratio: 1 })
})

test('矮屏分栏初始双向可拖，Home/End仍保留完整数据行、分页和底部横轨', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1720, height: 840 })
  await open(page)
  const root = page.getByTestId('business-workbench')
  await expect(root).not.toHaveClass(/-enter-|-leave-/)
  const separator = root.getByRole('separator', {
    name: '订单与单据详情',
    exact: true,
  })
  const handle = separator.locator('.split-gutter__visual')
  const workspace = root.locator('.workbench-layout')
  const first = root.locator('.workbench-orders')
  const min = Number(await separator.getAttribute('aria-valuemin'))
  const max = Number(await separator.getAttribute('aria-valuemax'))
  const available =
    (await workspace.boundingBox())!.height -
    (await separator.boundingBox())!.height
  const size = Number(await separator.getAttribute('aria-valuenow'))
  expect(((max - min) * available) / 100).toBeGreaterThanOrEqual(75)
  expect(((size - min) * available) / 100).toBeGreaterThanOrEqual(30)
  expect(((max - size) * available) / 100).toBeGreaterThanOrEqual(30)
  const pageScroll = () =>
    root.evaluate(element => {
      const values = []
      for (let node = element.parentElement; node; node = node.parentElement)
        values.push(node.scrollTop)
      return values
    })
  const beforeScroll = await pageScroll()
  await inspect()
  const initialHeight = (await first.boundingBox())!.height
  let box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 28, {
    steps: 5,
  })
  await page.mouse.up()
  await expect
    .poll(async () => (await first.boundingBox())!.height)
    .toBeLessThan(initialHeight - 25)
  box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 56, {
    steps: 5,
  })
  await page.mouse.up()
  await expect
    .poll(async () => (await first.boundingBox())!.height)
    .toBeGreaterThan(initialHeight + 25)
  await expect.poll(pageScroll).toEqual(beforeScroll)
  /** 初始与两个合法边界均必须保留完整内容和真实可命中的滚动轨道。 */
  async function inspect() {
    await expect(root.locator('.workbench-search')).toBeInViewport({ ratio: 1 })
    await expect(workspace).toBeInViewport({ ratio: 1 })
    await expectFirstPagerUsable(
      root.locator('.workbench-orders .mach-pagination')
    )
    const geometry = await root.evaluate(element => {
      const measure = (selector: string) => {
        const grid = element.querySelector(selector)!
        const viewport = grid.querySelector(
          '.mach-body-viewport--scroll'
        )! as HTMLElement
        const rect = viewport.getBoundingClientRect()
        let { top } = rect,
          bottom = rect.top + viewport.clientHeight
        for (
          let parent = viewport.parentElement;
          parent;
          parent = parent.parentElement
        ) {
          if (
            /(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflowY)
          ) {
            const clip = parent.getBoundingClientRect()
            top = Math.max(
              top,
              clip.top + parseFloat(getComputedStyle(parent).borderTopWidth)
            )
            bottom = Math.min(
              bottom,
              clip.bottom -
                parseFloat(getComputedStyle(parent).borderBottomWidth)
            )
          }
        }
        const fullRows = [
          ...grid.querySelectorAll('.mach-pane--center .mach-row[data-id]'),
        ].filter(row => {
          const bounds = row.getBoundingClientRect()
          return bounds.top >= top - 0.5 && bounds.bottom <= bottom + 0.5
        }).length
        const barHeight = viewport.offsetHeight - viewport.clientHeight
        const x = rect.right - 24,
          y = rect.bottom - barHeight / 2
        const hit = document.elementFromPoint(x, y)
        return {
          fullRows,
          barHeight,
          barInsideWindow: rect.bottom <= window.innerHeight + 0.5,
          barHit: hit?.closest('.mach-root') === grid,
          overflow: viewport.scrollWidth > viewport.clientWidth,
        }
      }
      return {
        master: measure('.workbench-master-grid .mach-root'),
        detail: measure('.workbench-detail-grid .mach-root'),
      }
    })
    expect(geometry.master.fullRows).toBeGreaterThanOrEqual(1)
    expect(geometry.detail.fullRows).toBeGreaterThanOrEqual(1)
    expect(geometry.master.overflow).toBe(true)
    expect(geometry.master.barHeight).toBeGreaterThan(0)
    expect(geometry.master.barInsideWindow).toBe(true)
    expect(geometry.master.barHit).toBe(true)
    await expect.poll(pageScroll).toEqual(beforeScroll)
  }
  await separator.press('Home')
  await inspect()
  await separator.press('End')
  await inspect()
  const form = root.locator('.workbench-header .c-form')
  await form.evaluate(element => {
    element.scrollTop = element.scrollHeight
  })
  await expect(
    formField(root.locator('.workbench-header'), '订单备注').locator('input')
  ).toBeInViewport({ ratio: 1 })
  await page.screenshot({
    path: info.outputPath('sales-compact-range.png'),
    fullPage: true,
  })
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
  ).toContainText('18 笔订单')
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
  await expect(page.locator('.workbench-orders')).toContainText('18 笔订单')
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(page.locator('.workbench-orders')).toContainText('1 笔订单')
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
  await expect(page.locator('.workbench-orders')).toContainText('18 笔订单')
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
  await page.locator('.workbench-header .c-data-picker__clear').click()
  await page.getByRole('tab', { name: '收款安排', exact: true }).click()
  await expect(page.getByTestId('payment-panel')).toBeVisible()
  await page.getByRole('button', { name: '保存整单', exact: true }).click()
  const summary = page.locator('.c-error-summary')
  await expect(summary).toContainText('请选择订货客户')
  await expect(summary).toContainText('ORDER-1-L03')
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
  await summary.getByRole('button', { name: /ORDER-1-L03/ }).click()
  await expect(page.getByTestId('line-panel')).toBeVisible()
  const editor = page.getByTestId('line-panel').locator('.mach-editor-input')
  await expect(editor).toBeFocused()
  await editor.fill('0')
  await editor.press('Enter')
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
  await page.getByRole('button', { name: '批改备注', exact: true }).click()
  await page.getByRole('button', { name: '预览批改', exact: true }).click()
  await expect(page.getByTestId('batch-preview')).toContainText('零数量样例')
  await page.getByRole('button', { name: '确认执行批改', exact: true }).click()
  await expect(page.getByTestId('workbench-status')).toHaveText(
    '没有需要提交的修改'
  )
  await expect(page.getByTestId('draft-status')).toHaveText('已保存')
  await selectOption(page, page.getByLabel('批改备注操作'), '清空备注')
  await expect(
    page.getByRole('button', { name: '确认执行批改', exact: true })
  ).toBeDisabled()
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

test('无匹配订单和空明细分别恢复，暗色窄容器可堆叠且页面没有横向溢出', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('theme-mode', 'dark'))
  await page.setViewportSize({ width: 720, height: 1080 })
  await open(page)
  const search = page.locator('.workbench-search')
  await formField(search, '订单 / 客户')
    .getByRole('textbox')
    .fill('无此销售订单')
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(
    page.locator('.workbench-master-grid .mach-empty')
  ).toContainText('没有匹配的销售订单')
  await expect(page.getByTestId('active-order')).toHaveText('SO-2026-001')
  await expect(lineCell(page, 'ORDER-1-L01', 'quantity')).toHaveText('0.000')
  await page.getByRole('button', { name: '清除订单筛选', exact: true }).click()
  await expect(page.locator('.workbench-master-grid .mach-empty')).toHaveCount(
    0
  )
  await page.getByRole('button', { name: '全选明细', exact: true }).click()
  await page.getByRole('button', { name: '删除选中明细', exact: true }).click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '删除明细', exact: true })
    .click()
  await expect(page.getByTestId('line-totals')).toContainText('暂无明细')
  await expect(
    page.getByTestId('line-panel').locator('.mach-row[data-id]')
  ).toHaveCount(0)
  await expect(
    page.getByTestId('line-panel').locator('.mach-empty')
  ).toContainText('当前订单还没有商品明细')
  await page.getByRole('tab', { name: '收款安排', exact: true }).click()
  await expect(
    page.getByTestId('payment-panel').locator('.mach-empty')
  ).toContainText('暂无可测算的收款金额')
  await page.getByRole('tab', { name: '商品明细', exact: true }).click()
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
