/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-28
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\data.ts
 * @Description: 销售订单类型、示例数据、金额口径与静态组件配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DataPickerSourceInput } from '@robot-admin/naive-ui-components/C_DataPicker'
import type {
  FormConfig,
  FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import type { SearchFormItem } from '@robot-admin/naive-ui-components/C_FormSearch'
import { createNumberCodec } from '@robot-admin/naive-ui-components/data'
import {
  summarizeRows,
  type SummaryNumericStrategy,
} from '@agile-team/mach-table-vue/business'
import { ORDER_STATUS_OPTIONS } from '@/config/enums'
import { delayWithSignal } from '@/utils/abort'
import { CUSTOMERS } from './options'
export { CUSTOMERS } from './options'

export interface Customer {
  id: string
  code: string
  name: string
  region: string
}
export interface OrderHeader {
  id: string
  orderNo: string
  customer: string | null
  status: number
  owner: string
  note: string | null
  contractNo: string
  grade: string
  section: string
  region: string
  delivery: string
  targetWeight: number
  progress: number
}
export interface OrderLine {
  id: string
  product: string
  quantity: string | null
  amount: string | null
  currency: string
  unit: string
  note: string | null
}
export interface BusinessOrder {
  header: OrderHeader
  lines: OrderLine[]
}
export interface WorkbenchQuery {
  organization: string
  keyword: string
  status: number | null
  deliveryRange: [string, string] | null
}
export const STATUS_OPTIONS = ORDER_STATUS_OPTIONS
export const customerLabels = new Map(
  CUSTOMERS.map(customer => [customer.id, customer.name])
)
export const moneyCodec = createNumberCodec({
  storage: 'decimal-string',
  fractionDigits: 2,
  useGrouping: true,
})
export const quantityCodec = createNumberCodec({
  storage: 'decimal-string',
  fractionDigits: 3,
})
const exactCodec = createNumberCodec({ storage: 'decimal-string' })
/** 订单状态与履约进度保持一致，进行中的进度沿用已有值。 */
export const progressForStatus = (row: OrderHeader): number =>
  row.status === 2 ? 100 : row.status === 0 ? 0 : row.progress || 35

/** 示例数据使用业务主键；零数量与未填写分别保留 '0' 和 null。 */
export function createBusinessOrders(): BusinessOrder[] {
  return Array.from({ length: 18 }, (_, index) => {
    const customer = CUSTOMERS[index % CUSTOMERS.length]
    const status = index < 3 ? index : (index % 2) + 1
    return {
      header: {
        id: `ORDER-${index + 1}`,
        orderNo: `SO-2026-${String(index + 1).padStart(3, '0')}`,
        customer: customer.id,
        status,
        owner: '陈雨',
        note: null,
        contractNo: `HT-2610-${String(index + 101)}`,
        grade: ['Q355B', 'Q235B', 'HRB400E'][index % 3],
        section: ['10 × 1500 × 6000', '8 × 1500 × 6000', 'Φ 20 × 9000'][
          index % 3
        ],
        region: customer.region,
        delivery: `2026-11-${String((index % 12) + 1).padStart(2, '0')}`,
        targetWeight: 128 + index * 12.5,
        progress: status === 2 ? 100 : status === 0 ? 0 : 35 + (index % 5) * 10,
      },
      lines: [
        {
          id: `ORDER-${index + 1}-L01`,
          product: '精整卷材 A',
          quantity: '0',
          amount: '1.005',
          currency: 'CNY',
          unit: 't',
          note: '零数量样例',
        },
        {
          id: `ORDER-${index + 1}-L02`,
          product: '冷轧板材 B',
          quantity: '12.125',
          amount: '12000.675',
          currency: 'CNY',
          unit: 't',
          note: '交期确认中',
        },
        {
          id: `ORDER-${index + 1}-L03`,
          product: '边角料 C',
          quantity: null,
          amount: '25.33',
          currency: 'CNY',
          unit: 't',
          note: null,
        },
      ],
    }
  })
}

/** 将示例的最多三位存储小数交给 BigInt 累加，不经过二进制浮点。 */
export function decimalMillis(value: unknown): bigint {
  const text = exactCodec.parse(value)
  if (text === null) return 0n
  const negative = text.startsWith('-')
  const [whole, fraction = ''] = text.replace(/^-/, '').split('.')
  if (fraction.length > 3)
    throw new RangeError('本示例的数量和金额最多支持三位存储小数')
  const result = BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'))
  return negative ? -result : result
}
export const decimalFromMillis = (value: bigint): string => {
  const sign = value < 0n ? '-' : ''
  const raw = (value < 0n ? -value : value).toString().padStart(4, '0')
  return `${sign}${raw.slice(0, -3)}.${raw.slice(-3)}`
}
const exactSummary: SummaryNumericStrategy<bigint> = {
  zero: () => 0n,
  add: (total, value) => total + decimalMillis(value),
  // 此示例只声明 sum/count，无比率指标；比率需单独提供领域精度策略。
  divide: () => {
    throw new TypeError('本示例未配置比率指标')
  },
}
/** 当前明细按币种和单位分组合计，scope 仅描述已提供的当前页。 */
export function summarizeBusinessLines(lines: readonly OrderLine[]) {
  return summarizeRows(lines, {
    scope: 'page',
    groupBy: row => `${row.currency}/${row.unit}`,
    numeric: exactSummary,
    metrics: [
      { id: 'amount', kind: 'sum', value: row => row.amount },
      { id: 'quantity', kind: 'sum', value: row => row.quantity },
      { id: 'count', kind: 'count' },
    ],
  }).groups.map(group => ({
    key: group.key,
    count: group.rowCount,
    amount: moneyCodec.format(decimalFromMillis(group.values.amount as bigint)),
    quantity: quantityCodec.format(
      decimalFromMillis(group.values.quantity as bigint)
    ),
  }))
}
export const customerSource: DataPickerSourceInput<Customer> = {
  rowKey: 'id',
  label: row => row.name,
  request: async ({ page, pageSize, search, signal }) => {
    await delayWithSignal(100, signal)
    const all = CUSTOMERS.filter(row =>
      `${row.code} ${row.name}`.includes(search)
    )
    return {
      rows: structuredClone(all.slice((page - 1) * pageSize, page * pageSize)),
      total: all.length,
    }
  },
  resolve: async (values, signal) => {
    await delayWithSignal(100, signal)
    return structuredClone(CUSTOMERS.filter(row => values.includes(row.id)))
  },
}
export const CUSTOMER_COLUMNS = [
  { key: 'code', title: '客户编号', width: 130 },
  { key: 'name', title: '客户名称', minWidth: 180 },
  { key: 'region', title: '销售区域', width: 100 },
]
export const FIELD_DICTIONARIES = { status: 'order-status' } as const
export const SEARCH_FIELDS: SearchFormItem<WorkbenchQuery>[] = [
  { type: 'input', prop: 'organization', label: '组织', fixed: true },
  { type: 'input', prop: 'keyword', label: '订单 / 客户' },
  {
    type: 'select',
    prop: 'status',
    label: '计划状态',
  },
  {
    type: 'date-range',
    prop: 'deliveryRange',
    label: '交货区间',
    valueMode: 'formatted',
    attrs: {
      type: 'daterange',
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd',
    },
  },
]
export const HEADER_FIELDS: FormOption<OrderHeader>[] = [
  { type: 'input', prop: 'orderNo', label: '订单编号', readonly: true },
  {
    type: 'customer',
    prop: 'customer',
    label: '订货客户',
    required: true,
    rules: [{ required: true, message: '请选择订货客户' }],
    focusTarget: ({ element }) => element?.querySelector('button') ?? null,
  },
  {
    type: 'select',
    prop: 'status',
    label: '计划状态',
    required: true,
  },
  {
    type: 'input',
    prop: 'owner',
    label: '业务人员',
    rules: [{ required: true, message: '请输入业务人员' }],
  },
  { type: 'input', prop: 'contractNo', label: '合同编号', readonly: true },
  { type: 'input', prop: 'delivery', label: '交货日期', readonly: true },
  { type: 'input', prop: 'region', label: '销售区域' },
  { type: 'input', prop: 'note', label: '订单备注' },
]
export const FORM_CONFIG: FormConfig<OrderHeader> = {
  layout: 'grid',
  density: 'compact',
  labelPlacement: 'left',
  labelWidth: 88,
  grid: { cols: 1, minItemWidth: 250, xGap: 16, yGap: 2 },
  showActions: false,
}
export const BATCH_MODES = [
  { label: '不修改', value: 'keep' },
  { label: '清空备注', value: 'clear' },
  { label: '统一赋值', value: 'set' },
]

export const ORDER_LIST_LOCALE = {
  emptyRows: '没有匹配的销售订单',
  emptyRowsHint: '可清除筛选后查看完整台账',
}
export const ORDER_LINES_LOCALE = {
  emptyRows: '当前订单还没有商品明细',
  emptyRowsHint: '新增明细后即可核对数量和金额',
}
export const ORDER_DETAIL_LOCALE = {
  emptyRows: '当前订单还没有商品明细',
  emptyRowsHint: '请在销售订单工作台维护明细',
}
export const PAYMENT_LOCALE = {
  emptyRows: '暂无可测算的收款金额',
  emptyRowsHint: '填写商品明细金额后按币种汇总',
}
