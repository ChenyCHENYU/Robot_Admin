/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\remote-workbench\useRemoteOrderLines.ts
 * @Description: 订单明细查询、已接受的字段快照及跨单切换边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineVueColumns,
  indexColumn,
  selectionColumn,
  useMachTable,
} from '@agile-team/mach-table-vue'
import { useMachTableQuery } from '@agile-team/mach-table-vue/workflows'
import { weightCodec } from '../shared/presentation'
import {
  toDetailPage,
  type createRemoteOrderDemoApi,
  type DetailVariant,
  type RemoteField,
  type RemoteLine,
} from './api'

interface OrderLinesOptions {
  orderId: Readonly<Ref<string>>
  request: ReturnType<typeof createRemoteOrderDemoApi>['getOrderLinesApi']
  statusLabel: (value: unknown) => string
  urgentLabel: (value: unknown) => string
  statusCell: (
    value: unknown
  ) => ReturnType<(typeof import('../shared/presentation'))['statusTag']>
}

/** 只根据 query 接受的请求结果切换字段，空响应也提交对应的版本。 */
export function useRemoteOrderLines({
  orderId,
  request,
  statusLabel,
  urgentLabel,
  statusCell,
}: OrderLinesOptions) {
  const grid = useMachTable<RemoteLine>()
  const variant = ref<DetailVariant>('delivery')
  const accepted = shallowRef<{
    variant: DetailVariant
    columns: RemoteField[]
  }>({
    variant: 'delivery',
    columns: [],
  })
  const query = useMachTableQuery({
    rowKey: 'id',
    query: () => ({ orderId: orderId.value, variant: variant.value }),
    immediate: false,
    pageSize: 4,
    pageSizeOptions: [4, 8],
    keepPreviousData: true,
    request: async params => toDetailPage(await request(params)),
    errorOverlay: () =>
      '明细加载失败，请点击上方“重试明细”；订单列表仍可使用。',
    onSuccess: ({ columns, variant }) => {
      const current = accepted.value
      // 同一方案翻页时沿用原列定义，避免反复生成格式化和渲染函数。
      if (
        current.variant === variant &&
        current.columns.length === columns.length &&
        columns.every(({ key, title, kind }, index) => {
          const old = current.columns[index]
          return old.key === key && old.title === title && old.kind === kind
        })
      )
        return
      accepted.value = { columns, variant }
    },
  })
  const clearRows = () => {
    query.abort()
    query.clearSelection()
    query.rows.value = []
    query.total.value = 0
  }
  const columns = computed(() =>
    defineVueColumns<RemoteLine>([
      selectionColumn(),
      indexColumn({ headerName: '序号', width: 48 }),
      ...accepted.value.columns.map(field => ({
        field: field.key,
        colId: field.key,
        headerName: field.title,
        ...(field.kind === 'number' && {
          valueFormatter: ({ value }: { value: unknown }) =>
            weightCodec.format(typeof value === 'number' ? value : null),
        }),
        ...(field.kind === 'boolean' && {
          valueFormatter: ({ value }: { value: unknown }) => urgentLabel(value),
        }),
        ...(field.kind === 'status' && {
          valueFormatter: ({ value }: { value: unknown }) => statusLabel(value),
          render: (row: RemoteLine) => statusCell(row[field.key]),
        }),
      })),
    ])
  )
  return proxyRefs({
    grid,
    query,
    variant,
    columns,
    clearRows,
    acceptedVariant: computed(() => accepted.value.variant),
  })
}
