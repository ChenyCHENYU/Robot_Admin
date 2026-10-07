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

test('字段和数据范围保存后重新加载仍保持最新配置', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^数据权限$/ })
    .click()
  const table = page.locator('.c-table-wrapper').last()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  const row = table.locator('tbody tr').first()
  await row.getByRole('button', { name: '配置字段', exact: true }).click()
  const card = page.locator('.field-permission-card').first()
  const visibleSwitch = card.getByRole('switch').first()
  const before = await visibleSwitch.getAttribute('aria-checked')
  await visibleSwitch.click()
  await page.getByRole('button', { name: '保存字段权限', exact: true }).click()
  const refresh = page
    .locator('.header-card')
    .getByRole('button', { name: /刷新$/ })
  await refresh.click()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await row.getByRole('button', { name: '配置字段', exact: true }).click()
  await expect(visibleSwitch).toHaveAttribute(
    'aria-checked',
    before === 'true' ? 'false' : 'true'
  )
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await row.getByRole('button', { name: '修改范围', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByText('仅本人', { exact: true }).click()
  await dialog.getByRole('button', { name: '确认', exact: true }).click()
  await expect(row).toContainText('仅本人')
  await refresh.click()
  await expect(table).toHaveAttribute('aria-busy', 'false')
  await expect(row).toContainText('仅本人')
  expect(errors).toEqual([])
})
