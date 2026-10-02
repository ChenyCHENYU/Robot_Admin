/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-30
 * @FilePath: \Robot_Admin\tests\demo-table.test.ts
 * @Description: 表格演示独立数据源与复制操作回归测试
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { expect, test } from 'bun:test'
import type {
  ActionContext,
  TableQueryContext,
} from '@robot-admin/request-core/naive'
import {
  createEmployeeTableConfig,
  type Employee,
} from '../src/views/demo/10-table/data'

const queryContext: TableQueryContext<
  Record<string, unknown>,
  Record<string, unknown>
> = {
  page: 1,
  pageSize: 20,
  paginationEnabled: true,
  filters: {},
  sort: null,
  signal: new AbortController().signal,
}

test('表格演示无远端接口依赖且复制后刷新仍保留数据', async () => {
  const config = createEmployeeTableConfig()
  const { source } = config
  if (!source || !('query' in source)) {
    throw new Error('表格演示缺少独立数据源')
  }

  const before = (await source.query(queryContext)) as {
    items: Employee[]
    total: number
  }
  const row = before.items[0]
  if (!row) throw new Error('表格演示缺少初始员工')

  const copyAction = config.customActions?.find(action => action.key === 'copy')
  if (!copyAction) throw new Error('表格演示缺少复制操作')

  let refreshCount = 0
  const context: ActionContext<Employee> = {
    data: before.items,
    index: 0,
    page: { current: 1, size: 20 },
    paginationEnabled: true,
    message: { success: () => {}, error: () => {}, warning: () => {} },
    dialog: {
      warning: () => {},
      error: () => {},
      success: () => {},
      info: () => {},
    },
    refresh: async () => {
      refreshCount += 1
    },
  }

  await copyAction.handler(row, context)
  const after = (await source.query(queryContext)) as {
    items: Employee[]
    total: number
  }
  expect(after.total).toBe(before.total + 1)
  expect(after.items[0]?.name).toBe(`${row.name}_副本`)
  expect(refreshCount).toBe(1)
})
