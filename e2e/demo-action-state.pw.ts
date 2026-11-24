/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\e2e\demo-action-state.pw.ts
 * @Description: 通过真实页面验证排序、步骤、权限和甘特任务动作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

test('列表拖动松手后更新任务顺序与序号', async ({ page }) => {
  await page.goto('/#/directives/drag-direct')
  await page.getByText('列表排序', { exact: true }).click()
  const rows = page.locator('.drag-list-item')
  await expect(rows).toHaveCount(5)
  const first = rows.filter({ hasText: '首页设计' })
  await first.hover()
  const bounds = (await first.boundingBox())!
  await page.mouse.down()
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2 + 140,
    { steps: 5 }
  )
  await page.mouse.up()
  await expect(rows.nth(0)).toContainText('用户登录')
  await expect(rows.nth(1)).toContainText('数据管理')
  await expect(rows.nth(2)).toContainText('首页设计')
  await expect(rows.nth(2).locator(':scope > div').last()).toHaveText('3')
})

test('注册最后一步显示明确的完成状态，仍可返回上一步', async ({ page }) => {
  await page.goto('/#/demo/steps')
  const details = page.locator('.step-detail')
  const next = details.getByRole('button', { name: '下一步' })
  await next.click()
  await expect(details.getByRole('heading')).toHaveText('验证邮箱')
  await next.click()
  await expect(details.getByRole('heading')).toHaveText('完善资料')
  await next.click()
  await expect(details.getByRole('heading')).toHaveText('注册成功')
  await expect(details.getByRole('button', { name: '已完成' })).toBeDisabled()
  await details.getByRole('button', { name: '上一步' }).click()
  await expect(details.getByRole('heading')).toHaveText('完善资料')
})

test('切换角色同步刷新操作权限与反馈', async ({ page }) => {
  await page.goto('/#/directives/permission-direct')
  await page.getByText('只读用户', { exact: true }).click()
  const edit = page.locator('.demo-row').filter({
    has: page.getByRole('button', { name: '✏️ 编辑用户', exact: true }),
  })
  await expect(edit.locator('.status-denied')).toHaveText('❌ 无权限')
  await expect(edit.getByRole('button')).toBeDisabled()
  await page.getByText('超级管理员', { exact: true }).click()
  await expect(edit.locator('.status-granted')).toHaveText('✅ 有权限')
  await edit.getByRole('button').click()
  await expect(page.getByText('执行操作: 编辑用户', { exact: true })).toBeVisible()
})

test('选中甘特任务详情跟随同一条记录的进度更新', async ({ page }) => {
  await page.goto('/#/plugins/v-table-gantt')
  await page
    .locator('.gantt-task-list')
    .getByRole('button', { name: /功能开发/ })
    .click()
  const details = page.locator('.gantt-inspector')
  await expect(details.getByRole('heading', { name: '功能开发' })).toBeVisible()
  await expect(details.getByText('0%', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '更新进度', exact: true }).click()
  await expect(details.getByText('10%', { exact: true })).toBeVisible()
})
