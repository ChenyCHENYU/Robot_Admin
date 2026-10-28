/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\e2e\form-compact-polish.pw.ts
 * @Description: 紧凑表单、数字输入、确认弹框与搜索密度的真实交互回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

const orderRoute = '/#/demo/table-manage/mach-table'
const formRoute = '/#/demo/form-manage/form'
const searchRoute = '/#/demo/form-manage/form-search'

interface OrderIdentity {
  id: string
  orderNo: string
}

/** 使用实际业务标签定位字段，保留 Naive UI 的必填标记和校验区域。 */
const field = (container: Locator, label: string): Locator =>
  container.locator('.n-form-item').filter({
    has: container
      .page()
      .locator('.n-form-item-label')
      .filter({ hasText: label }),
  })

/** 读取当前首行身份，兼容订单默认倒序，不假定首行 ID 为 1。 */
const openOrders = async (page: Page): Promise<OrderIdentity> => {
  await page.goto(orderRoute)
  const actionCell = page.locator(
    '.mach-row[data-index="0"] .mach-cell[data-col-id="op"]'
  )
  await expect(actionCell).toBeVisible()
  const id = await actionCell.evaluate(
    element => element.closest<HTMLElement>('.mach-row')!.dataset.id!
  )
  const orderNo = (await page
    .locator(`.mach-row[data-id="${id}"] .mach-cell[data-col-id="orderNo"]`)
    .textContent())!
  return { id, orderNo }
}

/** 编辑和删除均通过正式行操作按钮，不暴露组件实例或表格 API。 */
const rowAction = (page: Page, order: OrderIdentity, label: string): Locator =>
  page
    .locator(`.mach-row[data-id="${order.id}"] .mach-cell[data-col-id="op"]`)
    .getByRole('button', { name: label, exact: true })

/** 打开订单真实编辑弹窗，等待标题及数字控件就绪。 */
const editOrder = async (
  page: Page,
  order: OrderIdentity
): Promise<Locator> => {
  await rowAction(page, order, '编辑').click()
  const modal = page.locator('.mach-record-modal')
  await expect(modal).toBeVisible()
  await expect(modal.locator('.n-card-header__main')).toContainText(
    order.orderNo
  )
  await expect(
    modal.getByRole('spinbutton', { name: '数量', exact: true })
  ).toBeVisible()
  return modal
}

/** 从实际控件几何读取高度，自动等待弹窗进入动画完成。 */
const expectHeight = async (
  locator: Locator,
  height: number
): Promise<void> => {
  await expect
    .poll(async () => (await locator.boundingBox())!.height)
    .toBeCloseTo(height, 0)
}

/** 空反馈与纵向网格间距分别受控，不能只把字段控件缩小。 */
const expectCompactModal = async (
  modal: Locator,
  narrow = false
): Promise<void> => {
  await expect(modal.locator('.c-form')).toHaveClass(/c-form--compact/)
  await expect
    .poll(() =>
      modal
        .locator('.n-grid')
        .evaluate(element => getComputedStyle(element).rowGap)
    )
    .toBe('8px')
  const columnGap = () =>
    modal
      .locator('.n-grid')
      .evaluate(element => parseFloat(getComputedStyle(element).columnGap))
  if (narrow) {
    await expect.poll(columnGap).toBeGreaterThan(0)
    await expect.poll(columnGap).toBeLessThan(18)
  } else await expect.poll(columnGap).toBe(18)
  await expectHeight(
    field(modal, '客户名称').locator('.n-form-item-feedback-wrapper'),
    4
  )
  await expectHeight(field(modal, '客户名称').locator('.n-input'), 28)
  await expect
    .poll(() =>
      modal
        .locator('.n-card-header')
        .evaluate(element => getComputedStyle(element).marginBottom)
    )
    .toBe('0px')
  await expectHeight(
    modal.getByRole('button', { name: '取消', exact: true }),
    22
  )
}

