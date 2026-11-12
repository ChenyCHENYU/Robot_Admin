/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-12
 * @FilePath: \Robot_Admin\src\views\production-sales\remote-workbench\api.ts
 * @Description: 有界的本地异步订单接口；真实接入时仅替换传输，不写真实业务数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DictionaryOption } from '@robot-admin/dictionary'
import type { SortModel } from '@agile-team/mach-table-vue'
import { delayWithSignal } from '@/utils/abort'

export interface OrderSearch {
  keyword: string
  status: number | null
  urgent: boolean | null
}
export interface OrderDraft {
  owner: string
  urgent: boolean
  note: string
}
export interface RemoteOrder extends OrderDraft {
  id: string
  orderNo: string
  customer: string
  status: number
  delivery: string
  weight: number
}
export interface RemoteLine {
  id: string
  orderId: string
  lineNo: string
  product: string
  grade: string
  quantity: number
  warehouse: string
  urgent: boolean
  status: number
  batch: string
  inspectionNo: string
  completedWeight: number
}
export type DetailVariant = 'delivery' | 'quality'
export interface DetailSearch {
  orderId: string
  variant: DetailVariant
}
export interface RemoteField {
  key: keyof RemoteLine
  title: string
  kind?: 'number' | 'status' | 'boolean'
}
interface PageRequest<T> {
  query: T
  page: number
  pageSize: number
  signal: AbortSignal
  sortModel?: SortModel
}
interface PageEnvelope<T> {
  code: number
  data: { records: T[]; total: number }
}
interface DetailEnvelope extends PageEnvelope<RemoteLine> {
  data: PageEnvelope<RemoteLine>['data'] & {
    fields: RemoteField[]
    variant: DetailVariant
  }
}
export interface DetailPage {
  rows: readonly RemoteLine[]
  total: number
  columns: RemoteField[]
  variant: DetailVariant
}
export interface DemoFaults {
  slowNextDetail: boolean
  ignoreCancellation: boolean
  failNextOrders: boolean
  failNextDetail: boolean
  emptyNextDetail: boolean
  failNextDictionary: boolean
}
export const DEFAULT_FAULTS: DemoFaults = {
  slowNextDetail: false,
  ignoreCancellation: false,
  failNextOrders: false,
  failNextDetail: false,
  emptyNextDetail: false,
  failNextDictionary: false,
}
const DELIVERY_FIELDS: RemoteField[] = [
  { key: 'lineNo', title: '明细编号' },
  { key: 'product', title: '产品名称' },
  { key: 'grade', title: '钢种' },
  { key: 'quantity', title: '订货重量 (t)', kind: 'number' },
  { key: 'warehouse', title: '交付仓库' },
  { key: 'urgent', title: '交付要求', kind: 'boolean' },
  { key: 'status', title: '明细状态', kind: 'status' },
]
const QUALITY_FIELDS: RemoteField[] = [
  { key: 'lineNo', title: '明细编号' },
  { key: 'product', title: '产品名称' },
  { key: 'batch', title: '生产批次' },
  { key: 'inspectionNo', title: '第三方质量检验报告编号' },
  { key: 'completedWeight', title: '实绩重量 (t)', kind: 'number' },
  { key: 'status', title: '明细状态', kind: 'status' },
  { key: 'urgent', title: '交付要求', kind: 'boolean' },
]
const FIELD_KINDS = new Set<unknown>([undefined, 'number', 'status', 'boolean'])

/** 项目请求边界只拆一次业务包络，表格使用标准 rows/total。 */
export function toOrderPage(response: PageEnvelope<RemoteOrder>) {
  return { rows: response.data.records, total: response.data.total }
}

/** 动态列与本次行数据来自同一响应，包括零行响应。 */
export function toDetailPage(response: DetailEnvelope): DetailPage {
  const { records, total, fields, variant } = response.data
  if (
    !Array.isArray(fields) ||
    !fields.every(isRemoteField) ||
    new Set(fields.map(field => field.key)).size !== fields.length
  )
    throw new TypeError('订单明细字段配置无效或重复')
  if (variant !== 'delivery' && variant !== 'quality')
    throw new TypeError('订单明细字段方案无效')
  return { rows: records, total, columns: fields, variant }
}

