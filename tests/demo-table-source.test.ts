/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\tests\demo-table-source.test.ts
 * @Description: 无后端表格演示可加载且实例隔离，不需要第三方代理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { createDemoEmployeeSource } from '../src/api/demo-employees'
import { DEMO_EMPLOYEES } from '../src/api/demo-employees.mock'

test('Mock 演示使用隔离内存源，修改和删除不会污染另一页面或初始样例', async () => {
  const first = createDemoEmployeeSource('employees/expandList')
  const second = createDemoEmployeeSource('employees/dynamicList')
  if (!('query' in first) || !('query' in second))
    throw new Error('没有使用演示数据源')
  const { signal } = new AbortController()
  const context = {
    page: 1,
    pageSize: 20,
    paginationEnabled: false,
    filters: {},
    sort: null,
    signal,
  }
  expect(await first.query(context)).toMatchObject({
    items: DEMO_EMPLOYEES,
    total: DEMO_EMPLOYEES.length,
  })
  const edited = { ...DEMO_EMPLOYEES[0]!, name: '本实例编辑' }
  await first.mutations?.update?.(edited, { signal })
  await first.mutations?.remove?.(edited, { signal })
  expect(await first.query(context)).toMatchObject({
    total: DEMO_EMPLOYEES.length - 1,
  })
  expect(await second.query(context)).toMatchObject({
    items: DEMO_EMPLOYEES,
    total: DEMO_EMPLOYEES.length,
  })
})