/** 校验文案必须自然撑高，反馈区域本身不裁切真实错误内容。 */
const expectErrorFits = async (item: Locator): Promise<void> => {
  const error = item.locator('.n-form-item-feedback--error')
  await expect(error).toBeVisible()
  await expect
    .poll(() => error.evaluate(element => getComputedStyle(element).opacity))
    .toBe('1')
  await expect
    .poll(() =>
      item.evaluate(element => {
        const wrapper = element.querySelector<HTMLElement>(
          '.n-form-item-feedback-wrapper'
        )!
        const message = element.querySelector<HTMLElement>(
          '.n-form-item-feedback--error'
        )!
        return (
          wrapper.clientHeight > 4 &&
          wrapper.scrollHeight <= wrapper.clientHeight + 1 &&
          message.scrollHeight <= message.clientHeight + 1
        )
      })
    )
    .toBe(true)
}

/** 验证 SVG 与标题文本的几何中心，而不是只检查 CSS 声明。 */
const expectDialogGeometry = async (dialog: Locator): Promise<void> => {
  await expectHeight(
    dialog.getByRole('button', { name: '取消', exact: true }),
    22
  )
  await expectHeight(
    dialog.getByRole('button', { name: '确认删除', exact: true }),
    22
  )
  await expect
    .poll(() =>
      dialog.evaluate(element => {
        const icon = element.querySelector<SVGElement>('.n-dialog__icon svg')!
        const title = element.querySelector<HTMLElement>('.n-dialog__title')!
        const text = Array.from(title.childNodes).find(
          node =>
            node.nodeType === Node.TEXT_NODE &&
            node.textContent?.includes('删除订单')
        )!
        const range = document.createRange()
        range.selectNodeContents(text)
        const iconBounds = icon.getBoundingClientRect()
        const textBounds = range.getBoundingClientRect()
        return Math.abs(
          iconBounds.top +
            iconBounds.height / 2 -
            textBounds.top -
            textBounds.height / 2
        )
      })
    )
    .toBeLessThanOrEqual(2)
  const geometry = await dialog.evaluate(element => {
    const icon = element.querySelector<SVGElement>('.n-dialog__icon svg')!
    const bounds = icon.getBoundingClientRect()
    return {
      width: bounds.width,
      height: bounds.height,
      margin: getComputedStyle(icon).marginTop,
      fonts: Array.from(
        element.querySelectorAll('.n-dialog__action button')
      ).map(button => getComputedStyle(button).fontSize),
    }
  })
  expect(geometry.width).toBeCloseTo(22, 0)
  expect(geometry.height).toBeCloseTo(22, 0)
  expect(geometry.margin).toBe('0px')
  expect(geometry.fonts).toEqual(['12px', '12px'])
}

/** 切换已有密度选项，通过正常控件更新配置，不重新挂载表单。 */
const changeDensity = async (
  controls: Locator,
  label: string
): Promise<void> => {
  await controls.getByText(label, { exact: true }).click()
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1657, height: 1000 })
})

test('订单紧凑编辑保持数字键盘、边界、精度和禁用语义，取消及保存各自生效', async ({
  page,
}, testInfo) => {
  const order = await openOrders(page)
  let modal = await editOrder(page, order)
  await expectCompactModal(modal)
  await expect(field(modal, '订单编号').getByRole('textbox')).toBeDisabled()
  await expect(modal.locator('.n-input-number button')).toHaveCount(0)
  const customer = field(modal, '客户名称').getByRole('textbox')
  const originalCustomer = await customer.inputValue()
  const quantity = modal.getByRole('spinbutton', { name: '数量', exact: true })
  const originalQuantity = await quantity.inputValue()
  await expect(quantity).toHaveAttribute('aria-valuemin', '1')
  await expect(quantity).toHaveAttribute('aria-valuemax', '9999')
  await quantity.fill('1')
  await quantity.press('ArrowDown')
  await expect(quantity).toHaveValue('1')
  await quantity.press('ArrowUp')
  await expect(quantity).toHaveValue('2')
  await quantity.fill('9999')
  await quantity.press('ArrowUp')
  await expect(quantity).toHaveValue('9999')
  const amount = modal.getByRole('spinbutton', {
    name: '订单金额',
    exact: true,
  })
  await amount.fill('19.6')
  await amount.press('Tab')
  await expect(amount).toHaveValue('20')
  await customer.fill('尚未保存的订单草稿')
  await modal.screenshot({
    path: testInfo.outputPath('order-form-light-compact.png'),
  })
  await modal.getByRole('button', { name: '取消', exact: true }).click()
  await expect(modal).not.toBeVisible()
  modal = await editOrder(page, order)
  await expect(field(modal, '客户名称').getByRole('textbox')).toHaveValue(
    originalCustomer
  )
  await expect(
    modal.getByRole('spinbutton', { name: '数量', exact: true })
  ).toHaveValue(originalQuantity)
  await field(modal, '客户名称').getByRole('textbox').fill('紧凑保存客户')
  await modal.getByRole('spinbutton', { name: '数量', exact: true }).fill('7')
  await modal.getByRole('button', { name: '保存修改', exact: true }).click()
  await expect(modal).not.toBeVisible()
  await expect(
    page.locator(
      `.mach-row[data-id="${order.id}"] .mach-cell[data-col-id="customer"]`
    )
  ).toHaveText('紧凑保存客户')
  await expect(
    page.locator(
      `.mach-row[data-id="${order.id}"] .mach-cell[data-col-id="quantity"]`
    )
  ).toHaveText('7')
})

