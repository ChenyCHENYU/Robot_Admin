/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\e2e\permission-management.pw.ts
 * @Description: 权限导入整批确认与治理配置刷新持久性回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 通过真实文件选择入口导入 JSON。 */
async function importRecords(page: Page, records: unknown[]) {
  const chooser = page.waitForEvent('filechooser')
  await page
    .locator('.header-card')
    .getByRole('button', { name: /导入$/ })
    .click()
  await (
    await chooser
  ).setFiles({
    name: 'permissions.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(records)),
  })
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/sys-manage/permission-manage')
  await expect(page.locator('.c-table-wrapper').first()).toHaveAttribute(
    'aria-busy',
    'false'
  )
})

test('权限导入取消不写入，确认后保留停用状态，刷新不丢失', async ({ page }) => {
  const record = {
    name: '导入回归权限',
    code: 'system:import_regression',
    type: 'button',
    module: 'system',
    status: 0,
    sort: 0,
    resources: ['POST /sys/import-regression'],
  }
  const row = page.locator('tbody tr').filter({ hasText: record.code })
  await importRecords(page, [record])
  const confirmation = page
    .getByRole('dialog')
    .filter({ hasText: '确认导入权限' })
  await expect(confirmation).toContainText('已校验 1 条权限')
  await confirmation.getByRole('button', { name: '取消', exact: true }).click()
  await expect(confirmation).toHaveCount(0)
  await expect(row).toHaveCount(0)
  await importRecords(page, [record])
  await confirmation
    .getByRole('button', { name: '确认导入', exact: true })
    .click()
  await expect(row).toContainText(record.name)
  await expect(row.locator('.permission-status')).toHaveText('禁用')
  await page
    .locator('.header-card')
    .getByRole('button', { name: /刷新$/ })
    .click()
  await expect(page.locator('.c-table-wrapper').first()).toHaveAttribute(
    'aria-busy',
    'false'
  )
  await expect(row.locator('.permission-status')).toHaveText('禁用')
})

test('第二条权限不合法时整批拒绝，第一条也不能写入', async ({ page }) => {
  const record = {
    name: '不应写入的权限',
    code: 'system:invalid_batch',
    type: 'api',
    module: 'system',
    status: 1,
    sort: 0,
    resources: [],
  }
  await importRecords(page, [
    record,
    { ...record, code: 'system:invalid_status', status: '0' },
  ])
  await expect(
    page.getByText('第 2 条权限状态必须为数值 0 或 1', { exact: true })
  ).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.locator('tbody tr').filter({ hasText: record.code })
  ).toHaveCount(0)
})

test('未实现的数据范围和字段规则明确只读，刷新后仍不能保存', async ({
  page,
}) => {
  await expect(
    page.getByText(
      '数据范围为有效角色的只读摘要；字段规则与通用约束尚不支持保存。临时授权按成员授予现有角色。'
    )
  ).toBeVisible()
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^数据权限$/ })
    .click()
  const table = page.locator('.c-table-wrapper').last()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(
    page.getByText(
      'Mock 字段权限数据仅用于演示，不代表远程服务已接入字段权限模型。'
    )
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /新增规则$/ })).toBeDisabled()
  const row = table.locator('tbody tr').first()
  await expect(
    row.getByRole('button', { name: '配置字段', exact: true })
  ).toBeDisabled()
  await expect(
    row.getByRole('button', { name: '修改范围', exact: true })
  ).toBeDisabled()
  await page
    .locator('.header-card')
    .getByRole('button', { name: /刷新$/ })
    .click()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(
    row.getByRole('button', { name: '修改范围', exact: true })
  ).toBeDisabled()
})
