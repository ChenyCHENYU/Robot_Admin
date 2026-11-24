/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\data.ts
 * @Description: 订单模型、展示口径和可重复的演示数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export const ORDER_STATUS = {
  pending: { label: '待处理', tagType: 'default' },
  processing: { label: '履约中', tagType: 'info' },
  completed: { label: '已完成', tagType: 'success' },
  risk: { label: '需关注', tagType: 'warning' },
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

export interface OrderRow {
  id: string
  orderNo: string
  customer: string
  product: string
  region: string
  quantity: number
  amount: number
  status: OrderStatus
  progress: number
  updatedAt: string
}

export interface OrderTreeRow extends OrderRow {
  children?: OrderTreeRow[]
}

const CUSTOMERS = [
  '星海科技',
  '云帆智造',
  '远川零售',
  '青禾医疗',
  '极光能源',
  '木棉设计',
]
const PRODUCTS = [
  '企业协作套件',
  '数据中台服务',
  '智能巡检终端',
  '供应链解决方案',
  '云端分析平台',
]
export const REGIONS = ['华东', '华南', '华北', '西南', '华中'] as const
const STATUSES = Object.keys(ORDER_STATUS) as OrderStatus[]
export const STATUS_OPTIONS = STATUSES.map(value => ({
  label: ORDER_STATUS[value].label,
  value,
}))
export const getStatusMeta = (value: unknown) =>
  ORDER_STATUS[value as OrderStatus] ?? {
    label: String(value ?? '-'),
    tagType: 'default' as const,
  }
const pad = (value: number, length = 2): string =>
  String(value).padStart(length, '0')

/** 生成稳定的大数据集，用于直观看到虚拟滚动与本地分页表现。 */
export const createOrderRows = (count = 2000): OrderRow[] =>
  Array.from({ length: count }, (_, index) => {
    const sequence = index + 1
    const status = STATUSES[index % STATUSES.length]
    const quantity = 1 + ((index * 7) % 24)
    const amount = quantity * (680 + ((index * 137) % 5200))
    const date = new Date(Date.UTC(2026, 8, 10 - (index % 120)))

    return {
      id: String(sequence),
      orderNo: `MT-${pad(2026, 4)}-${pad(sequence, 5)}`,
      customer: CUSTOMERS[index % CUSTOMERS.length],
      product: PRODUCTS[(index * 3) % PRODUCTS.length],
      region: REGIONS[(index * 2) % REGIONS.length],
      quantity,
      amount,
      status,
      progress:
        status === 'completed'
          ? 100
          : status === 'pending'
            ? 10 + (index % 20)
            : 35 + ((index * 11) % 60),
      updatedAt: date.toISOString().slice(0, 10),
    }
  })

/** 生成三层本地树数据，用同一列模型演示展开、层级选择与虚拟滚动。 */
export const createOrderTreeRows = (): OrderTreeRow[] => {
  const source = createOrderRows(30)

  return REGIONS.map((region, regionIndex) => {
    const regionRows = source.filter(row => row.region === region)
    const regionCustomers = [
      CUSTOMERS[(regionIndex * 2) % CUSTOMERS.length],
      CUSTOMERS[(regionIndex * 2 + 1) % CUSTOMERS.length],
    ]
    const customerGroups = regionCustomers.map((customer, customerIndex) => {
      const children = regionRows
        .filter((_, index) => index % 2 === customerIndex)
        .slice(0, 3)
        .map(row => ({
          ...row,
          id: `tree:${region}:${customer}:${row.id}`,
          customer,
          children: undefined,
        }))
      const amount = children.reduce((sum, row) => sum + row.amount, 0)

      return {
        ...children[0],
        id: `tree:${region}:${customer}`,
        orderNo: customer,
        customer,
        product: '—',
        region,
        quantity: children.reduce((sum, row) => sum + row.quantity, 0),
        amount,
        status: 'processing' as const,
        progress: Math.round(
          children.reduce((sum, row) => sum + row.progress, 0) /
            Math.max(children.length, 1)
        ),
        updatedAt: children[0]?.updatedAt ?? '2026-09-10',
        children,
      }
    })
    const allOrders = customerGroups.flatMap(group => group.children ?? [])

    return {
      ...(allOrders[0] ?? source[regionIndex]),
      id: `tree:${region}`,
      orderNo: `${region}区域`,
      customer: '—',
      product: '—',
      region,
      quantity: allOrders.reduce((sum, row) => sum + row.quantity, 0),
      amount: allOrders.reduce((sum, row) => sum + row.amount, 0),
      status: 'processing' as const,
      progress: Math.round(
        allOrders.reduce((sum, row) => sum + row.progress, 0) /
          Math.max(allOrders.length, 1)
      ),
      updatedAt: allOrders[0]?.updatedAt ?? '2026-09-10',
      children: customerGroups,
    }
  })
}

export const MONEY_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 0,
})

export const getStatusLabel = (value: unknown): string =>
  getStatusMeta(value).label
