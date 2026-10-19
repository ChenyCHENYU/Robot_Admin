/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 团队指标口径与本机流程草稿边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { test, expect } from 'bun:test'
import {
  PERFORMANCE_TEAMS,
  summarizePerformance,
} from '../src/views/demo/58-performance/data'
import {
  workflowScenarios,
  restoreWorkflowDrafts,
} from '../src/views/demo/28-work-flow-editor/data'
import {
  BARCODE_EXAMPLES,
  validateBarcodeValue,
} from '../src/views/demo/35-barcode/data'
test('商品条码示例校验正确，拒绝错误校验位和不支持的字符', () => {
  for (const example of BARCODE_EXAMPLES)
    expect(validateBarcodeValue(example.value, example.format)).toBe('')
  expect(validateBarcodeValue('6901234567893', 'EAN13')).toContain('校验位')
  expect(validateBarcodeValue('中文', 'CODE128')).toContain('ASCII')
  expect(validateBarcodeValue('abc', 'CODE39')).toContain('大写')
})
test('绩效按实际任务加权汇总，空范围不产生非法百分比', () => {
  const summary = summarizePerformance(PERFORMANCE_TEAMS, 5)
  expect(summary.delivered).toBe(71)
  expect(summary.planned).toBe(75)
  expect(summary.delivery).toBeCloseTo((71 / 75) * 100)
  expect(summary.quality).toBeCloseTo((70 / 71) * 100)
  expect(summary.cycle).toBeCloseTo(205 / 71)
  expect(summarizePerformance([], 0)).toEqual({
    planned: 0,
    delivered: 0,
    checked: 0,
    accepted: 0,
    cycleDays: 0,
    delivery: 0,
    quality: 0,
    cycle: 0,
  })
})
test('损坏和未知场景草稿不能覆盖可渲染流程', () => {
  const { template } = workflowScenarios[1]
  const raw = JSON.stringify({
    version: 1,
    drafts: {
      'leave-approval': template,
      unknown: template,
      'purchase-approval': { nodes: [{ id: 'broken' }], edges: [] },
    },
  })
  expect(restoreWorkflowDrafts(raw)).toEqual({ 'leave-approval': template })
  expect(() => restoreWorkflowDrafts('null')).toThrow()
  expect(() => restoreWorkflowDrafts('{"version":2,"drafts":{}}')).toThrow()
})
