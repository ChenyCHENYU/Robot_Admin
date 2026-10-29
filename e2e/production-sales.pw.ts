/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\e2e\production-sales.pw.ts
 * @Description: 产销复杂组合页面的实图、状态流转、空态主题与标签回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect, type Page, type Locator } from '@playwright/test'
import type { App } from 'vue'
import type { Router } from 'vue-router'
import { installMockAdminSession } from './auth-fixture'

const pages = [
  { path: 'production-plan', title: '生产计划调度', root: 'production-plan' },
  {
    path: 'production-actual',
    title: '炉次实绩记录',
    root: 'production-actual',
  },
  { path: 'sales-orders', title: '销售订单协同', root: 'business-workbench' },
  { path: 'shipping', title: '发运协同指挥台', root: 'shipping-workbench' },
] as const

/** 使用真实表单标签定位控件，不依赖字段渲染顺序。 */
const field = (container: Locator, label: string) =>
  container.locator('.n-form-item').filter({
    has: container
      .page()
      .locator('.n-form-item-label')
      .filter({ hasText: label }),
  })

/** 初次导航后通过实际 Router 和 tags 切换，不刷新页面。 */
const navigate = (page: Page, path: string) =>
  page.evaluate(async target => {
    const app = (
      document.querySelector('#app') as HTMLElement & { __vue_app__: App }
    ).__vue_app__
    await (app.config.globalProperties.$router as Router).push(target)
  }, path)

/** 首次冷启动先等待业务根节点和加载层就绪，再以默认时限验证具体交互。 */
const openPage = async (
  page: Page,
  path: string,
  root: string
): Promise<void> => {
  await page.goto(path)
  await expect(page.getByTestId(root)).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

for (const mode of ['light', 'dark'] as const) {
  for (const item of pages) {
    test(`${mode} ${item.title}：宽屏实图与窄容器保持可操作且无横向页面溢出`, async ({
      page,
    }, info) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.addInitScript(
        value => localStorage.setItem('theme-mode', value),
        mode
      )
      await page.setViewportSize({ width: 1720, height: 1200 })
      await openPage(page, `/#/production-sales/${item.path}`, item.root)
      const root = page.getByTestId(item.root)
      await expect(root).toBeVisible()
      await expect(
        page.getByRole('heading', { name: item.title, exact: true })
      ).toBeVisible()
      await expect(root.locator('.mach-root').first()).toBeVisible()
      await expect(root).not.toHaveClass(/-enter-|-leave-/)
      await page.screenshot({
        path: info.outputPath(`${item.path}-${mode}-wide.png`),
        animations: 'disabled',
      })
      await page.setViewportSize({ width: 760, height: 1100 })
      await expect
        .poll(() =>
          root.evaluate(element => element.scrollWidth - element.clientWidth)
        )
        .toBeLessThanOrEqual(1)
      await expect(
        page.getByRole('heading', { name: item.title, exact: true })
      ).toBeInViewport()
      await page.screenshot({
        path: info.outputPath(`${item.path}-${mode}-narrow.png`),
        animations: 'disabled',
      })
      expect(errors).toEqual([])
    })
  }
}

test('计划提交快照、产线树、炉次联动与下达状态保持一致', async ({ page }) => {
  await page.setViewportSize({ width: 1720, height: 1100 })
  await openPage(page, '/#/production-sales/production-plan', 'production-plan')
  const table = page.locator('[aria-label="排产计划台账"]')
  await expect(table).toContainText('18 项')
  const order = () =>
    table
      .locator('.mach-pane--center .mach-row[data-id]')
      .evaluateAll(rows =>
        rows
          .sort(
            (a, b) =>
              Number((a as HTMLElement).dataset.index) -
              Number((b as HTMLElement).dataset.index)
          )
          .map(row => (row as HTMLElement).dataset.id)
      )
  const handle = table.locator(
    '.mach-row[data-id="PLAN-6"] .mach-row-drag-handle'
  )
  await handle.focus()
  await page.keyboard.press('Alt+ArrowUp')
  await expect
    .poll(async () => (await order()).slice(4, 6))
    .toEqual(['PLAN-6', 'PLAN-5'])
  await page.keyboard.press('Alt+ArrowDown')
  await expect
    .poll(async () => (await order()).slice(4, 7))
    .toEqual(['PLAN-5', 'PLAN-6', 'PLAN-7'])
  // 下一行属于另一产线；键盘调整与指针拖放复用相同的业务约束。
  await page.keyboard.press('Alt+ArrowDown')
  await expect
    .poll(async () => (await order()).slice(4, 7))
    .toEqual(['PLAN-5', 'PLAN-6', 'PLAN-7'])
  await expect(
    table.locator('.mach-row[data-id="PLAN-2"] .mach-row-drag-handle')
  ).toBeDisabled()
  await table.locator('.mach-row[data-id="PLAN-5"] .mach-row-checkbox').check()
  await page.getByRole('button', { name: '下达选中计划', exact: true }).click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '确认下达', exact: true })
    .click()
  await expect(
    table.locator('.mach-pane--center .mach-row[data-id="PLAN-5"]')
  ).toHaveAttribute('data-row-tone', 'warning')
  await expect(page.locator('.ps-status-line')).toContainText('已下达 1 项计划')
  const search = page.locator('.ps-search')
  await field(search, '计划 / 客户')
    .getByRole('textbox')
    .fill('PP-20261029-005')
  await expect(table).toContainText('18 项')
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(table).toContainText('1 项')
  await table
    .getByRole('button', { name: 'PP-20261029-005', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'PP-20261029-005 · 计划协同' })
  ).toBeVisible()
  await page.getByRole('button', { name: '查看产能负荷', exact: true }).click()
  await expect(page.locator('.plan-capacity')).toContainText('2 号连铸机')
})

