/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-05
 * @FilePath: \Robot_Admin\e2e\sales-contract-review.pw.ts
 * @Description: 验证销售订单合同内联比对、草稿冲突及部分采纳
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from '@playwright/test'
import { installMockAdminSession } from './auth-fixture'

test('合同字段在工作台内选择性采纳，旧预览不能覆盖新草稿', async ({
  page,
}, testInfo) => {
  await installMockAdminSession(page)
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.goto('/#/production-sales/sales-orders')
  const draftStatus = page.getByTestId('draft-status')
  await expect(draftStatus).toHaveText('已保存')
  const order = page.getByRole('region', { name: '订单主档' })
  const open = order.getByRole('button', { name: '比对合同' })
  await open.click()
  const review = page.getByRole('region', { name: '合同版本比对' })
  await expect(review.getByRole('heading')).toBeFocused()
  await expect(review.getByText(/补充协议 02 · 本地合同样例/)).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    review.getByRole('row', { name: /钢种/ }).getByText('一致')
  ).toBeVisible()
  const adopt = review.getByRole('button', { name: '采纳所选字段' })
  await expect(adopt).toBeDisabled()
  const delivery = review.getByRole('checkbox', { name: '采纳交货日期' })
  await delivery.check()
  await review.getByRole('checkbox', { name: '采纳订单备注' }).check()
  await review.screenshot({
    path: testInfo.outputPath('contract-review.png'),
    animations: 'disabled',
  })
  const note = order
    .locator('.n-form-item')
    .filter({ hasText: '订单备注' })
    .getByRole('textbox')
  await note.fill('现场录入，先核对到货窗口')
  await adopt.click()
  await expect(review.getByRole('alert')).toHaveText(/草稿已变更/)
  const date = order
    .locator('.n-form-item')
    .filter({ hasText: '交货日期' })
    .getByRole('textbox')
  await expect(date).toHaveValue('2026-11-01')

  await review.getByRole('button', { name: '刷新比对' }).click()
  await expect(adopt).toBeDisabled()
  await delivery.check()
  await adopt.click()
  await expect(review).toHaveCount(0)
  await expect(open).toBeFocused()
  await expect(note).toHaveValue('现场录入，先核对到货窗口')
  await expect(date).toHaveValue('2026-11-05')
  await expect(draftStatus).toHaveText('有未保存修改')
  await expect(page.getByTestId('workbench-status')).toContainText(
    '已采纳 1 个字段到订单草稿'
  )
})
