/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\tests\demo-workspaces.test.ts
 * @Description: 验证成本口径可复核与发布记录安全渲染
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, test } from 'bun:test'
import {
  COST_FACTORIES,
  COST_DEMO_DATE,
  summarizeCosts,
  createCostTrend,
} from '../src/views/demo/34-production-cost/data'
import {
  parseReleaseRecords,
  releaseNotesHtml,
} from '../src/views/demo/50-timeline/core'

describe('cost intelligence', () => {
  test('汇总使用产量加权，金额、偏差与预算执行率相互一致', () => {
    const summary = summarizeCosts([
      {
        id: 'a',
        name: 'a',
        stage: '',
        quantity: 100,
        standard: 1000,
        actual: 1200,
      },
      {
        id: 'b',
        name: 'b',
        stage: '',
        quantity: 900,
        standard: 9000,
        actual: 8100,
      },
    ])
    expect(summary.actual).toBe(9300)
    expect(summary.unit).toBe(9.3)
    expect(summary.difference).toBe(-700)
    expect(summary.execution).toBe(0.93)
    expect(summary.overBudget).toBe(1)
    expect(summarizeCosts([]).unit).toBe(0)
  })
  test('分厂与总范围趋势确定，最后一个统计日与台账一致', () => {
    for (const rows of [COST_FACTORIES, COST_FACTORIES.slice(0, 1), []]) {
      const summary = summarizeCosts(rows)
      const trend = createCostTrend(summary)
      expect(trend).toEqual(createCostTrend(summary))
      expect(trend).toHaveLength(30)
      expect(trend.at(-1)?.date).toBe(COST_DEMO_DATE)
      expect(trend.at(-1)?.value).toBeCloseTo(summary.unit, 2)
      expect(trend.every(point => Number.isFinite(point.value))).toBe(true)
    }
  })
})
describe('release journal', () => {
  test('只展示有版本和日期的发布记录，保留实际文件顺序', () => {
    const records = parseReleaseRecords(
      '## [Unreleased]\n- 未发布\n## [2.6.3](url) (2026-10-02)\n- **修复** `样式`\n## [2.6.2](url) (2026-10-01)\n- 旧版本\n'
    )
    expect(records.map(record => record.version)).toEqual(['2.6.3', '2.6.2'])
    expect(records[0].notes).toEqual(['修复 样式'])
    expect(parseReleaseRecords('没有标准标题')).toEqual([])
  })
  test('Changelog 中的 HTML 不会成为可执行内容', () => {
    const html = releaseNotesHtml(['<img src=x onerror="alert(1)"> & 修复'])
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
    expect(html).toContain('&amp;')
  })
})
