/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\tests\bundle-budget.test.ts
 * @Description: 构建体积预算解析与判定测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import {
  evaluateBundleMetrics,
  parseIndexAssets,
  type BundleMetrics,
} from '../scripts/check-bundle-budget'

describe('bundle budget', () => {
  test('解析入口、预加载和样式资源', () => {
    const assets = parseIndexAssets(`
      <script type="module" crossorigin src="/js/index-a.js"></script>
      <link rel="modulepreload" crossorigin href="/js/vendor-b.js">
      <link rel="stylesheet" crossorigin href="/assets/index-c.css">
    `)

    expect(assets.entryScripts).toEqual(['js/index-a.js'])
    expect(assets.modulePreloads).toEqual(['js/vendor-b.js'])
    expect(assets.stylesheets).toEqual(['assets/index-c.css'])
  })

  test('只报告超过预算的指标', () => {
    const metrics: BundleMetrics = {
      entryBytes: 101,
      preloadBytes: 90,
      stylesheetBytes: 80,
      initialBytes: 271,
      preloadCount: 3,
      largestChunkBytes: 70,
      largestChunkName: 'feature.js',
    }
    const failures = evaluateBundleMetrics(metrics, {
      entryBytes: 100,
      preloadBytes: 100,
      stylesheetBytes: 100,
      initialBytes: 300,
      preloadCount: 5,
      largestChunkBytes: 100,
    })

    expect(failures).toHaveLength(1)
    expect(failures[0]).toContain('入口 JS')
  })
})
