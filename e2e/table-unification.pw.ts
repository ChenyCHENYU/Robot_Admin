/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @FilePath: \Robot_Admin\e2e\table-unification.pw.ts
 * @Description: 验证业务、预览和演示表格统一使用组件，表头和数据默认居中
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect, type Locator } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { utils, write, read } from 'xlsx'
import { installMockAdminSession } from './auth-fixture'

/** 检查真实渲染结果，避免只检查模板标签而漏掉列配置或样式覆盖。 */
const expectCenteredTable = async (table: Locator) => {
  await expect(table.locator('thead th').first()).toBeVisible()
  const alignment = await table
    .locator('thead th, tbody td:not([colspan])')
    .evaluateAll(cells => cells.map(cell => getComputedStyle(cell).textAlign))
  expect(alignment.length).toBeGreaterThan(0)
  expect(alignment.every(value => value === 'center')).toBe(true)
}

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1480, height: 1000 })
})

for (const route of [
  '/sys-manage/dictionary-manage',
  '/sys-manage/user-manage',
  '/sys-manage/role-manage',
  '/sys-manage/permission-manage',
  '/account/activity-log',
  '/account/security',
  '/about',
  '/hooks/copy-text',
  '/hooks/download-all',
  '/hooks/excel-all',
  '/directives/watermark-direct',
  '/dashboard/analysis',
  '/dashboard/statistics',
  '/large-screen/production-cost',
]) {
  test(`${route} 的表头与单元格统一居中`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/#${route}`)
    if (route === '/directives/watermark-direct') {
      await page
        .locator('.n-tabs-tab')
        .filter({ hasText: /^数据表格$/ })
        .click()
    }
    const tables = page.locator('.c-table-wrapper')
    await expect(tables.first()).toBeVisible()
    await Promise.all((await tables.all()).map(expectCenteredTable))
    // 页面上的 Naive 表格全部位于共享组件内部。
    expect(await page.locator('.n-data-table').count()).toBe(
      await tables.locator('.n-data-table').count()
    )
    if (route === '/large-screen/production-cost') {
      const colors = await tables
        .locator('.cost-ledger-link')
        .first()
        .evaluate(element => ({
          button: getComputedStyle(element).color,
          cell: getComputedStyle(element.closest('td')!).color,
        }))
      expect(colors.button).toBe(colors.cell)
    }
    expect(errors).toEqual([])
    if (
      [
        '/sys-manage/dictionary-manage',
        '/large-screen/production-cost',
      ].includes(route)
    ) {
      await expect(page.locator('.app-loading')).toBeHidden()
      await page.screenshot({ path: testInfo.outputPath('centered-table.png') })
    }
  })
}

test('树形表格迁移后可收起与展开子节点，数据保持居中', async ({ page }) => {
  await page.goto('/#/demo/table-manage/table')
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^树形表格$/ })
    .click()
  const table = page.locator('.c-table-wrapper').last()
  await expectCenteredTable(table)
  const rows = await table.locator('tbody tr').count()
  await table.locator('.n-data-table-expand-trigger').first().click()
  await expect(table.locator('tbody tr')).not.toHaveCount(rows)
  await table.locator('.n-data-table-expand-trigger').first().click()
  await expect(table.locator('tbody tr')).toHaveCount(rows)
})

test('账户记录分页和筛选继续使用同一状态', async ({ page }) => {
  await page.goto('/#/account/activity-log')
  const table = page.locator('.c-table-wrapper')
  await expect(table.locator('tbody tr')).toHaveCount(10)
  await table.locator('.n-pagination-item').filter({ hasText: /^2$/ }).click()
  await expect(table.locator('.n-pagination-item--active')).toHaveText('2')
  const latestTime = await table
    .locator('tbody tr')
    .last()
    .locator('td')
    .first()
    .innerText()
  await table.locator('.n-pagination-item').filter({ hasText: /^1$/ }).click()
  await table.getByRole('columnheader', { name: '时间', exact: true }).click()
  await table.getByRole('columnheader', { name: '时间', exact: true }).click()
  await expect(
    table.locator('tbody tr').first().locator('td').first()
  ).toHaveText(latestTime)
  await page.getByPlaceholder('搜索操作描述、模块名称...').fill('用户登录系统')
  await page.getByRole('button', { name: '查询', exact: true }).click()
  await expect(table.locator('.n-pagination-item--active')).toHaveText('1')
  await expect(table.locator('tbody')).toContainText('用户登录系统')
  await expectCenteredTable(table)
})

