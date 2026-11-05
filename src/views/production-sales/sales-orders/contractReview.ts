/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-05
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\contractReview.ts
 * @Description: 合同版本与订单草稿逐字段比对及选择性采纳
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { OrderHeader } from './data'

const CONTRACT_FIELDS = {
  grade: '钢种',
  section: '规格 (mm)',
  delivery: '交货日期',
  targetWeight: '合同量 (t)',
  note: '订单备注',
} as const

export type ContractField = keyof typeof CONTRACT_FIELDS
export const CONTRACT_FIELD_STATUS = {
  same: { label: '一致', type: 'default' },
  missing: { label: '待补齐', type: 'info' },
  different: { label: '有差异', type: 'warning' },
} as const
type ContractValues = Pick<OrderHeader, ContractField>

interface ContractSnapshot {
  orderId: string
  contractNo: string
  revision: string
  values: Readonly<ContractValues>
}

const snapshots: readonly ContractSnapshot[] = [
  {
    orderId: 'ORDER-1',
    contractNo: 'HT-2610-101',
    revision: '补充协议 02',
    values: {
      grade: 'Q355B',
      section: '12 × 1500 × 6000',
      delivery: '2026-11-05',
      targetWeight: 136.5,
      note: '卸货前请提前一天通知收货方',
    },
  },
  {
    orderId: 'ORDER-2',
    contractNo: 'HT-2610-102',
    revision: '签署版',
    values: {
      grade: 'Q235B',
      section: '8 × 1500 × 6000',
      delivery: '2026-11-03',
      targetWeight: 140.5,
      note: null,
    },
  },
]

/** 仅关联同一订单与合同的本地参考版本，保留预览时的草稿值。 */
export function previewContractReview(draft: OrderHeader) {
  const source = snapshots.find(
    item => item.orderId === draft.id && item.contractNo === draft.contractNo
  )
  if (!source) return null
  const rows = (Object.keys(CONTRACT_FIELDS) as ContractField[]).map(key => {
    const current = draft[key]
    const reference = source.values[key]
    const status: keyof typeof CONTRACT_FIELD_STATUS = Object.is(
      current,
      reference
    )
      ? 'same'
      : current === null || current === ''
        ? 'missing'
        : 'different'
    return { key, label: CONTRACT_FIELDS[key], current, reference, status }
  })
  return { source, rows }
}

/** 检查所有已选字段仍与预览一致，再返回可一次写入的草稿变更。 */
export function resolveContractReview(
  draft: OrderHeader,
  preview: NonNullable<ReturnType<typeof previewContractReview>>,
  keys: readonly ContractField[]
): Partial<ContractValues> | null {
  if (
    draft.status !== 0 ||
    draft.id !== preview.source.orderId ||
    draft.contractNo !== preview.source.contractNo ||
    !keys.length
  )
    return null
  const rows = preview.rows.filter(row => keys.includes(row.key))
  if (
    rows.length !== keys.length ||
    rows.some(
      row => row.status === 'same' || !Object.is(draft[row.key], row.current)
    )
  )
    return null
  return Object.fromEntries(rows.map(row => [row.key, row.reference]))
}

const contractWeight = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

/** 缺项和有效数值分别展示，格式化仅作用于预览文本。 */
export function formatContractValue(value: ContractValues[ContractField]) {
  if (value === null || value === '') return '未填写'
  return typeof value === 'number' ? contractWeight.format(value) : value
}
