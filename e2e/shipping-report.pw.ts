/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-05
 * @FilePath: \Robot_Admin\e2e\shipping-report.pw.ts
 * @Description: 发运任务筛选、汇总维度、同层下钻与车辆草稿回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test('发运汇总重算维度并下钻，不影响车辆草稿或任务池范围', async ({
  page,
}, testInfo) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1600, height: 1050 })
  await page.goto('/#/production-sales/shipping')
  const workbench = page.getByTestId('shipping-workbench')
  await expect(workbench).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  const draft = workbench
    .getByRole('region', { name: '车辆安排' })
    .locator('.n-form-item')
    .filter({ hasText: '调度备注' })
    .getByRole('textbox')
  await draft.fill('等候现场复核')

  const openReport = workbench.getByRole('button', {
    name: '发运汇总',
    exact: true,
  })
  await openReport.click()
  const report = page.getByTestId('shipping-report')
  await expect(report).toContainText('共 12 笔')
  await expect(report).toContainText('329.700')
  await expect(report).toContainText('93.900')
  await expect(
    report.getByRole('button', { name: '查看', exact: true })
  ).toHaveCount(9)
  await report.getByRole('checkbox', { name: '客户', exact: true }).click()
  await expect(
    report.getByRole('button', { name: '查看', exact: true })
  ).toHaveCount(12)
  await page.screenshot({
    path: testInfo.outputPath('shipping-report.png'),
    animations: 'disabled',
  })
  await report.getByRole('checkbox', { name: '客户', exact: true }).click()

  await report.getByRole('checkbox', { name: '任务状态', exact: true }).click()
  await expect(
    report.getByRole('button', { name: '查看', exact: true })
  ).toHaveCount(3)
  await report
    .getByRole('row')
    .filter({ hasText: '南京港' })
    .getByRole('button', { name: '查看', exact: true })
    .click()
  await expect(report).toContainText('南京港 · 4 笔任务')
  await expect(report).toContainText('DN-261029-010')
  await report.getByRole('button', { name: '返回分组汇总' }).click()
  await report.getByRole('checkbox', { name: '目的地', exact: true }).click()
  await expect(
    report.getByRole('button', { name: '查看', exact: true })
  ).toHaveCount(1)
  await expect(report).toContainText('全部任务')
  await page.getByRole('button', { name: '关闭汇总', exact: true }).click()
  await expect(draft).toHaveValue('等候现场复核')

  await workbench.getByRole('button', { name: /04 · 已出厂/ }).click()
  await openReport.click()
  await expect(report).toContainText('共 3 笔')
  await expect(report.getByText('93.900', { exact: true })).toHaveCount(4)
  await page.getByRole('button', { name: '关闭汇总', exact: true }).click()

  const search = workbench.locator('.ps-search')
  await search.getByRole('textbox').fill('不存在的发运任务')
  await search.getByRole('button', { name: '搜索', exact: true }).click()
  await openReport.click()
  await expect(report).toContainText('当前筛选暂无发运任务')
})