/** 列字段在进入 query 前校验，避免坏列与已接受的有效数据混合。 */
function isRemoteField(value: unknown): value is RemoteField {
  if (value === null || typeof value !== 'object') return false
  if (!('key' in value) || !('title' in value)) return false
  const validText = [value.key, value.title].every(
    text => typeof text === 'string' && text.trim().length > 0
  )
  return validText && (!('kind' in value) || FIELD_KINDS.has(value.kind))
}

/** 仅恢复 toDetailPage 已校验的项目元数据，不重复解析或复制接受后的快照。 */
export function readDetailSnapshot(result: {
  rows: readonly RemoteLine[]
  total: number
}): DetailPage {
  return result as DetailPage
}

/** 使用实际 SortModel 的 direction 协议，逐列比较以保留稳定的多列排序。 */
function compareRows<T extends object>(
  left: T,
  right: T,
  sorts: SortModel
): number {
  for (const sort of sorts) {
    const a = left[sort.colId as keyof T]
    const b = right[sort.colId as keyof T]
    const result =
      typeof a === 'number' && typeof b === 'number'
        ? a - b
        : String(a ?? '').localeCompare(String(b ?? ''), 'zh-CN')
    if (result !== 0) return sort.direction === 'asc' ? result : -result
  }
  return 0
}

/** 服务端分页与排序在此模拟；只取所需页，不向页面一次交付全部数据。 */
function pageRows<T extends object>(rows: T[], params: PageRequest<unknown>) {
  const sorted = [...rows]
  const sorts = params.sortModel ?? []
  if (sorts.length)
    sorted.sort((left, right) => compareRows(left, right, sorts))
  const offset = (params.page - 1) * params.pageSize
  return {
    records: sorted.slice(offset, offset + params.pageSize),
    total: rows.length,
  }
}

