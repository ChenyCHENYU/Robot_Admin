/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\tests\demo-excel.test.ts
 * @Description: Excel 演示空行判断回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from 'bun:test'
import { hasNonEmptyCell } from '../src/views/demo/30-excel-all/data'

test('行号元数据不能把空 Excel 行误判为有效数据', () => {
  expect(hasNonEmptyCell({ __rowIndex: 1, name: '', age: null })).toBe(false)
  expect(hasNonEmptyCell({ __rowIndex: 2, name: '张三' })).toBe(true)
  expect(hasNonEmptyCell({ __rowIndex: 3, amount: 0 })).toBe(true)
  expect(hasNonEmptyCell({ __rowIndex: 4, enabled: false })).toBe(true)
})
