/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-05
 * @FilePath: \Robot_Admin\tests\shipping-report.test.ts
 * @Description: 验证发运汇总的维度分组、精确重量与下钻任务集合
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { summarizeShipments } from '../src/views/production-sales/shipping/c_report/data'
import { createShipments } from '../src/views/production-sales/shipping/data'

test('发运汇总按实际维度归并任务，以整数千克守恒', () => {
  const tasks = createShipments()
  const { groups, totals } = summarizeShipments(tasks, [
    'destination',
    'status',
  ])
  expect(groups).toHaveLength(9)
  expect(totals).toEqual({
    count: 12,
    departedCount: 3,
    plannedKg: 329700,
    departedKg: 93900,
  })
  expect(groups.reduce((kg, group) => kg + group.plannedKg, 0)).toBe(
    totals.plannedKg
  )
  expect(groups[0].dimensions).toEqual(['南京港', 'waiting'])
  expect(groups[0].tasks.map(task => task.id)).toEqual(['SHIP-1', 'SHIP-4'])
  expect(groups[0].plannedKg).toBe(48150)
  expect(summarizeShipments(tasks, ['destination']).groups).toHaveLength(3)
})

test('发运汇总使用任务池筛选范围，零维度返回总计，空结果保持空态', () => {
  const matching = createShipments().filter(task => task.status === 'departed')
  const { groups, totals } = summarizeShipments(matching, [])
  expect(groups).toEqual([
    { ...totals, key: '[]', dimensions: [], tasks: matching },
  ])
  expect(totals.departedKg).toBe(totals.plannedKg)
  expect(summarizeShipments([], ['customer']).groups).toEqual([])
  expect(summarizeShipments([], []).totals).toEqual({
    count: 0,
    departedCount: 0,
    plannedKg: 0,
    departedKg: 0,
  })
})
