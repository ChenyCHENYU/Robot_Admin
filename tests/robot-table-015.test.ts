/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\robot-table-015.test.ts
 * @Description: 组件库 0.15 消费端搜索默认值、动态主键与自定义子表选择回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, spyOn, test } from 'bun:test'
import {
  advancedFormConfig,
  basicFormConfig,
  createSearchFields,
  generateMockResults,
  megaFormConfig,
} from '../src/views/demo/09-form-search/data'
import {
  defaultConfig,
  syncChildSelection,
  type TestRecord,
} from '../src/views/demo/11-table-expand/data'
import {
  createDefaultEmployee,
  generateRandomEmployee,
} from '../src/views/demo/12-table-dynamic/data'
import type { DataTableRowKey } from 'naive-ui'

test('三个搜索场景把初始字段值交给组件重置，不把空字符串误改成 null', () => {
  for (const config of [basicFormConfig, advancedFormConfig, megaFormConfig]) {
    const fields = createSearchFields(config)
    expect(fields).not.toBe(config.items)
    for (const field of fields) {
      expect(field.defaultValue).toEqual(config.params[field.prop])
    }
  }
  expect(createSearchFields(basicFormConfig)).toContainEqual(
    expect.objectContaining({ prop: 'name', defaultValue: '' })
  )
})

test('禁用状态 0 是有效搜索条件，演示结果保留它而不回退成启用', () => {
  const rows = generateMockResults('basic', { status: 0 })
  expect(rows.map(row => row.status)).toEqual([0, 0])
})

test('快速连续新增员工仍有唯一主键，每个草稿单独持有子数据', () => {
  const rows = Array.from({ length: 100 }, () => generateRandomEmployee())
  expect(new Set(rows.map(row => row.id)).size).toBe(rows.length)
  const first = createDefaultEmployee()
  first.childData.push({ id: 1, project: '仅本草稿', status: '进行中' })
  expect(createDefaultEmployee().childData).toEqual([])
  expect(rows.every(row => row.childData.length === 0)).toBe(true)
})

test('HTTP 环境没有 randomUUID 且时间不变时，两工厂共用的行键仍保持唯一', () => {
  const { crypto } = globalThis
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    crypto,
    'randomUUID'
  )
  const originalRandomUUID = crypto.randomUUID
  const originalNow = Date.now
  const clock = spyOn(Date, 'now').mockReturnValue(123456789)
  try {
    Object.defineProperty(crypto, 'randomUUID', {
      configurable: true,
      value: undefined,
    })
    const rows = Array.from({ length: 100 }, (_, index) =>
      index % 2 === 0 ? createDefaultEmployee() : generateRandomEmployee()
    )
    expect(new Set(rows.map(row => row.id)).size).toBe(100)
    expect(
      rows.every(row =>
        String(row.id).startsWith('dynamic-employee-123456789-')
      )
    ).toBe(true)
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(crypto, 'randomUUID', originalDescriptor)
    } else {
      Reflect.deleteProperty(crypto, 'randomUUID')
    }
    clock.mockRestore()
  }
  expect(crypto.randomUUID).toBe(originalRandomUUID)
  expect(Date.now).toBe(originalNow)
})

const parent: TestRecord = {
  id: 1,
  name: '员工',
  age: 28,
  email: 'user@example.com',
  department: '技术部',
  role: '工程师',
  salary: 10000,
  status: '在职',
  hasChildren: true,
  childData: [
    { id: 11, project: '项目 A', status: '进行中' },
    { id: 12, project: '项目 B', status: '进行中' },
  ],
}

const createSelection = () => {
  const parents = new Set<DataTableRowKey>()
  const children = new Set<DataTableRowKey>()
  const table = {
    selectChildRow: (_parent: DataTableRowKey, child: DataTableRowKey) => {
      children.add(child)
    },
    unselectChildRow: (_parent: DataTableRowKey, child: DataTableRowKey) => {
      children.delete(child)
    },
    selectRow: (key: DataTableRowKey) => {
      parents.add(key)
    },
    unselectRow: (key: DataTableRowKey) => {
      parents.delete(key)
    },
  }
  return { parents, children, table }
}

test('自定义子表严格模式仅全选时选中父行，清空同步父实例而无第二套状态', () => {
  const { parents, children, table } = createSelection()
  const config = { ...defaultConfig, parentChildLinkMode: 'strict' as const }
  syncChildSelection(table, parent, [], [11], parent.childData, config)
  expect([...children]).toEqual([11])
  expect([...parents]).toEqual([])
  syncChildSelection(table, parent, [11], [11, 12], parent.childData, config)
  expect([...parents]).toEqual([1])
  syncChildSelection(table, parent, [11, 12], [], parent.childData, config)
  expect([...children]).toEqual([])
  expect([...parents]).toEqual([])
})

test('宽松模式支持部分选中并忽略失效主键，离职父行仍不能选中', () => {
  const { parents, children, table } = createSelection()
  syncChildSelection(
    table,
    parent,
    [],
    [11, 999, '12'],
    parent.childData,
    defaultConfig
  )
  expect([...children]).toEqual([11])
  expect([...parents]).toEqual([1])
  syncChildSelection(
    table,
    { ...parent, status: '离职' },
    [11],
    [12],
    parent.childData,
    defaultConfig
  )
  expect([...children]).toEqual([12])
  expect([...parents]).toEqual([])
})

test('关闭父选择仍保留独立子选择；关闭子选择后不写入选择状态', () => {
  const { parents, children, table } = createSelection()
  syncChildSelection(table, parent, [], [11], parent.childData, {
    ...defaultConfig,
    enableSelection: false,
  })
  expect([...parents]).toEqual([])
  expect([...children]).toEqual([11])
  syncChildSelection(table, parent, [11], [12], parent.childData, {
    ...defaultConfig,
    enableChildSelection: false,
  })
  expect([...children]).toEqual([11])
})
