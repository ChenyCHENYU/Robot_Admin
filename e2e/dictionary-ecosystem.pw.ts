/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-01
 * @FilePath: \Robot_Admin\e2e\dictionary-ecosystem.pw.ts
 * @Description: 同源字典跨控件翻译、类型保真、局部恢复与 KeepAlive 清理回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 表单字段按可见标签定位，不依赖控件布局和顺序。 */
const field = (scope: Locator, label: string) =>
  scope.locator('.n-form-item').filter({
    has: scope.page().locator('.n-form-item-label').filter({ hasText: label }),
  })

/** 首次导航只用于准备销售页面；后续恢复和路由验证都使用实际交互。 */
const openSales = async (page: Page): Promise<void> => {
  await page.goto('/#/production-sales/sales-orders')
  await expect(page.getByTestId('business-workbench')).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
}

/** 从页面按钮创建新的局部字典体验实例。 */
const openExperience = async (page: Page): Promise<Locator> => {
  await page.getByRole('button', { name: '字典联动体验', exact: true }).click()
  const panel = page.getByTestId('dictionary-experience')
  await expect(panel).toBeVisible()
  return panel
}

/** 从真实下拉菜单选择文案，检查控件编码不会泄露到业务模型。 */
const choose = async (
  page: Page,
  control: Locator,
  label: string
): Promise<void> => {
  await control.click()
  await page
    .locator('.n-base-select-option:visible')
    .getByText(label, { exact: true })
    .click()
}

/** 请求计数来自本次体验的实际 loader，覆盖多消费者共享请求。 */
const expectRequests = async (panel: Locator, count: number): Promise<void> => {
  await expect(panel.getByTestId('dictionary-requests')).toHaveText(
    `本次仓库请求 ${count} 次`
  )
}

/** 读取展示出来的原始模型，不触碰组件内部实例或请求缓存。 */
const readModel = async (panel: Locator): Promise<Record<string, unknown>> => {
  const text = await panel.getByTestId('dictionary-model').innerText()
  return JSON.parse(text.slice(text.indexOf('{'))) as Record<string, unknown>
}

/** 已选值、纯文本详情和两种表格必须在同一快照下展示相同标签。 */
const expectWarehouse = async (
  panel: Locator,
  organization: string
): Promise<void> => {
  const label = `${organization} · 成品仓`
  await expect(
    field(panel.getByTestId('dictionary-form'), '交付仓库')
  ).toContainText(label)
  await expect(panel.getByTestId('dictionary-search')).toContainText(label)
  await expect(panel.getByTestId('dictionary-selection')).toContainText(label)
  await expect(panel.getByTestId('dictionary-native-table')).toContainText(
    label
  )
  await expect(
    panel
      .getByTestId('dictionary-mach-table')
      .locator(
        '.mach-pane--center .mach-row[data-id="1"] [data-col-id="warehouse"]'
      )
  ).toHaveText(label)
}

/** 检查真实 Naive 消息节点，局部字典失败不能额外弹全局错误。 */
const expectNoGlobalError = async (page: Page): Promise<void> => {
  await expect(
    page.locator('.n-message--error-type,.n-notification--error-type')
  ).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1720, height: 1280 })
})

test('字典跨表单、搜索、详情与两种表格共享一次请求，保留原值并支持局部失败重试', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await openSales(page)
  const panel = await openExperience(page)
  const form = panel.getByTestId('dictionary-form')
  await expect(field(form, '交付仓库')).toContainText('南京工厂 · 成品仓')
  await choose(
    page,
    panel.getByTestId('dictionary-search').locator('.n-base-selection'),
    '南京工厂 · 成品仓'
  )
  await expectWarehouse(panel, '南京工厂')
  await expectRequests(panel, 1)
  await page.screenshot({
    path: info.outputPath('dictionary-shared-light.png'),
  })

  const native = panel.getByTestId('dictionary-native-table')
  const mach = panel.getByTestId('dictionary-mach-table')
  await expect(native).toContainText('公路、铁路')
  await expect(native).toContainText('普通交付')
  await expect(native).toContainText('加急交付')
  await expect(native).toContainText('历史仓库（已停用）')
  await expect(native).toContainText('UNKNOWN')
  await expect(
    mach.locator(
      '.mach-pane--center .mach-row[data-id="1"] [data-col-id="delivery"]'
    )
  ).toHaveText('公路、铁路')
  await expect(
    mach.locator(
      '.mach-pane--center .mach-row[data-id="1"] [data-col-id="urgent"]'
    )
  ).toHaveText('普通交付')
  await expect(
    mach.locator(
      '.mach-pane--center .mach-row[data-id="2"] [data-col-id="warehouse"]'
    )
  ).toHaveText('历史仓库（已停用）')
  await expect(
    mach.locator(
      '.mach-pane--center .mach-row[data-id="3"] [data-col-id="warehouse"]'
    )
  ).toHaveText('UNKNOWN')
  await expect(field(form, '账户状态')).toContainText('禁用')
  await expect
    .poll(() => readModel(panel))
    .toEqual({
      warehouse: '001',
      delivery: ['ROAD', 'RAIL'],
      urgent: false,
      account: '0',
    })

  await field(form, '交付仓库').locator('.n-base-selection').click()
  await expect(
    page.locator('.n-base-select-option:visible').filter({
      hasText: '历史仓库（已停用）',
    })
  ).toHaveClass(/n-base-select-option--disabled/)
  await panel.getByRole('heading', { name: 'C_Table · 普通枚举文字' }).click()
  await choose(
    page,
    field(form, '加急要求').locator('.n-base-selection'),
    '加急交付'
  )
  await expect.poll(async () => (await readModel(panel)).urgent).toBe(true)
  await choose(
    page,
    field(form, '加急要求').locator('.n-base-selection'),
    '普通交付'
  )
  await expect.poll(async () => (await readModel(panel)).urgent).toBe(false)
  await choose(
    page,
    field(form, '运输方式').locator('.n-base-selection'),
    '水运'
  )
  await panel.getByRole('heading', { name: 'C_Table · 普通枚举文字' }).click()
  await expect
    .poll(async () => (await readModel(panel)).delivery)
    .toEqual(['ROAD', 'RAIL', 'SEA'])
  const model = await readModel(panel)
  await expectRequests(panel, 1)

  await panel.getByRole('button', { name: '模拟加载失败', exact: true }).click()
  await expect(panel.getByTestId('dictionary-error')).toBeVisible()
  await expectRequests(panel, 2)
  await expectWarehouse(panel, '南京工厂')
  await expect(panel.getByTestId('dictionary-empty')).toHaveCount(0)
  await expectNoGlobalError(page)
  await panel.getByRole('button', { name: '重试仓库字典', exact: true }).click()
  await expectRequests(panel, 3)
  // 旧标签在加载中也保留，必须等加载结束才能证明重试确实恢复。
  await expect(
    panel.getByRole('button', { name: '模拟加载失败', exact: true })
  ).toBeEnabled()
  await expect(panel.getByTestId('dictionary-error')).toHaveCount(0)
  await expectWarehouse(panel, '南京工厂')
  await expect.poll(() => readModel(panel)).toEqual(model)

  await panel.getByRole('button', { name: '切换体验工厂', exact: true }).click()
  await expectWarehouse(panel, '上海工厂')
  await expectRequests(panel, 4)
  await expect(panel).not.toContainText('南京工厂 ·')
  await expect.poll(() => readModel(panel)).toEqual(model)
  await expectNoGlobalError(page)
  expect(errors).toEqual([])
})

