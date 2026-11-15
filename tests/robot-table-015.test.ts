/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\tests\robot-table-015.test.ts
 * @Description: 正式组件消费端搜索默认值、动态主键与自定义子表键桥接回归
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, spyOn, test } from 'bun:test'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  useSearchState,
  type SearchFormItem,
} from '@robot-admin/naive-ui-components/C_FormSearch'
import {
  advancedFormConfig,
  basicFormConfig,
  generateMockResults,
  megaFormConfig,
  filterSelectionPreview,
  SELECTION_SEARCH_FIELDS,
} from '../src/views/demo/09-form-search/data'
import { syncChildSelection } from '../src/views/demo/11-table-expand/data'
import {
  createDefaultEmployee,
  generateRandomEmployee,
} from '../src/views/demo/12-table-dynamic/data'
import type { DataTableRowKey } from 'naive-ui'

/** 用已安装组件包的搜索状态验证页面传入的字段契约。 */
async function expectSearchReset<T extends object>(
  formItemList: SearchFormItem<T>[],
  formParams: T,
  expected: T
): Promise<void> {
  let resetParams: T | undefined
  await renderToString(
    createSSRApp({
      /** 在 Vue 实例中运行搜索状态，保留组件的生命周期。 */
      setup() {
        const { resetFn } = useSearchState(
          (event, params) => {
            if (event === 'reset') resetParams = params
          },
          { formItemList, formParams }
        )
        resetFn()
        return () => null
      },
    })
  )
  expect(resetParams).toEqual(expected)
}

test('搜索重置保留分页并恢复各控件空值与显式业务默认值', async () => {
  await expectSearchReset(
    basicFormConfig.items,
    {
      ...basicFormConfig.params,
      name: '李',
      status: 0,
      dateRange: [1, 2],
      pageNum: 2,
    },
    { ...basicFormConfig.params, pageNum: 2 }
  )
  await expectSearchReset(
    advancedFormConfig.items,
    { ...advancedFormConfig.params, keyword: '生产', category: '科技' },
    advancedFormConfig.params
  )
  await expectSearchReset(
    megaFormConfig.items,
    { ...megaFormConfig.params, field16: '折叠的条件' },
    megaFormConfig.params
  )
  await expectSearchReset(
    SELECTION_SEARCH_FIELDS,
    { statuses: [0, 1], enabled: true },
    { statuses: [], enabled: false }
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

test('自定义子表仅提交差异键，重复键和已有键不会重复调用包实例', () => {
  const calls: Array<[string, DataTableRowKey, DataTableRowKey]> = []
  const table = {
    /** 记录组件收到的选择请求，不在消费侧模拟父子联动。 */
    selectChildRow: (parent: DataTableRowKey, child: DataTableRowKey) => {
      calls.push(['select', parent, child])
    },
    /** 记录取消请求。 */
    unselectChildRow: (parent: DataTableRowKey, child: DataTableRowKey) => {
      calls.push(['unselect', parent, child])
    },
  }
  const previous = [11, 11, 12]
  const next = [12, 13, 13]
  syncChildSelection(table, 1, previous, next)
  expect(calls).toEqual([
    ['unselect', 1, 11],
    ['select', 1, 13],
  ])
  expect(previous).toEqual([11, 11, 12])
  expect(next).toEqual([12, 13, 13])
  calls.length = 0
  syncChildSelection(table, 1, [12, 13], [13, 12])
  expect(calls).toEqual([])
})

test('多选状态与布尔条件取交集，false、0、清空分别保留筛选语义', () => {
  expect(
    filterSelectionPreview({ statuses: [], enabled: false }).map(row => row.id)
  ).toEqual([2, 3])
  expect(
    filterSelectionPreview({ statuses: [0, 1], enabled: false }).map(
      row => row.id
    )
  ).toEqual([2])
  expect(
    filterSelectionPreview({ statuses: [0, 1], enabled: true }).map(
      row => row.id
    )
  ).toEqual([1])
  expect(
    filterSelectionPreview({ statuses: [0, 1], enabled: null }).map(
      row => row.id
    )
  ).toEqual([1, 2])
  expect(filterSelectionPreview({ statuses: [], enabled: null })).toHaveLength(
    3
  )
})
