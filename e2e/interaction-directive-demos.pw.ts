/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\e2e\interaction-directive-demos.pw.ts
 * @Description: 防抖表单重置与节流真实操作的浏览器回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test.beforeEach(async ({ page }) => {
  await installMockAdminSession(page)
})

test('防抖表单重置取消待执行的指令和已开始的模拟提交', async ({ page }) => {
  await page.goto('/#/directives/debounce-direct')
  const submit = page.getByRole('button', { name: '提交表单 (防重复点击)' })
  const reset = page.getByRole('button', { name: '重置', exact: true })
  await expect(submit).toBeVisible()
  await page.clock.install()

  await submit.click()
  await reset.click()
  await page.clock.runFor(2100)
  await expect(page.getByText('提交次数: 0')).toBeVisible()
  await expect(page.getByText('模拟提交完成')).toHaveCount(0)

  await submit.click()
  await page.clock.runFor(1100)
  await expect(page.getByText('提交次数: 1')).toBeVisible()
  await reset.click()
  await page.clock.runFor(1100)
  await expect(page.getByText('模拟提交完成')).toHaveCount(0)

  await submit.click()
  await page.clock.runFor(2100)
  await expect(page.getByText('提交次数: 2')).toBeVisible()
  await expect(page.getByText('模拟提交完成')).toBeVisible()
})

test('节流分别保留前后缘，搜索使用已提交关键词且切换场景取消列表加载', async ({
  page,
}) => {
  await page.goto('/#/directives/throttle-direct')
  const first = page.getByRole('button', { name: '仅前缘执行 (500ms)' })
  const trailing = page.getByRole('button', { name: '仅后缘执行 (600ms)' })
  const firstCount = first.locator('..').getByText('执行计数:')
  const trailingCount = trailing.locator('..').getByText('执行计数:')
  await expect(first).toBeVisible()
  await page.clock.install()

  await first.click({ clickCount: 3 })
  await trailing.click({ clickCount: 3 })
  await expect(firstCount).toHaveText('执行计数: 1')
  await expect(trailingCount).toHaveText('执行计数: 0')
  await page.clock.runFor(650)
  await expect(firstCount).toHaveText('执行计数: 1')
  await expect(trailingCount).toHaveText('执行计数: 1')

  const keyword = page.getByPlaceholder('输入搜索关键词')
  await keyword.fill('前端性能')
  await page.getByRole('button', { name: '搜索 (节流 500ms)' }).click()
  await keyword.fill('Vue')
  await page.clock.runFor(900)
  await expect(page.getByText('关键词: 前端性能')).toBeVisible()
  await expect(page.getByText('前端性能优化之函数节流')).toBeVisible()
  await expect(page.getByText('Vue 3 节流指令使用指南')).toHaveCount(0)

  const scroll = page.getByText('滚动加载', { exact: true })
  await scroll.click()
  await page.getByRole('button', { name: '加载更多 (节流 800ms)' }).click()
  await page.getByText('搜索优化', { exact: true }).click()
  await page.clock.runFor(1100)
  await scroll.click()
  await expect(page.getByText('总数据: 6')).toBeVisible()
})
