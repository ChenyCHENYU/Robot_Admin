/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\tests\production-sales.test.ts
 * @Description: 产销本地业务状态、精度和记录隔离的回归契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import {
  createProductionPlans,
  releaseProductionPlans,
  filterProductionPlans,
  canReorderProductionPlan,
} from '../src/views/production-sales/production-plan/data'
import {
  createActualRecord,
  inspectChemistry,
} from '../src/views/production-sales/production-actual/data'
import {
  createShipments,
  createCargoLots,
  validateLoad,
} from '../src/views/production-sales/shipping/data'
import { EMPTY_STATE_COLORS } from '../src/config/theme/tokens'
import {
  lightThemeOverrides,
  darkThemeOverrides,
} from '../src/config/theme/naive-overrides'

test('计划下达仅作用于选中且待下达的记录，重复命令不回退状态', () => {
  const original = createProductionPlans()
  const selected = new Set(['PLAN-1', 'PLAN-2', 'PLAN-3'])
  const result = releaseProductionPlans(original, selected)
  expect(result[0].status).toBe('issued')
  expect(result[1].status).toBe('issued')
  expect(result[2].status).toBe('running')
  expect(original[0].status).toBe('draft')
  expect(result[4]).toBe(original[4])
  expect(releaseProductionPlans(result, selected)).toEqual(result)
})

test('计划查询明确组合产线、钢种、状态和班次，空查询保留原顺序', () => {
  const rows = createProductionPlans()
  const query = { keyword: '', grade: null, status: null, shift: null }
  expect(filterProductionPlans(rows, query, 'all')).toEqual(rows)
  expect(
    filterProductionPlans(
      rows,
      { ...query, keyword: 'PP-20261029-001' },
      'all'
    ).map(row => row.id)
  ).toEqual(['PLAN-1'])
  expect(
    filterProductionPlans(rows, query, 'CC2').every(row => row.line === 'CC2')
  ).toBe(true)
  expect(
    filterProductionPlans(rows, { ...query, grade: 'UNKNOWN' }, 'all')
  ).toEqual([])
})

test('计划顺序只允许待下达记录在同一产线与浇次内调整', () => {
  const rows = createProductionPlans()
  expect(canReorderProductionPlan(rows[5], rows[4])).toBe(true)
  expect(canReorderProductionPlan(rows[5], rows[6])).toContain('同一产线与浇次')
  expect(canReorderProductionPlan(rows[1], rows[0])).toContain('仅待下达')
  expect(
    canReorderProductionPlan(rows[0], { ...rows[0], cast: 'OTHER' })
  ).toContain('同一产线与浇次')
  expect(canReorderProductionPlan(rows[0], undefined)).toContain(
    '同一产线与浇次'
  )
})

test('炉次实绩快照独立，零与空值不同，成分偏差不替换真实测量', () => {
  const first = createActualRecord()
  const second = createActualRecord()
  first.carbon = 0.6
  expect(second.carbon).toBe(0.18)
  expect(
    inspectChemistry(first).find(row => row.id === 'carbon')
  ).toMatchObject({ value: 0.6, failed: true })
  first.phosphorus = 0
  first.sulfur = null
  expect(
    inspectChemistry(first).find(row => row.id === 'phosphorus')
  ).toMatchObject({ value: 0, failed: false })
  expect(
    inspectChemistry(first).find(row => row.id === 'sulfur')
  ).toMatchObject({ value: null, failed: false })
  first.carbon = 0.22
  expect(inspectChemistry(first).find(row => row.id === 'carbon')?.failed).toBe(
    false
  )
})

test('配载按公斤原值守恒，所有任务和批次身份唯一', () => {
  const tasks = createShipments()
  const lots = tasks.flatMap(task => {
    const current = createCargoLots(task)
    expect(current.reduce((sum, row) => sum + row.weightKg, 0)).toBe(
      task.weightKg
    )
    expect(
      current.every(
        row => row.grade === task.grade && Number.isInteger(row.weightKg)
      )
    ).toBe(true)
    return current
  })
  expect(new Set(lots.map(row => row.id)).size).toBe(lots.length)
  expect(validateLoad(22800, 22800, 32)).toBeNull()
  expect(validateLoad(22800, 15200, 32)).toContain('计划一致')
  expect(validateLoad(22800, 22800, 20)).toContain('额定载重')
  expect(validateLoad(22800, 22800, null)).toContain('额定载重')
  expect(validateLoad(22800, 22800, Number.NaN)).toContain('额定载重')
})

test('Naive 空态使用主题声明的淡蓝图标，明暗配置独立', () => {
  expect(lightThemeOverrides.Empty?.iconColor).toBe(EMPTY_STATE_COLORS.light)
  expect(darkThemeOverrides.Empty?.iconColor).toBe(EMPTY_STATE_COLORS.dark)
  expect(EMPTY_STATE_COLORS.light).not.toBe(EMPTY_STATE_COLORS.dark)
})
