/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-27
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\components\c_largeData\data.ts
 * @Description: 千万逻辑行的有界模拟数据源与宽表列配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ColDef, GridDatasource } from '@agile-team/mach-table-vue'

export const LARGE_ROW_COUNT = 10_000_000
export const LARGE_ROW_HEIGHT = 32
export const LARGE_BLOCK_SIZE = 200
export const LARGE_MIDDLE_ROW = LARGE_ROW_COUNT / 2

export interface LargeDataRow {
  id: string
  sequence: number
  orderNo: string
  customer: string
  region: string
  status: string
}

const CUSTOMERS = ['星海科技', '云帆智造', '远川零售', '青禾医疗']
const REGIONS = ['华东', '华南', '华北', '西南']
const STATUSES = ['待处理', '履约中', '已完成', '需关注']

/** 按绝对行号生成一个有限区间，单次最多一个块，不物化千万行数组。 */
export function createLargeRows(start: number, end: number): LargeDataRow[] {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return []
  const first = Math.max(0, Math.trunc(start))
  const stop = Math.min(
    Math.trunc(end),
    first + LARGE_BLOCK_SIZE,
    LARGE_ROW_COUNT
  )
  return Array.from({ length: Math.max(0, stop - first) }, (_, offset) => {
    const index = first + offset
    const sequence = index + 1
    return {
      id: `large-${sequence}`,
      sequence,
      orderNo: `ML-${String(sequence).padStart(8, '0')}`,
      customer: CUSTOMERS[index % CUSTOMERS.length]!,
      region: REGIONS[index % REGIONS.length]!,
      status: STATUSES[index % STATUSES.length]!,
    }
  })
}

/** 1 基输入在进入 API 前归一化；空值和非数值保持为无效输入。 */
export function normalizeLargeRow(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null
  return Math.max(1, Math.min(LARGE_ROW_COUNT, Math.trunc(value)))
}

/** 每个组件独占一个模拟传输，暂停和销毁都会立即释放请求资源。 */
export function createLargeDataSource() {
  const pending = new Set<() => void>()
  let active = true
  let disposed = false

  /** 统一使用取消错误，停用演示不冒充业务失败，也不会触发重试。 */
  const cancelled = (): DOMException =>
    new DOMException('超大数据模拟请求已取消', 'AbortError')

  const datasource: GridDatasource<LargeDataRow> = {
    /** 模拟远端块读取；每条退出路径都回收计时器与取消监听。 */
    getRows(params) {
      if (!active || disposed || params.signal.aborted) {
        params.fail(cancelled())
        return
      }
      let settled = false
      /** 成功、取消、暂停、卸载均先清理，再向表格回调，允许回调重入。 */
      const finish = (aborted = false): void => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        params.signal.removeEventListener('abort', abort)
        pending.delete(abort)
        if (aborted) params.fail(cancelled())
        else
          params.onSuccess(
            createLargeRows(params.startRow, params.endRow),
            LARGE_ROW_COUNT
          )
      }
      const abort = (): void => finish(true)
      const timer = setTimeout(() => finish(), 8)
      pending.add(abort)
      params.signal.addEventListener('abort', abort, { once: true })
      if (params.signal.aborted) abort()
    },
  }

  /** 先关闭入口再取消，避免失败回调同步重入时创建新计时器。 */
  const pause = (): void => {
    active = false
    for (const abort of pending) abort()
  }
  return {
    datasource,
    /** 当前实例尚未完成的模拟请求数，用于取消边界回归。 */
    get pendingCount() {
      return pending.size
    },
    pause,
    resume: (): void => {
      if (!disposed) active = true
    },
    dispose: (): void => {
      disposed = true
      pause()
    },
  }
}

/** 中间 46 列触发横向虚拟化；指标按需计算，不给每条记录塞入 44 个字段。 */
export const LARGE_COLUMNS: ColDef<LargeDataRow>[] = [
  { field: 'sequence', headerName: '序号', width: 100, pinned: 'left' },
  { field: 'orderNo', headerName: '订单编号', width: 170, pinned: 'left' },
  { field: 'customer', headerName: '客户', width: 150 },
  { field: 'region', headerName: '区域', width: 110 },
  ...Array.from({ length: 44 }, (_, index): ColDef<LargeDataRow> => ({
    colId: `metric-${index + 1}`,
    headerName: `指标 ${String(index + 1).padStart(2, '0')}`,
    width: 128,
    align: 'right',
    valueGetter: ({ data }) =>
      data ? (data.sequence * (index + 3)) % 100_000 : '',
  })),
  { field: 'status', headerName: '状态', width: 110, pinned: 'right' },
]
