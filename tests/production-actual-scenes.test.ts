/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\tests\production-actual-scenes.test.ts
 * @Description: 炉次只读对照分组、缺测值与保存快照隔离回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  createActualComparisonGroups,
  createActualRecord,
  type ActualComparisonRow,
} from '../src/views/production-sales/production-actual/data'

test('三张实绩对照表按业务分区派生，零值、缺测与上一炉零值分别保留', () => {
  const model = { ...createActualRecord(), received: 0, scrap: null }
  const references: ActualComparisonRow[] = [
    { id: 'received', name: '受钢量', previous: 0, current: 99 },
    { id: 'scrap', name: '废钢量', previous: 18, current: 20 },
    { id: 'unknown', name: '无关项目', previous: 1, current: 1 },
  ]
  const groups = createActualComparisonGroups(model, references)
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
  expect(rows.some(row => row.id === 'carbon' || row.id === 'unknown')).toBe(
    false
  )
})

test('首炉缺少上一炉快照时仍展示当前实绩，不伪造上一炉数值', () => {
  const model = { ...createActualRecord(), oxygen: 0 }
  const rows = createActualComparisonGroups(model, []).flatMap(
    group => group.rows
  )
  expect(rows).toHaveLength(18)
  expect(rows.every(row => row.previous === null)).toBe(true)
  expect(rows.find(row => row.id === 'oxygen')?.current).toBe(0)
})

test('对照投影不写当前模型或上一炉保存快照，重算始终读取原值', () => {
  const model = Object.freeze(createActualRecord())
  const previous = Object.freeze({
    id: 'received',
    name: '受钢量',
    previous: 120,
    current: model.received,
  })
  const references = Object.freeze([previous])
  const groups = createActualComparisonGroups(model, references)
  Object.assign(groups[0].rows[0], { previous: 999, current: 999 })
  expect(model.received).toBe(122.8)
  expect(previous.previous).toBe(120)
  expect(
    createActualComparisonGroups(model, references)[0].rows[0]
  ).toMatchObject({ previous: 120, current: 122.8 })
})
