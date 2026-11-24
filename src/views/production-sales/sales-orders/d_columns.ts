/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\d_columns.ts
 * @Description: 销售订单、订单明细与付款的列定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  defineVueColumns,
  indexColumn,
  actionsColumn,
  selectionColumn,
} from '@agile-team/mach-table-vue'
import type { useFieldDictionaries } from '@/composables/useFieldDictionaries'
import {
  customerLabels,
  decimalMillis,
  moneyCodec,
  quantityCodec,
  type OrderHeader,
  type OrderLine,
} from './data'
import type { useSalesOperations } from './operations'

/** 列渲染消费公开动作，订单草稿、权限和保存状态由工作台拥有。 */
export function createSalesColumns(
  operations: Pick<
    ReturnType<typeof useSalesOperations>,
    | 'openDetail'
    | 'editOrder'
    | 'removeOrder'
    | 'copyOrder'
    | 'openLineDetail'
    | 'editLine'
    | 'removeLine'
  >,
  fieldDictionaries: Pick<
    ReturnType<typeof useFieldDictionaries>,
    'label' | 'parse'
  >,
  blocked: () => boolean
) {
  const masterColumns = defineVueColumns<OrderHeader>([
    indexColumn({ headerName: '序号', width: 46 }),
    {
      field: 'orderNo',
      headerName: '销售订单号',
      width: 170,
      pinned: 'left',
      filter: true,
      render: row =>
        h(
          'button',
          {
            type: 'button',
            class: 'workbench-order-link',
            onClick: (event: MouseEvent) => {
              event.stopPropagation()
              void operations.openDetail(row)
            },
            'aria-label': `查看${row.orderNo}详情`,
          },
          row.orderNo
        ),
    },
    {
      field: 'customer',
      headerName: '客户名称',
      width: 130,
      filter: true,
      valueFormatter: ({ value }) =>
        customerLabels.get(String(value)) ?? String(value ?? '—'),
    },
    { field: 'contractNo', headerName: '合同编号', filter: true },
    { field: 'grade', headerName: '钢种', filter: true },
    { field: 'section', headerName: '规格 (mm)', minWidth: 160 },
    { field: 'region', headerName: '区域', width: 80 },
    {
      field: 'targetWeight',
      headerName: '合同量 (t)',
      width: 110,
      valueFormatter: ({ value }) => quantityCodec.format(value),
    },
    {
      field: 'status',
      headerName: '状态',
      width: 105,
      valueFormatter: ({ value }) => fieldDictionaries.label('status', value),
      valueParser: ({ value }) => fieldDictionaries.parse('status', value),
      valueSerializer: ({ value, target }) =>
        target === 'clipboard' || target === 'csv'
          ? fieldDictionaries.label('status', value)
          : value,
      status: true,
    },
    {
      field: 'progress',
      headerName: '履约进度',
      width: 145,
      render: row =>
        h(
          'div',
          {
            class: 'sales-progress',
            role: 'progressbar',
            'aria-valuenow': row.progress,
            'aria-valuemin': 0,
            'aria-valuemax': 100,
            'aria-label': `${row.orderNo}履约进度`,
          },
          [
            h('span', {
              style: { width: `${row.progress}%` },
              class: { 'is-complete': row.progress === 100 },
            }),
            h('small', `${row.progress}%`),
          ]
        ),
    },
    { field: 'delivery', headerName: '交货日期', width: 118 },
    actionsColumn<OrderHeader>({
      width: 88,
      actions: [
        {
          icon: 'edit',
          label: '编辑订单',
          variant: 'warning',
          disabled: ({ data }) => data?.status !== 0 || blocked(),
          onClick: ({ data }) => data && operations.editOrder(data),
        },
        {
          icon: 'delete',
          label: '删除订单',
          variant: 'danger',
          disabled: ({ data }) => data?.status !== 0 || blocked(),
          onClick: ({ data }) => data && operations.removeOrder(data),
        },
        {
          icon: 'copy',
          label: '复制订单',
          disabled: () => blocked(),
          onClick: ({ data }) => data && operations.copyOrder(data),
        },
      ],
    }),
  ])

  const lineIdColumn = {
    field: 'id',
    headerName: '明细编号',
    width: 145,
    pinned: 'left',
  } as const
  const lineColumns = defineVueColumns<OrderLine>([
    { field: 'product', headerName: '商品', width: 150 },
    {
      field: 'quantity',
      headerName: '数量 (t)',
      width: 130,
      editable: true,
      valueParser: ({ value }) => {
        const parsed = quantityCodec.parse(value)
        if (parsed !== null) decimalMillis(parsed)
        return parsed
      },
      valueFormatter: ({ value }) => quantityCodec.format(value),
      valueSerializer: ({ value }) => value,
    },
    {
      field: 'amount',
      headerName: '金额 (CNY)',
      width: 155,
      valueFormatter: ({ value }) => moneyCodec.format(value),
      valueSerializer: ({ value }) => value,
    },
    {
      field: 'note',
      headerName: '备注',
      minWidth: 160,
      editable: true,
    },
  ])
  const detailColumns = defineVueColumns<OrderLine>([
    selectionColumn(),
    indexColumn({ headerName: '序号', width: 46 }),
    {
      ...lineIdColumn,
      render: row =>
        h(
          'button',
          {
            type: 'button',
            class: 'workbench-order-link',
            onClick: (event: MouseEvent) => {
              event.stopPropagation()
              void operations.openLineDetail(row)
            },
          },
          row.id
        ),
    },
    ...lineColumns,
    actionsColumn<OrderLine>({
      width: 72,
      actions: [
        {
          icon: 'edit',
          label: '编辑明细',
          variant: 'warning',
          disabled: () => blocked(),
          onClick: ({ data }) => data && operations.editLine(data),
        },
        {
          icon: 'delete',
          label: '删除明细',
          variant: 'danger',
          disabled: () => blocked(),
          onClick: ({ data }) => data && operations.removeLine(data),
        },
      ],
    }),
  ])
  const readonlyDetailColumns = [
    indexColumn({ headerName: '序号', width: 46 }),
    lineIdColumn,
    ...lineColumns.map(column => ({ ...column, editable: false })),
  ]
  const paymentColumns = defineVueColumns<{
    id: string
    stage: string
    amount: string
  }>([
    indexColumn({ headerName: '序号', width: 46 }),
    { field: 'stage', headerName: '币种' },
    {
      field: 'amount',
      headerName: '测算金额',
      width: 160,
      valueFormatter: ({ value }) => moneyCodec.format(value),
    },
  ])
  return { masterColumns, detailColumns, readonlyDetailColumns, paymentColumns }
}