test('实绩保留成分偏差、跨炉次保存快照和未保存切换保护', async ({ page }) => {
  await page.setViewportSize({ width: 1720, height: 1200 })
  await openPage(
    page,
    '/#/production-sales/production-actual',
    'production-actual'
  )
  const carbon = field(
    page.locator('[data-section="chemistry"]'),
    '碳 C'
  ).locator('input')
  await carbon.fill('0.6')
  await carbon.press('Tab')
  await expect(
    page.locator('.actual-chemistry-grid .mach-row[data-id="carbon"]')
  ).toHaveAttribute('data-row-tone', 'danger')
  await page.getByRole('button', { name: '保存实绩', exact: true }).click()
  await expect(page.locator('.ps-status-line')).toContainText(
    '1 项成分偏差待复核'
  )
  await page
    .locator('.actual-heat-list button')
    .filter({ hasText: 'L261029102' })
    .click()
  await expect(page.locator('.actual-context h2')).toHaveText('L261029102')
  await page
    .locator('.actual-heat-list button')
    .filter({ hasText: 'L261029101' })
    .click()
  await expect(carbon).toHaveValue('0.600')
  await carbon.fill('0.19')
  await carbon.press('Tab')
  await page
    .locator('.actual-heat-list button')
    .filter({ hasText: 'L261029102' })
    .click()
  await expect(
    page.getByText('当前炉次有未保存实绩', { exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: '保留当前炉次', exact: true }).click()
  await expect(page.locator('.actual-context h2')).toHaveText('L261029101')
})

test('发运库存守恒、超载阻止、装车和出厂状态流转，空态为淡蓝', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1720, height: 1200 })
  await openPage(page, '/#/production-sales/shipping', 'shipping-workbench')
  await page.getByRole('button', { name: '生成装车单', exact: true }).click()
  await expect(page.locator('.ps-status-line')).toContainText(
    '重量需与发运计划一致'
  )
  await page.getByRole('button', { name: '推荐配载', exact: true }).click()
  await expect(page.locator('.shipping-stock .ps-toolbar')).toContainText(
    '22.800 t'
  )
  const capacity = field(page.locator('.shipping-vehicle'), '额定载重').locator(
    'input'
  )
  await capacity.fill('20')
  await capacity.press('Tab')
  await page.getByRole('button', { name: '生成装车单', exact: true }).click()
  await expect(page.locator('.ps-status-line')).toContainText(
    '超过车辆额定载重'
  )
  await capacity.fill('32')
  await capacity.press('Tab')
  await page.getByRole('button', { name: '生成装车单', exact: true }).click()
  await expect(page.locator('.ps-status-line')).toContainText('已生成装车单')
  await expect(
    page.getByRole('button', { name: '生成装车单', exact: true })
  ).toBeDisabled()
  await page.getByRole('button', { name: '确认出厂', exact: true }).click()
  await page
    .locator('.n-dialog')
    .getByRole('button', { name: '确认出厂', exact: true })
    .click()
  await expect(page.locator('.ps-status-line')).toContainText('已确认出厂')
  const search = page.locator('.ps-search')
  await field(search, '发运单 / 客户').getByRole('textbox').fill('无此发运单')
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  const empty = page.locator('.shipping-queue .n-empty__icon')
  await expect(empty).toBeVisible()
  expect(await empty.evaluate(element => getComputedStyle(element).color)).toBe(
    'rgb(166, 197, 235)'
  )
  await page.screenshot({
    path: info.outputPath('shipping-empty-light.png'),
    animations: 'disabled',
  })
})

test('旧工作台入口转到产销模块，四个业务页经 tags 往返不白屏', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1720, height: 1200 })
  await openPage(page, '/#/demo/business-workbench', 'business-workbench')
  await expect(page).toHaveURL(/#\/production-sales\/sales-orders$/)
  await expect(page.getByTestId('business-workbench')).toBeVisible()
  // 初始化目标后使用真实标签往返；导航具有先后依赖。
  /* eslint-disable no-await-in-loop */
  for (const item of pages) {
    await navigate(page, `/production-sales/${item.path}`)
    await expect(page.getByTestId(item.root)).toBeVisible()
  }
  for (const item of [...pages].reverse()) {
    await page
      .locator(`.tags-track [data-path="/production-sales/${item.path}"]`)
      .click()
    await expect(page.getByTestId(item.root)).toBeVisible()
    await expect(
      page.getByRole('heading', { name: item.title, exact: true })
    ).toBeVisible()
  }
  /* eslint-enable no-await-in-loop */
})