/** 每个页面实例拥有独立样例数据与故障开关，卸载后无全局缓存或定时任务。 */
export function createRemoteOrderDemoApi(faults: DemoFaults) {
  const customers = ['星海科技', '云帆智造', '远川能源', '华东建设']
  const orders: RemoteOrder[] = Array.from({ length: 13 }, (_, index) => ({
    id: `RO-${index + 1}`,
    orderNo: `SO-20261112-${String(index + 1).padStart(3, '0')}`,
    customer: customers[index % customers.length],
    status: index % 3,
    urgent: index % 4 === 2,
    owner: index % 2 ? '林珊' : '陈雨',
    note: index === 0 ? '优先核对交付仓库与质量报告。' : '',
    delivery: `2026-11-${String(15 + (index % 10)).padStart(2, '0')}`,
    weight: index === 12 ? 0 : 120 + index * 12.5,
  }))
  const stats = { orders: 0, details: 0, dictionaries: 0 }

  /** 单次查询故障只由当前请求消费，不影响另一张表。 */
  async function getOrdersApi(params: PageRequest<OrderSearch>) {
    stats.orders++
    const fail = faults.failNextOrders
    faults.failNextOrders = false
    await delayWithSignal(240, params.signal)
    if (fail) throw new Error('订单查询暂未完成，请重试。当前单据仍可查看。')
    const { keyword, status, urgent } = params.query
    const rows = orders.filter(row => {
      const matches = `${row.orderNo} ${row.customer}`.includes(keyword.trim())
      return (
        matches &&
        (status === null || row.status === status) &&
        (urgent === null || row.urgent === urgent)
      )
    })
    return {
      code: 0,
      data: pageRows(
        rows.map(row => ({ ...row })),
        params
      ),
    }
  }

  /** 字段方案和数据一次生成；可演练不遵守取消的旧后端迟到回包。 */
  async function getOrderLinesApi(
    params: PageRequest<DetailSearch>
  ): Promise<DetailEnvelope> {
    // 无主单上下文时返回空快照；接入真实传输也不应请求空订单号。
    if (!params.query.orderId)
      return {
        code: 0,
        data: {
          records: [],
          total: 0,
          fields: [],
          variant: params.query.variant,
        },
      }
    stats.details++
    const {
      slowNextDetail: slow,
      ignoreCancellation: ignore,
      failNextDetail: fail,
      emptyNextDetail: empty,
    } = faults
    faults.slowNextDetail = false
    faults.ignoreCancellation = false
    faults.failNextDetail = false
    faults.emptyNextDetail = false
    await delayWithSignal(slow ? 1400 : 320, ignore ? undefined : params.signal)
    if (fail) throw new Error('商品明细加载失败，请重试；订单列表不受影响。')
    const { orderId, variant } = params.query
    const order = orders.find(row => row.id === orderId)
    if (!order) throw new Error('当前订单不存在，请重新选择。')
    const count = empty || order.id === 'RO-13' ? 0 : 9
    const rows: RemoteLine[] = Array.from({ length: count }, (_, index) => ({
      id: `${order.id}-L${index + 1}`,
      orderId: order.id,
      lineNo: `${order.orderNo.slice(-3)}-${String(index + 1).padStart(2, '0')}`,
      product: ['精整卷材', '冷轧板材', '热轧型钢'][index % 3],
      grade: index % 2 ? 'Q355B' : 'Q235B',
      quantity: index === 0 ? 0 : 12.125 + index,
      warehouse: index % 2 ? '南京成品仓' : '上海周转仓',
      urgent: index % 3 === 2,
      status: index % 3,
      batch: `B-${order.id.slice(3)}-${index + 1}`,
      inspectionNo:
        index === 0 ? '' : `QA-20261112-${order.id.slice(3)}-${index + 1}`,
      completedWeight: index === 0 ? 0 : 10.625 + index,
    }))
    return {
      code: 0,
      data: {
        ...pageRows(rows, params),
        fields: (variant === 'quality' ? QUALITY_FIELDS : DELIVERY_FIELDS).map(
          field => ({ ...field })
        ),
        variant,
      },
    }
  }

  /** 字典独立异步获取，表格请求不等待它；0 与 false 保留原始类型。 */
  async function getDictionaryOptionsApi(
    name: string,
    signal: AbortSignal
  ): Promise<DictionaryOption[]> {
    stats.dictionaries++
    const fail = faults.failNextDictionary && name === 'remote-status'
    if (name === 'remote-status') faults.failNextDictionary = false
    await delayWithSignal(1100, signal)
    if (fail) throw new Error('状态字典暂不可用，已保留原始值，可重新加载。')
    if (name === 'remote-status')
      return [
        { value: 0, label: '待下达' },
        { value: 1, label: '执行中' },
        { value: 2, label: '已完成' },
      ]
    return [
      { value: false, label: '普通交付' },
      { value: true, label: '优先交付' },
    ]
  }

  /** 仅保存当前页面实例的草稿，不向外部系统发送任何写请求。 */
  async function saveOrderDraftApi(
    id: string,
    draft: OrderDraft,
    signal: AbortSignal
  ) {
    await delayWithSignal(220, signal)
    const row = orders.find(item => item.id === id)
    if (!row) throw new Error('订单不存在')
    Object.assign(row, draft)
    return { ...row }
  }

  /** 删除只作用于当前实例；再次核对状态，不能越过待下达约束。 */
  async function removeOrderApi(id: string, signal: AbortSignal) {
    await delayWithSignal(220, signal)
    const index = orders.findIndex(row => row.id === id)
    if (index < 0) throw new Error('订单不存在或已删除')
    if (orders[index].status !== 0) throw new Error('只有待下达订单可以删除')
    orders.splice(index, 1)
  }

  return {
    getOrdersApi,
    getOrderLinesApi,
    getDictionaryOptionsApi,
    saveOrderDraftApi,
    removeOrderApi,
    stats,
  }
}
