/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-05
 * @FilePath: \Robot_Admin\e2e\production-actual-trace.pw.ts
 * @Description: 炉次工序追踪、异常切换与返回实绩分区回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test('工序追踪按炉次筛选异常，窄屏时间轴可操作并保留实绩草稿', async ({
  page,
}, testInfo) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1400, height: 1000 })
  await page.goto('/#/production-sales/production-actual')
  const root = page.getByTestId('production-actual')
  await expect(root).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.app-loading,.c-page-loading')).toHaveCount(0)
  const traceButton = root.getByRole('button', {
    name: '工序追踪',
    exact: true,
  })
  const trace = root.getByRole('region', { name: '工序轨迹' })
  const chart = trace.getByRole('group', { name: '工序时间轴' })
  const exceptions = trace.getByRole('button', { name: '仅看异常' })
  const process = root.getByRole('region', { name: '炉况参数' })

  await traceButton.click()
  await expect(
    exceptions.locator('.n-button__icon svg[aria-hidden="true"] path')
  ).toBeVisible()
  await expect(process).toBeHidden()
  await expect(trace).toContainText('4 道工序 · 1 项异常')
  const blow = chart.getByRole('button', { name: /吹炼，08:07 至 08:28，异常/ })
  await blow.focus()
  await blow.press('Enter')
  await expect(blow).toHaveAttribute('aria-pressed', 'true')
  await expect(trace).toContainText('21 分钟')
  await expect(trace).toContainText('底吹压力短时波动')
  await page.screenshot({
    path: testInfo.outputPath('heat-trace.png'),
    animations: 'disabled',
  })
  await exceptions.click()
  await expect(chart.getByRole('button')).toHaveCount(1)

  await root.getByRole('button', { name: /L261029102/ }).click()
  await expect(exceptions).toHaveAttribute('aria-pressed', 'false')
  await expect(chart.getByRole('button')).toHaveCount(4)
  await expect(trace).toContainText('4 道工序 · 0 项异常')
  await expect(
    chart.getByRole('button', { name: /加料与兑铁，09:03 至 09:10/ })
  ).toBeVisible()
  await expect(trace).not.toContainText('底吹压力短时波动')
  await exceptions.click()
  await expect(trace.getByText('当前炉次暂无过程异常')).toBeVisible()
  await exceptions.click()

  await page.setViewportSize({ width: 430, height: 850 })
  await expect
    .poll(() => chart.evaluate(el => el.scrollWidth <= el.clientWidth))
    .toBe(true)
  await chart.getByRole('button', { name: /吹炼/ }).click()
  const showActual = trace.getByRole('button', { name: '查看对应实绩' })
  await showActual.click()
  await expect(trace).toBeHidden()
  await expect(process).toBeFocused()
  const pressure = process
    .locator('.n-form-item')
    .filter({ hasText: '底吹压力' })
    .locator('input')
  await pressure.fill('0.9')
  await pressure.press('Tab')
  await expect(root.getByText('有未保存实绩')).toBeVisible()
  await traceButton.click()
  await chart.getByRole('button', { name: /吹炼/ }).click()
  await showActual.click()
  await expect(pressure).toHaveValue('0.900')
})