test('暗色窄屏新增订单错误自然撑高，修正后才写入本地模型', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('theme-mode', 'dark'))
  await page.setViewportSize({ width: 390, height: 844 })
  await openOrders(page)
  const count = page
    .locator('.mach-overview__item')
    .filter({ hasText: '数据规模' })
    .locator('strong')
  const originalCount = await count.textContent()
  await page.getByRole('button', { name: '新增', exact: true }).click()
  const modal = page.locator('.mach-record-modal')
  await expect(modal.locator('.n-card-header__main')).toHaveText('新增订单')
  await expectCompactModal(modal, true)
  await expect
    .poll(async () => (await modal.boundingBox())!.width)
    .toBeCloseTo(366, 0)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await field(modal, '产品方案').getByRole('textbox').fill('x')
  await modal.getByRole('button', { name: '创建订单', exact: true }).click()
  await expectErrorFits(field(modal, '客户名称'))
  await expectErrorFits(field(modal, '产品方案'))
  await expect(count).toHaveText(originalCount!)
  expect(
    await modal.evaluate(element => element.scrollWidth - element.clientWidth)
  ).toBeLessThanOrEqual(1)
  await modal.screenshot({
    path: testInfo.outputPath('order-form-dark-narrow-errors.png'),
  })
  await field(modal, '客户名称').getByRole('textbox').fill('窄屏新增客户')
  await field(modal, '产品方案').getByRole('textbox').fill('窄屏产品方案')
  await modal
    .getByRole('spinbutton', { name: '订单金额', exact: true })
    .fill('99')
  await modal.getByRole('button', { name: '创建订单', exact: true }).click()
  await expect(modal).not.toBeVisible()
  await expect(count).toHaveText('2,001 行')
  await page.getByPlaceholder('搜索订单、客户、产品或区域').fill('窄屏新增客户')
  await expect(
    page.locator('.mach-row[data-id] .mach-cell[data-col-id="customer"]')
  ).toHaveText('窄屏新增客户')
})

for (const mode of ['light', 'dark'] as const) {
  test(`${mode} 删除确认图标居中且按钮紧凑，取消不删、确认只删当前订单`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      mode => localStorage.setItem('theme-mode', mode),
      mode
    )
    const order = await openOrders(page)
    const count = page
      .locator('.mach-overview__item')
      .filter({ hasText: '数据规模' })
      .locator('strong')
    await expect(count).toHaveText('2,000 行')
    await rowAction(page, order, '删除').click()
    const dialog = page.locator('.n-dialog').filter({ hasText: '删除订单' })
    await expect(dialog).toContainText(order.orderNo)
    await expectDialogGeometry(dialog)
    await dialog.screenshot({
      path: testInfo.outputPath(`order-delete-${mode}-compact.png`),
    })
    await dialog.getByRole('button', { name: '取消', exact: true }).click()
    await expect(dialog).not.toBeVisible()
    await expect(count).toHaveText('2,000 行')
    await expect(rowAction(page, order, '删除')).toBeVisible()
    await rowAction(page, order, '删除').click()
    await dialog.getByRole('button', { name: '确认删除', exact: true }).click()
    await expect(dialog).not.toBeVisible()
    await expect(count).toHaveText('1,999 行')
    await expect(page.locator(`.mach-row[data-id="${order.id}"]`)).toHaveCount(
      0
    )
    await page.goto(formRoute)
    const ordinarySmall = page.getByRole('button', {
      name: '填充测试',
      exact: true,
    })
    await expectHeight(ordinarySmall, 28)
  })
}

