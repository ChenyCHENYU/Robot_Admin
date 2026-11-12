/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\tests\production-matrix.test.ts
 * @Description: 复合检测记录的业务精度、零值、空值与报表数据口径回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test } from 'bun:test'
import {
  EMPTY_READING,
  createMatrixRows,
  createSlots,
  createReport,
  parseReading,
  serializeReading,
  validateReading,
  reportCsv,
} from '../src/views/production-sales/production-matrix/model'

describe('复合检测矩阵的数据契约', () => {
  test('日期班次稳定且种子包含零值、缺测、越界和独立业务精度', () => {
    const slots = createSlots(28)
    const rows = createMatrixRows(slots)
    const report = createReport(rows, slots)
    expect(slots).toHaveLength(84)
    expect(new Set(slots.map(slot => slot.id)).size).toBe(84)
    expect(rows).toHaveLength(12)
    expect(report).toHaveLength(1008)
    expect(
      report.some(record => record.检测值 === 0 && record.取样时间 !== '')
    ).toBe(true)
    expect(
      report.some(record => record.检测值 === null && record.取样时间 === '')
    ).toBe(true)
    expect(report.some(record => record.判定 === '超出内控')).toBe(true)
    expect(rows.find(row => row.indicator === '槽液温度')?.precision).toBe(1)
  })
  test('数值与时间同时解析，缺一不提交，非法值不被静默转换', () => {
    expect(parseReading(' 0.00 @ 00:00 ')).toEqual({ value: 0, time: '00:00' })
    expect(parseReading('')).toBeNull()
    expect(parseReading(null)).toBeNull()
    expect(() => parseReading('12.5')).toThrow()
    expect(() => parseReading('12abc @ 08:00')).toThrow()
    expect(validateReading({ value: null, time: '08:00' }, 2)).not.toBe(true)
    expect(validateReading({ value: 0, time: '' }, 2)).not.toBe(true)
    expect(validateReading({ value: Number.NaN, time: '08:00' }, 2)).not.toBe(
      true
    )
    expect(validateReading({ value: 1.125, time: '08:00' }, 2)).not.toBe(true)
    expect(validateReading({ value: 10, time: '24:00' }, 2)).not.toBe(true)
    expect(validateReading({ value: 0, time: '00:00' }, 2)).toBe(true)
    expect(validateReading(EMPTY_READING, 1)).toBe(true)
  })
  test('同值保留引用，报表快照不会随后续编辑变化，CSV与复制保留零和时间', () => {
    const old = Object.freeze({ value: 0, time: '08:00' })
    expect(parseReading('0.00 @ 08:00', old)).toBe(old)
    expect(serializeReading(old, 2)).toBe('0.00 @ 08:00')
    const slots = createSlots(1)
    const rows = createMatrixRows(slots)
    rows[0].samples[slots[0].id] = old
    const report = createReport(rows, slots)
    rows[0].samples[slots[0].id] = { value: 9, time: '09:00' }
    expect(report[0].检测值).toBe(0)
    expect(report[0].取样时间).toBe('08:00')
    expect(typeof report[0].检测值).toBe('number')
    const csv = reportCsv(report)
    expect(csv).toContain('"检测值","取样时间"')
    expect(csv).toContain('"0","08:00"')
    report[0].槽位 = '=HYPERLINK("evil")'
    expect(reportCsv(report)).toContain('"\'=HYPERLINK(""evil"")"')
  })
})
