/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-20
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\09-form-search\\tabbedQuery.ts
 * @Description: 跨页签筛选演示数据与本地请求适配器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  createDataPickerSearchField,
  createLocalDataPickerSource,
} from '@robot-admin/naive-ui-components/C_DataPicker'
import type {
  FilterField,
  FilterNode,
  FilterGroup,
} from '@robot-admin/naive-ui-components/C_FilterBuilder'
import type { SearchFormItem } from '@robot-admin/naive-ui-components/C_FormSearch'
import { defineTableColumns } from '@robot-admin/naive-ui-components/C_Table'
import type { TabsValue } from '@robot-admin/naive-ui-components/C_Tabs'
import type { TabbedQueryContext } from '@robot-admin/naive-ui-components/workflows'
import { delayWithSignal } from '@/utils/abort'

export const ORDER_TABS = [
  { key: 'pending', label: '待处理' },
  { key: 'done', label: '已处理' },
] as const

const customers = [
  { id: '0001', name: '云岭装备', region: '华东' },
  { id: '0002', name: '越泽新材', region: '华北' },
  { id: '0003', name: '启越制造', region: '华南' },
  { id: '0004', name: '海川工业', region: '西南' },
]

const priorities = [
  { value: 'normal', label: '普通' },
  { value: 'urgent', label: '加急' },
] as const

const currency = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
})

const orders = ORDER_TABS.flatMap(tab =>
  Array.from({ length: 24 }, (_, index) => {
    const customer = customers[index % customers.length]
    const priority =
      priorities[Math.floor(index / customers.length) % priorities.length]
    return {
      id: `${tab.key === 'pending' ? 'PD' : 'DN'}-${String(index + 1).padStart(3, '0')}`,
      tab: tab.key,
      status: tab.label,
      customerId: customer.id,
      customerName: customer.name,
      amount: 3600 + index * 600,
      priority: priority.value,
      priorityLabel: priority.label,
    }
  })
)

type Order = (typeof orders)[number]
type OrderFilterField = 'amount' | 'priority'

export interface OrderSearch {
  customerId: string | null
}

export interface OrderQuery extends OrderSearch {
  filter: FilterGroup<OrderFilterField>
}

export const ORDER_COLUMNS = defineTableColumns<Order>([
  { key: 'id', title: '订单号', minWidth: 100 },
  { key: 'customerName', title: '客户', minWidth: 120 },
  { key: 'status', title: '办理状态', minWidth: 100 },
  { key: 'priorityLabel', title: '优先级', minWidth: 90 },
  {
    key: 'amount',
    title: '订单金额',
    minWidth: 110,
    render: row => currency.format(row.amount),
  },
])

export const ORDER_SEARCH_FIELDS: SearchFormItem<OrderSearch>[] = [
  {
    prop: 'customerId',
    label: '客户',
    type: 'custom',
    defaultValue: null,
    render: createDataPickerSearchField({
      source: createLocalDataPickerSource({
        rows: customers,
        rowKey: 'id',
        label: row => `${row.id} · ${row.name}`,
        searchText: row => `${row.id} ${row.name} ${row.region}`,
      }),
      columns: [
        { key: 'id', title: '客户编码', width: 90 },
        { key: 'name', title: '客户名称', minWidth: 100 },
        { key: 'region', title: '区域', width: 70 },
      ],
      presentation: 'popover',
      commitOnSelect: true,
      placeholder: '选择客户（支持编号、名称搜索）',
      popup: { width: 460, maxHeight: 230 },
    }),
  },
]

export const ORDER_FILTER_FIELDS: readonly FilterField<OrderFilterField>[] = [
  {
    key: 'amount',
    label: '订单金额',
    type: 'number',
    operators: ['gte', 'lte'],
  },
  {
    key: 'priority',
    label: '优先级',
    type: 'select',
    operators: ['eq'],
    options: priorities,
  },
]

/** 只解释本演示公开的金额和优先级操作符。 */
function matchesFilter(
  order: Order,
  condition: FilterNode<OrderFilterField>
): boolean {
  if (condition.type === 'group') {
    if (condition.operator === 'and')
      return condition.children.every(child => matchesFilter(order, child))
    return condition.children.some(child => matchesFilter(order, child))
  }
  switch (condition.operator) {
    case 'eq':
      return order[condition.field] === condition.value
    case 'gte':
      return (
        typeof condition.value === 'number' && order.amount >= condition.value
      )
    case 'lte':
      return (
        typeof condition.value === 'number' && order.amount <= condition.value
      )
    default:
      return false
  }
}

/** 两个页签速度不同，便于观察快速切换时当前结果仍只属于活动页签。 */
export async function requestDemoOrders({
  tab,
  query,
  page,
  pageSize,
  signal,
}: TabbedQueryContext<TabsValue, OrderQuery>) {
  await delayWithSignal(tab === 'pending' ? 260 : 80, signal)
  signal.throwIfAborted()
  const matches = orders.filter(
    order =>
      order.tab === tab &&
      (!query.customerId || order.customerId === query.customerId) &&
      matchesFilter(order, query.filter)
  )
  const start = (page - 1) * pageSize
  return { data: matches.slice(start, start + pageSize), total: matches.length }
}
