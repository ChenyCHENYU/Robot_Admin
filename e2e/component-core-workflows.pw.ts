/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-20
 * @FilePath: \\Robot_Admin\\e2e\\component-core-workflows.pw.ts
 * @Description: 正式组件包的查找、分页、草稿与导出回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { readFile } from 'node:fs/promises'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

/** 操作组件分页器而非修改应用内部状态。 */
const goToPage = (container: Locator, pageNumber: number) =>
  container
    .locator('.n-pagination-item:not(.n-pagination-item--button)')
    .filter({ hasText: new RegExp(`^${pageNumber}$`) })
    .click()

test('搜索时选择值先留在草稿中，提交共享筛选并重置两个页签', async ({
  page,
}) => {
  await page.goto('/#/preview/form-search')
  const demo = page.getByRole('region', { name: '多列客户选择与共享查询' })
  const result = demo.getByTestId('tabbed-query-result')
  const tabLabels = demo.locator('.c-tabs__label')
  const pending = tabLabels.getByText('待处理', { exact: true })
  const done = tabLabels.getByText('已处理', { exact: true })
  await expect(result).toHaveText('匹配 24 条 · 第 1 页')
  await goToPage(demo, 2)
  await expect(demo.getByText('PD-005', { exact: true })).toBeVisible()
  await done.click()
  await expect(demo.getByText('DN-001', { exact: true })).toBeVisible()
  await goToPage(demo, 3)
  await expect(demo.getByText('DN-009', { exact: true })).toBeVisible()
  await pending.click()
  await expect(demo.getByText('PD-005', { exact: true })).toBeVisible()

  const picker = demo.getByPlaceholder('选择客户（支持编号、名称搜索）')
  await picker.fill('0001')
  const options = page.locator('.n-popover').filter({ hasText: '客户编码' })
  await expect(options.getByText('云岭装备', { exact: true })).toBeVisible()
  await expect(options.getByText('越泽新材', { exact: true })).toHaveCount(0)
  await picker.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(picker).toHaveValue('0001 · 云岭装备')
  await expect(result).toHaveText('匹配 24 条 · 第 2 页')

  await demo.getByRole('button', { name: '搜索', exact: true }).click()
  await expect(result).toHaveText('匹配 6 条 · 第 1 页')
  await done.click()
  await expect(demo.getByText('DN-001', { exact: true })).toBeVisible()
  await expect(result).toHaveText('匹配 6 条 · 第 1 页')

  // 待处理请求更慢，快速切回已处理后迟到结果不能重新出现。
  await pending.click()
  await done.click()
  await expect(demo.getByText('DN-001', { exact: true })).toBeVisible()
  await expect
    .poll(async () => {
      await new Promise(resolve => setTimeout(resolve, 280))
      return demo.getByText('PD-001', { exact: true }).count()
    })
    .toBe(0)
})

test('同一个表单弹窗可保留草稿、确认换单，再重开验证保存', async ({ page }) => {
  await installMockAdminSession(page)
  await page.goto('/#/demo/form-manage/form-modal')
  const open = page.getByRole('button', { name: '打开模态框', exact: true })
  await open.click()
  const modal = page.locator('.c-form-modal')
  const username = modal.getByPlaceholder('请输入用户名')
  const switchRecord = modal.getByRole('button', { name: '切换到另一条记录' })
  await expect(username).toHaveValue('lin_qi')
  await username.fill('draft_01')
  await page.keyboard.press('Escape')
  await expect(
    page.getByText('放弃未保存的修改？', { exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: '继续编辑', exact: true }).click()
  await expect(username).toHaveValue('draft_01')

  await switchRecord.click()
  await page.getByRole('button', { name: '放弃修改', exact: true }).click()
  await expect(modal).toContainText('记录 2')
  await expect(username).toHaveValue('zhang_yu')
  await switchRecord.click()
  await expect(username).toHaveValue('lin_qi')
  await username.fill('saved_01')
  await modal.getByRole('button', { name: '保存用户资料', exact: true }).click()
  await expect(modal).not.toBeVisible()
  await open.click()
  await expect(username).toHaveValue('saved_01')
})

/** 读取实际下载文件里的员工编号，验证不同范围的数据内容。 */
async function getExportedEmployees(page: Page, demo: Locator, option: string) {
  await demo.getByRole('button', { name: '导出', exact: true }).click()
  const pending = page.waitForEvent('download')
  await page.getByText(option, { exact: true }).click()
  const download = await pending
  const csv = await readFile(await download.path(), 'utf8')
  return [...csv.matchAll(/employee(\d+)@example\.com/g)]
    .map(match => Number(match[1]))
    .sort((a, b) => a - b)
}

test('导出本页、跨页勾选和全部匹配得到不同的 CSV', async ({ page }) => {
  await page.goto('/#/preview/table')
  await page
    .locator('.n-tabs-tab')
    .filter({ hasText: /^按范围导出$/ })
    .click()
  const demo = page.getByTestId('table-export-scope-demo')
  await demo.locator('.n-select').click()
  await page
    .locator('.n-base-select-option')
    .getByText('技术部', { exact: true })
    .click()
  await expect(demo.getByRole('status')).toHaveText('匹配 12 条记录')

  await demo
    .getByRole('row', { name: /employee1@example\.com/ })
    .getByRole('checkbox')
    .click()
  await goToPage(demo, 2)
  await demo
    .getByRole('row', { name: /employee21@example\.com/ })
    .getByRole('checkbox')
    .click()

  expect(await getExportedEmployees(page, demo, '导出本页')).toEqual([
    21, 25, 29, 33, 37,
  ])
  expect(await getExportedEmployees(page, demo, '导出已选行')).toEqual([1, 21])
  expect(await getExportedEmployees(page, demo, '导出全部匹配结果')).toEqual([
    1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45,
  ])
})
