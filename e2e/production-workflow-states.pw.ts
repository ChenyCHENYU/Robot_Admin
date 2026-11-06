/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-06
 * @FilePath: \Robot_Admin\e2e\production-workflow-states.pw.ts
 * @Description: 排产空态恢复、产能下钻与成分偏差闭环
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 等待业务工作区真实渲染。 */
const openProduction = async (page: Page, name: string) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1440, height: 1040 })
  await page.goto(`/#/production-sales/${name}`)
  const root = page.getByTestId(name)
  await expect(root).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  return root
}

/** 以同一工作区的字段标签定位实际输入。 */
const inputFor = (scope: Locator, label: string) =>
  scope
    .locator('.n-form-item')
    .filter({
      has: scope
        .page()
        .locator('.n-form-item-label')
        .filter({ hasText: label }),
    })
    .locator('input')

test('产能负荷下钻保留产线，排产无匹配可恢复且不显示无关炉次', async ({
  page,
}, info) => {
  const root = await openProduction(page, 'production-plan')
  const ledger = root.getByRole('region', { name: '排产计划台账' })
  const details = root.getByRole('region', { name: '计划协同详情' })
  const search = root.locator('.ps-search')
  await root.getByRole('button', { name: '查看产能负荷', exact: true }).click()
  const resource = details
    .locator('.plan-capacity > div')
    .filter({ hasText: '2 号连铸机' })
  await expect(resource).toContainText('1,297.500 / 1,470.000 t')
  await expect(resource).toContainText('88%')
  await resource.getByRole('button', { name: '查看产线计划' }).click()
  await expect(ledger).toContainText('6 项')
  await expect(ledger).toContainText('2# 连铸 · 板坯')
  await expect(details.getByRole('heading')).toHaveText(
    'PP-20261029-007 · 计划协同'
  )

  await inputFor(search, '计划 / 客户').fill('不存在的计划')
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  const empty = ledger.locator('.mach-empty')
  await expect(empty).toContainText('没有符合条件的计划')
  await expect(empty.locator('svg')).toBeVisible()
  await expect(details.getByText('暂无可关联的炉次编排')).toBeVisible()
  await expect(details.locator('.mach-row[data-id]')).toHaveCount(0)
  await ledger.screenshot({
    path: info.outputPath('production-plan-no-matches.png'),
  })

  await ledger.getByRole('button', { name: '清除台账筛选' }).click()
  await expect(inputFor(search, '计划 / 客户')).toHaveValue('')
  await expect(ledger).toContainText('6 项')
  await expect(ledger).toContainText('2# 连铸 · 板坯')
  await expect(empty).toHaveCount(0)
})

test('成分核对从超限记录定位录入，修正后显示明确空态并能恢复全部项目', async ({
  page,
}, info) => {
  const root = await openProduction(page, 'production-actual')
  const chemistry = root.getByRole('region', { name: '成分与判定' })
  const carbon = inputFor(chemistry, '碳 C')
  await carbon.fill('0.600')
  await carbon.press('Tab')
  await chemistry.getByRole('button', { name: '仅看成分偏差' }).click()
  const grid = chemistry.locator('.actual-chemistry-grid')
  const rows = grid.locator('.mach-pane--center .mach-row[data-id]')
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toHaveAttribute('data-id', 'carbon')
  await grid.getByRole('button', { name: '定位实测录入' }).click()
  await expect(carbon).toBeFocused()
  await carbon.fill('0.180')
  await carbon.press('Tab')
  const empty = grid.locator('.mach-empty')
  await expect(empty).toContainText('当前炉次无超限实测项')
  await expect(empty.locator('svg')).toBeVisible()
  await grid.screenshot({
    path: info.outputPath('chemistry-no-deviations.png'),
  })
  await chemistry.getByRole('button', { name: '显示全部项目' }).click()
  await expect(rows).toHaveCount(5)
  await expect(empty).toHaveCount(0)
  await expect(carbon).toHaveValue('0.180')
})
