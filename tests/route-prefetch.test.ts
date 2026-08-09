/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\tests\route-prefetch.test.ts
 * @Description: 重量级路由预取策略测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { describe, expect, test } from 'bun:test'
import { shouldPrefetchHeavyRoutes } from '../src/router/routePrefetchPolicy'

describe('route prefetch network policy', () => {
  test('allows regular and unknown network conditions', () => {
    expect(shouldPrefetchHeavyRoutes()).toBe(true)
    expect(shouldPrefetchHeavyRoutes({ effectiveType: '4g' })).toBe(true)
    expect(shouldPrefetchHeavyRoutes({ effectiveType: '3g' })).toBe(true)
  })

  test('respects data saver and very slow networks', () => {
    expect(shouldPrefetchHeavyRoutes({ saveData: true, effectiveType: '4g' })).toBe(
      false
    )
    expect(shouldPrefetchHeavyRoutes({ effectiveType: '2g' })).toBe(false)
    expect(shouldPrefetchHeavyRoutes({ effectiveType: 'slow-2g' })).toBe(false)
  })
})