test('合法空字典提供独立提示且能重新加载，关闭重开会重新创建局部实例', async ({
  page,
}) => {
  await openSales(page)
  const panel = await openExperience(page)
  const warehouse = field(panel.getByTestId('dictionary-form'), '交付仓库')
  await expect(warehouse).toContainText('南京工厂 · 成品仓')
  await expectRequests(panel, 1)
  const model = await readModel(panel)

  await panel.getByRole('button', { name: '体验空字典', exact: true }).click()
  await expect(panel.getByTestId('dictionary-empty')).toContainText(
    '当前工厂暂无可选仓库'
  )
  await expect(panel.getByTestId('dictionary-error')).toHaveCount(0)
  await expectRequests(panel, 2)
  await expect(warehouse).toContainText('001')
  await expect(panel.getByTestId('dictionary-selection')).toContainText('001')
  await expect(panel.getByTestId('dictionary-native-table')).toContainText(
    'UNKNOWN'
  )
  await expect(panel.getByTestId('dictionary-mach-table')).toContainText(
    'UNKNOWN'
  )
  await expect.poll(() => readModel(panel)).toEqual(model)
  await expectNoGlobalError(page)

  await panel.getByRole('button', { name: '重新加载字典', exact: true }).click()
  await expect(warehouse).toContainText('南京工厂 · 成品仓')
  await expect(panel.getByTestId('dictionary-empty')).toHaveCount(0)
  await expectRequests(panel, 3)
  await page.getByRole('button', { name: '关闭体验', exact: true }).click()
  await expect(panel).toHaveCount(0)

  const reopened = await openExperience(page)
  await expect(
    field(reopened.getByTestId('dictionary-form'), '交付仓库')
  ).toContainText('南京工厂 · 成品仓')
  await expectRequests(reopened, 1)
  await expect(reopened.getByTestId('dictionary-empty')).toHaveCount(0)
  await expect(reopened.getByTestId('dictionary-error')).toHaveCount(0)
  await expect.poll(() => readModel(reopened)).toEqual(model)
  await expectNoGlobalError(page)
})

test('通过真实侧栏进入销售页后打开体验，后退和 tags 返回不会残留弹窗或白屏', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#/production-sales/production-plan')
  await expect(page.getByTestId('production-plan')).toBeVisible({
    timeout: 15_000,
  })
  const timeOrigin = await page.evaluate(() => performance.timeOrigin)
  await page
    .locator('.menu-scroll-container .n-menu-item-content-header')
    .filter({ hasText: /^销售订单协同$/ })
    .click()
  await expect(page.getByTestId('business-workbench')).toBeVisible()
  await expect(page).toHaveURL(/#\/production-sales\/sales-orders$/)
  const panel = await openExperience(page)
  await expectRequests(panel, 1)
  await page.goBack()
  await expect(page.getByTestId('production-plan')).toBeVisible()
  await expect(page).toHaveURL(/#\/production-sales\/production-plan$/)
  await expect(panel).toHaveCount(0)
  await expect(page.locator('.n-modal-mask:visible')).toHaveCount(0)

  await page
    .locator('.tags-track [data-path="/production-sales/sales-orders"]')
    .click()
  await expect(page.getByTestId('business-workbench')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: '销售订单协同', exact: true })
  ).toBeVisible()
  await expect(panel).toHaveCount(0)
  await expect(page.locator('.n-modal-mask:visible')).toHaveCount(0)
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin)
  await expectNoGlobalError(page)
  expect(errors).toEqual([])
})