test('表单密度切换保留草稿和数字值，紧凑控件取消按钮但不取消键盘操作', async ({
  page,
}, testInfo) => {
  await page.goto(formRoute)
  const form = page.locator('.form-section .n-form')
  await expect(form).toHaveClass(/c-form--compact/)
  const name = form.getByPlaceholder('请输入用户名', { exact: true })
  await name.fill('density_draft')
  const age = form.getByRole('spinbutton', { name: '年龄', exact: true })
  await age.fill('18')
  await age.press('ArrowUp')
  await expect(age).toHaveValue('19')
  await expect(
    field(form, '年龄').locator('.n-input-number button')
  ).toHaveCount(0)
  const density = page.locator('.config-item').filter({ hasText: '界面密度' })
  await changeDensity(density, '舒适')
  await expect(form).toHaveClass(/c-form--comfortable/)
  await expect(name).toHaveValue('density_draft')
  await expect(age).toHaveValue('19')
  await expectHeight(field(form, '用户名').locator('.n-input'), 40)
  await expect(
    field(form, '年龄').locator('.n-input-number button')
  ).toHaveCount(2)
  await page.screenshot({
    path: testInfo.outputPath('form-density-comfortable-draft.png'),
    fullPage: true,
  })
  await changeDensity(density, '紧凑')
  await expect(form).toHaveClass(/c-form--compact/)
  await expectHeight(field(form, '用户名').locator('.n-input'), 28)
  await expect(name).toHaveValue('density_draft')
  await expect(age).toHaveValue('19')
  await expect(
    field(form, '年龄').locator('.n-input-number button')
  ).toHaveCount(0)
})

test('搜索字段紧凑208px，折叠和密度切换保留条件且选项仍可真实提交', async ({
  page,
}, testInfo) => {
  await page.goto(searchRoute)
  const basic = page.locator('.demo-section').filter({
    has: page.getByRole('heading', {
      name: '基础用法（3个字段）',
      exact: true,
    }),
  })
  const advanced = page.locator('.demo-section').filter({
    has: page.getByRole('heading', {
      name: '高级用法（12个字段 - 默认显示8个，展开显示全部）',
      exact: true,
    }),
  })
  const name = basic.getByPlaceholder('请输入用户名称')
  await expect
    .poll(() =>
      name.evaluate(
        element =>
          element.closest<HTMLElement>('.n-input')!.getBoundingClientRect()
            .width
      )
    )
    .toBeCloseTo(208, 0)
  await name.fill('张三')
  const keyword = advanced.getByPlaceholder('请输入关键词搜索')
  await keyword.fill('密度搜索草稿')
  const version = advanced.getByPlaceholder('请输入版本号')
  await expect(version).not.toBeVisible()
  await advanced
    .getByRole('button', { name: '展开搜索条件', exact: true })
    .click()
  await expect(version).toBeVisible()
  await version.fill('v0.33')
  await advanced.locator('.n-select').filter({ hasText: '请选择分类' }).click()
  await page
    .locator('.n-base-select-option:visible')
    .getByText('科技', { exact: true })
    .click()
  const density = page.locator('.density-controls')
  await changeDensity(density, '舒适')
  await expect(advanced.locator('.form-search-card')).toHaveClass(
    /form-search-card--comfortable/
  )
  await expect(keyword).toHaveValue('密度搜索草稿')
  await expect(version).toHaveValue('v0.33')
  await expect(name).toHaveValue('张三')
  await advanced
    .getByRole('button', { name: '收起搜索条件', exact: true })
    .click()
  await expect(version).not.toBeVisible()
  await changeDensity(density, '紧凑')
  await expect(advanced.locator('.form-search-card')).toHaveClass(
    /form-search-card--compact/
  )
  await advanced
    .getByRole('button', { name: '展开搜索条件', exact: true })
    .click()
  await expect(version).toHaveValue('v0.33')
  await page.screenshot({
    path: testInfo.outputPath('search-compact-expanded-draft.png'),
    fullPage: true,
  })
  await advanced.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(
    page.locator('.demo-section pre').filter({ hasText: '密度搜索草稿' })
  ).toContainText('科技')
  await advanced.getByRole('button', { name: '重置', exact: true }).click()
  await expect(keyword).toHaveValue('')
  await expect(version).toHaveValue('')
  await expect(name).toHaveValue('张三')
})