test('视频播放器的三组接口文档全部使用居中表格', async ({ page }) => {
  await page.goto('/#/plugins/video-player')
  await page.getByText('Props 属性', { exact: true }).click()
  await page.getByText('Events 事件', { exact: true }).click()
  await page.getByText('Expose 方法（ref 调用）', { exact: true }).click()
  const tables = page.locator('.c-table-wrapper')
  await expect(tables).toHaveCount(3)
  await Promise.all((await tables.all()).map(expectCenteredTable))
})

test('关于页末页与筛选后分页器位置保持一致', async ({ page }) => {
  await page.goto('/#/about')
  const section = page.locator('.about-dependencies').first()
  const pagination = section.locator('.n-pagination')
  await expect(pagination).toBeVisible()
  await pagination.scrollIntoViewIfNeeded()
  const before = (await pagination.boundingBox())!
  const beforeOffset = before.y - (await section.boundingBox())!.y
  const items = pagination.locator(
    '.n-pagination-item:not(.n-pagination-item--button)'
  )
  await items.last().click()
  const afterOffset =
    (await pagination.boundingBox())!.y - (await section.boundingBox())!.y
  expect(Math.abs(afterOffset - beforeOffset)).toBeLessThan(2)
  await expectCenteredTable(section.locator('.c-table-wrapper'))
})

test('表单数据预览沿用统一表格，字段和状态仍可查看', async ({ page }) => {
  await page.goto('/#/demo/form-manage/form')
  await page.getByRole('button', { name: '填充测试', exact: true }).click()
  await page.getByRole('button', { name: '预览数据', exact: true }).click()
  const preview = page.locator('.modal-content')
  await preview.getByRole('button', { name: /表格/ }).click()
  const table = preview.locator('.c-table-wrapper')
  await expect(table.locator('tbody')).toContainText('已填写')
  await expectCenteredTable(table)
})

test('角色用户弹窗与权限治理子页同样居中', async ({ page }) => {
  await page.goto('/#/sys-manage/role-manage')
  await page.getByRole('button', { name: '1 人', exact: true }).click()
  const userTable = page.locator('.n-dialog .c-table-wrapper')
  await expect(userTable.locator('tbody tr').first()).toBeVisible()
  await expectCenteredTable(userTable)
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await page.goto('/#/sys-manage/permission-manage')
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^数据权限$/ })
    .click()
  await expectCenteredTable(page.locator('.c-table-wrapper').last())
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^临时授权$/ })
    .click()
  const authorizationTable = page.locator('.c-table-wrapper').last()
  await expectCenteredTable(authorizationTable)
  expect(
    await authorizationTable
      .locator('tbody .n-space')
      .evaluateAll(elements =>
        elements.every(
          element => getComputedStyle(element).justifyContent === 'center'
        )
      )
  ).toBe(true)
})

test('Excel 导入、处理预览与历史统一居中，导出数据不包含展示行键', async ({
  page,
}) => {
  const workbook = utils.book_new()
  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet([
      { 姓名: '张三', 部门: '技术部', 薪资: 8000 },
      { 姓名: '李四', 部门: '设计部', 薪资: 9000 },
    ]),
    '员工'
  )
  await page.goto('/#/hooks/excel-all')
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: 'table-verification.xlsx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: write(workbook, { type: 'buffer', bookType: 'xlsx' }),
    })
  await expect(page.locator('.preview-table tbody')).toContainText('张三')
  await page.getByRole('button', { name: '筛选非空行', exact: true }).click()
  const tables = page.locator('.c-table-wrapper')
  await expect(tables).toHaveCount(3)
  await Promise.all((await tables.all()).map(expectCenteredTable))
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出处理结果', exact: true }).click()
  const exported = read(await readFile((await (await downloadPromise).path())!))
  const rows = utils.sheet_to_json<Record<string, unknown>>(
    exported.Sheets[exported.SheetNames[0]]
  )
  expect(rows).toHaveLength(2)
  expect(rows.every(row => !Object.hasOwn(row, '__previewRowKey'))).toBe(true)
})
