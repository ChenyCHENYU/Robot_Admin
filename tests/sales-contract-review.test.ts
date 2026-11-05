/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-05
 * @FilePath: \Robot_Admin\tests\sales-contract-review.test.ts
 * @Description: 合同逐字段采纳的选择、草稿冲突和订单身份回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  formatContractValue,
  previewContractReview,
  resolveContractReview,
} from '../src/views/production-sales/sales-orders/contractReview'
import { createBusinessOrders } from '../src/views/production-sales/sales-orders/data'

test('合同预览区分一致、差异与空值，仅返回所选差异字段', () => {
  const draft = createBusinessOrders()[0].header
  const preview = previewContractReview(draft)!
  expect(preview.rows.map(row => [row.key, row.status])).toEqual([
    ['grade', 'same'],
    ['section', 'different'],
    ['delivery', 'different'],
    ['targetWeight', 'different'],
    ['note', 'missing'],
  ])
  expect(resolveContractReview(draft, preview, ['grade'])).toBeNull()
  expect(resolveContractReview(draft, preview, [])).toBeNull()
  expect(
    resolveContractReview({ ...draft, owner: '新的业务草稿' }, preview, [
      'targetWeight',
    ])
  ).toEqual({ targetWeight: 136.5 })
  expect(draft.targetWeight).toBe(128)
  expect(formatContractValue(0)).toBe('0.000')
  expect(formatContractValue(null)).toBe('未填写')
})

test('选中字段已有新草稿时拒绝整个批次，且不能将旧预览用到另一张单据', () => {
  const [first, second, third] = createBusinessOrders()
  const preview = previewContractReview(first.header)!
  const edited = { ...first.header, note: '新录入的订单备注' }
  expect(
    resolveContractReview(edited, preview, ['delivery', 'note'])
  ).toBeNull()
  expect(edited.delivery).toBe('2026-11-01')
  expect(resolveContractReview(edited, preview, ['delivery'])).toEqual({
    delivery: '2026-11-05',
  })
  expect(resolveContractReview(second.header, preview, ['delivery'])).toBeNull()
  expect(previewContractReview(third.header)).toBeNull()
  const anotherContract = { ...first.header, contractNo: 'HT-999' }
  expect(previewContractReview(anotherContract)).toBeNull()
  expect(
    resolveContractReview(anotherContract, preview, ['delivery'])
  ).toBeNull()
  expect(
    resolveContractReview({ ...first.header, status: 1 }, preview, ['delivery'])
  ).toBeNull()
})
