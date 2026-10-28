/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\tests\business-workbench.test.ts
 * @Description: 工作台示例的稳定身份、原始数值与分组汇总语义回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  createBusinessOrders,
  decimalMillis,
  getBatchSubmission,
  moneyCodec,
  quantityCodec,
  summarizeBusinessLines,
} from '../src/views/demo/59-business-workbench/data'

test('订单和明细拥有跨单据唯一的业务身份，零与空值保持不同', () => {
  const orders = createBusinessOrders()
  const ids = orders.flatMap(order => [
    order.header.id,
    ...order.lines.map(row => row.id),
  ])
  expect(new Set(ids).size).toBe(ids.length)
  expect(orders[0].header.customer).toBe('CU-001')
  expect(orders[0].lines[0].quantity).toBe('0')
  expect(orders[0].lines[2].quantity).toBeNull()
  expect(quantityCodec.format('0')).toBe('0.000')
  expect(quantityCodec.format(null)).toBe('—')
})

test('金额显示舍入不改原值，大数不经过Number转换', () => {
  expect(moneyCodec.parse('1.005')).toBe('1.005')
  expect(moneyCodec.format('1.005')).toBe('1.01')
  expect(moneyCodec.format('-1.005')).toBe('-1.01')
  expect(moneyCodec.parse('9007199254740993.005')).toBe('9007199254740993.005')
  expect(decimalMillis('9007199254740993.005')).toBe(9007199254740993005n)
  expect(() => decimalMillis('1.0001')).toThrow('三位')
})

test('当前明细先按原始精度合计再展示，且不混合不同币种单位', () => {
  const rows = createBusinessOrders()[0].lines
  expect(summarizeBusinessLines(rows)).toEqual([
    { key: 'CNY/t', count: 3, amount: '12,027.01', quantity: '12.125' },
  ])
  expect(
    summarizeBusinessLines([
      ...rows,
      {
        ...rows[0],
        id: 'USD-1',
        amount: '10.005',
        quantity: '1.25',
        currency: 'USD',
        unit: 'kg',
      },
    ])
  ).toEqual([
    { key: 'CNY/t', count: 3, amount: '12,027.01', quantity: '12.125' },
    { key: 'USD/kg', count: 1, amount: '10.01', quantity: '1.250' },
  ])
  expect(summarizeBusinessLines([])).toEqual([])
})

test('部分成功后的重试不重发成功项，失败草稿有新修改时拒绝旧预览', () => {
  const rows = createBusinessOrders()[0].lines
  const plan = {
    order: 'ORDER-1',
    keys: rows.map(row => row.id),
    patch: { note: null },
    before: new Map(rows.map(row => [row.id, row.note])),
  }
  expect(getBatchSubmission(plan, rows, [])).toEqual({
    keys: plan.keys,
    stale: false,
  })
  const patched: typeof rows = rows.map(row => ({ ...row, note: null }))
  const results = [
    { key: rows[0].id, status: 'success' as const },
    { key: rows[1].id, status: 'failure' as const, retryable: true },
    { key: rows[2].id, status: 'success' as const },
  ]
  expect(getBatchSubmission(plan, patched, results, plan.keys)).toEqual({
    keys: [rows[1].id],
    stale: false,
  })
  patched[1].note = '较新的业务草稿'
  expect(getBatchSubmission(plan, patched, results, [rows[1].id])).toEqual({
    keys: [rows[1].id],
    stale: true,
  })
  expect(patched[1].note).toBe('较新的业务草稿')
})
