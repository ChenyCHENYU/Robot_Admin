/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\columns.ts
 * @Description: 订单业务列、树表和排序列及初始网格设置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { NProgress, NTag } from 'naive-ui'
import {
  defineVueTableConfig,
  defineVueColumns,
  dragColumn,
  indexColumn,
  rowActionsColumn,
  selectionColumn,
  type RowActionsConfig,
} from '@agile-team/mach-table-vue'
import {
  MONEY_FORMATTER,
  REGIONS,
  STATUS_OPTIONS,
  getStatusMeta,
  type OrderRow,
} from './data'
import { DEFAULT_MACH_FEATURE_SETTINGS, toMachFeatureOptions } from './features'

/** 订单业务列：普通值直接声明，富内容优先使用 Vue render。 */
const createOrderBusinessColumns = (
  editMode: () => 'none' | 'cell' | 'row',
  tree = false
) => {
  const inlineEditable = () => editMode() !== 'none'

  return defineVueColumns<OrderRow>([
    {
      field: 'orderNo',
      // 树层级与普通订单列隔离身份，避免复用已保存的窄列宽和排序。
      colId: tree ? 'treeLabel' : 'orderNo',
      headerName: tree ? '区域 / 客户 / 订单' : '订单编号',
      width: tree ? 280 : 164,
      minWidth: tree ? 250 : 150,
      pinned: 'left',
      align: tree ? 'left' : 'center',
      headerAlign: tree ? 'left' : 'center',
      initialSort: tree ? undefined : 'desc',
    },
    {
      field: 'customer',
      headerName: '客户名称',
      width: 160,
      minWidth: 140,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      editable: inlineEditable,
    },
    {
      field: 'product',
      headerName: '产品方案',
      width: 210,
      minWidth: 165,
      flex: 1.15,
      align: 'center',
      headerAlign: 'center',
      editable: inlineEditable,
    },
    {
      field: 'region',
      headerName: '区域',
      width: 100,
      minWidth: 100,
      maxWidth: 150,
      filter: 'set',
      editable: inlineEditable,
      cellEditor: 'select',
      cellEditorParams: {
        options: REGIONS.map(value => ({ label: value, value })),
      },
    },
    {
      field: 'quantity',
      headerName: '数量',
      width: 90,
      maxWidth: 128,
      filter: 'number',
      editable: inlineEditable,
      cellEditor: 'number',
      validate: value => Number(value) > 0 || '数量必须大于 0',
    },
    {
      field: 'amount',
      headerName: '订单金额',
      width: 138,
      minWidth: 138,
      maxWidth: 200,
      filter: 'number',
      editable: inlineEditable,
      cellEditor: 'number',
      valueFormatter: ({ value }) => MONEY_FORMATTER.format(Number(value ?? 0)),
      validate: value => Number(value) >= 0 || '金额不能为负数',
    },
    {
      field: 'status',
      headerName: '状态',
      width: 124,
      minWidth: 124,
      maxWidth: 160,
      filter: 'set',
      editable: inlineEditable,
      cellEditor: 'select',
      cellEditorParams: { options: STATUS_OPTIONS },
      render: row => {
        const status = getStatusMeta(row.status)
        return h(
          NTag,
          {
            round: true,
            size: 'small',
            bordered: false,
            type: status.tagType,
          },
          { default: () => status.label }
        )
      },
    },
    {
      field: 'progress',
      headerName: '履约进度',
      width: 150,
      minWidth: 150,
      maxWidth: 220,
      filter: 'number',
      editable: inlineEditable,
      cellEditor: 'number',
      validate: value =>
        (Number(value) >= 0 && Number(value) <= 100) || '进度范围为 0–100',
      render: row =>
        h(NProgress, {
          type: 'line',
          percentage: row.progress,
          height: 6,
          showIndicator: false,
          status: row.progress === 100 ? 'success' : 'default',
        }),
    },
    {
      field: 'updatedAt',
      headerName: '更新时间',
      width: 126,
      minWidth: 126,
      maxWidth: 190,
      filter: 'date',
      editable: inlineEditable,
      cellEditor: 'date',
    },
  ])
}

export const createOrderColumns = (
  editMode: () => 'none' | 'cell' | 'row',
  actions: RowActionsConfig<OrderRow>
) =>
  defineVueColumns<OrderRow>([
    selectionColumn<OrderRow>(),
    ...createOrderBusinessColumns(editMode),
    rowActionsColumn<OrderRow>({
      width: 126,
      max: 3,
      ...actions,
      onEdit: params =>
        editMode() === 'row'
          ? params.api.editing.startRow(params.rowIndex)
          : actions.onEdit?.(params),
      confirmDelete: false,
      labels: {
        ...actions.labels,
        /** 根据当前场景展示准确的编辑动作名称。 */
        get edit() {
          return editMode() === 'row' ? '整行编辑' : '编辑'
        },
        confirm: actions.labels?.confirm ?? '保存修改',
        cancel: actions.labels?.cancel ?? '取消修改',
      },
    }),
  ])

/** 树形场景复用相同业务列，但不混入会修改 CRUD 数据源的操作列。 */
export const createOrderTreeColumns = () =>
  defineVueColumns<OrderRow>([
    selectionColumn<OrderRow>(),
    indexColumn<OrderRow>({ headerName: '序号' }),
    ...createOrderBusinessColumns(() => 'none', true),
  ])

/** 手动顺序与字段排序分开演示，避免初始倒序或历史视图覆盖拖拽结果。 */
export const createOrderReorderColumns = () =>
  defineVueColumns<OrderRow>([
    dragColumn<OrderRow>(),
    selectionColumn<OrderRow>(),
    indexColumn<OrderRow>({ headerName: '序号' }),
    ...createOrderBusinessColumns(() => 'none').map(column => ({
      ...column,
      initialSort: undefined,
      sortable: false,
      filter: false as const,
    })),
  ])

/** 页面稳定配置；行数据、列、搜索、主题和事件仍由页面显式传入。 */
export const ORDER_TABLE_CONFIG = defineVueTableConfig<OrderRow>({
  defaultColDef: {
    minWidth: 90,
    filter: true,
    align: 'center',
    headerAlign: 'center',
  },
  ...toMachFeatureOptions(DEFAULT_MACH_FEATURE_SETTINGS),
  persistence: {
    // v3 固化“多选 → 序号 → 业务列”的结构，自动隔离旧版本错误列序。
    key: 'robot-admin:demo:mach-table:orders:v3',
    sections: ['columns', 'sort', 'filter', 'pagination'],
    debounceMs: 200,
  },
  rowKey: 'id',
  summaryMethod: ({ colId, values }) => {
    if (colId === 'orderNo' || colId === 'treeLabel')
      return `合计 ${values.length} 行`
    if (colId === 'quantity')
      return String(values.reduce((sum, value) => sum + Number(value || 0), 0))
    if (colId === 'amount')
      return MONEY_FORMATTER.format(
        values.reduce((sum, value) => sum + Number(value || 0), 0)
      )
    if (colId === 'progress' && values.length) {
      const total = values.reduce((sum, value) => sum + Number(value || 0), 0)
      return `平均 ${Math.round(total / values.length)}%`
    }
    return ''
  },
  gridAriaLabel: '订单管理数据表格',
})
