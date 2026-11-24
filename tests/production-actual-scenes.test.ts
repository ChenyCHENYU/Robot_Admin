/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\tests\production-actual-scenes.test.ts
 * @Description: 炉次只读对照分组、缺测值与保存快照隔离回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  createActualComparison,
  createActualRecord,
} from '../src/views/production-sales/production-actual/data'

test('三张实绩对照表按业务分区派生，零值、缺测与上一炉零值分别保留', () => {
  const model = { ...createActualRecord(), received: 0, scrap: null }
  const previous = { ...createActualRecord(), received: 0, scrap: 18 }
  const { groups, rows: referenceRows } = createActualComparison(
    model,
    previous
  )
  expect(referenceRows).toHaveLength(23)
  expect(referenceRows.some(row => row.id === 'carbon')).toBe(true)
  expect(groups.map(group => group.key)).toEqual([
    'charge',
    'energy',
    'process',
  ])
  expect(groups.map(group => group.rows.length)).toEqual([6, 6, 6])
  const rows = groups.flatMap(group => group.rows)
  expect(new Set(rows.map(row => row.id)).size).toBe(18)
  expect(rows.find(row => row.id === 'received')).toMatchObject({
    current: 0,
    previous: 0,
  })
  expect(rows.find(row => row.id === 'scrap')).toMatchObject({
    current: null,
    previous: 18,
  })
  expect(rows.some(row => row.id === 'carbon')).toBe(false)
})

test('首炉缺少上一炉快照时仍展示当前实绩，不伪造上一炉数值', () => {
  const model = { ...createActualRecord(), oxygen: 0 }
  const { groups, rows: referenceRows } = createActualComparison(model)
  const rows = groups.flatMap(group => group.rows)
  expect(referenceRows).toEqual([])
  expect(rows).toHaveLength(18)
  expect(rows.every(row => row.previous === null)).toBe(true)
  expect(rows.find(row => row.id === 'oxygen')?.current).toBe(0)
})

test('对照投影不写当前模型或上一炉保存快照，重算始终读取原值', () => {
  const model = Object.freeze(createActualRecord())
  const previous = Object.freeze({ ...createActualRecord(), received: 120 })
  const { groups } = createActualComparison(model, previous)
  Object.assign(groups[0].rows[0], { previous: 999, current: 999 })
  expect(model.received).toBe(122.8)
  expect(previous.received).toBe(120)
  expect(
    createActualComparison(model, previous).groups[0].rows[0]
  ).toMatchObject({ previous: 120, current: 122.8 })
})
