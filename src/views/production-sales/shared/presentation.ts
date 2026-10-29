/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\shared\presentation.ts
 * @Description: 产销页面共享展示契约，业务数据及状态由各页面独立持有
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { defineVueTableConfig } from '@agile-team/mach-table-vue'
import { createNumberCodec } from '@robot-admin/naive-ui-components/data'
import type { FormConfig } from '@robot-admin/naive-ui-components/C_Form'

export const BUSINESS_FORM = {
  density: 'compact',
  layout: 'grid',
  grid: { cols: 2, minItemWidth: 250, xGap: 20, yGap: 10 },
  labelPlacement: 'left',
  labelWidth: 100,
  validateOnChange: true,
} satisfies FormConfig

export const BUSINESS_GRID = defineVueTableConfig({
  rowKey: 'id',
  size: 'compact',
  rowHeight: 30,
  headerHeight: 36,
  columnLayout: 'fit',
  stripedRows: true,
  showCellBorders: true,
  enableColumnResize: true,
  columnMenu: true,
  pagination: false,
  defaultColDef: { minWidth: 88, filter: true, headerAlign: 'center' },
})
export const weightCodec = createNumberCodec({
  storage: 'number',
  fractionDigits: 3,
  useGrouping: true,
})
/** 状态标签只消费页面状态映射，不在单元格内查询字典或写入共享数据。 */
export const statusTag = (
  label: string,
  type: 'info' | 'success' | 'warning' | 'error' | 'default' = 'info'
) => h(NTag, { size: 'small', type, bordered: false, round: true }, () => label)

/** 业务主键按钮同时提供清晰的键盘入口。 */
export const recordLink = (label: string, onClick: () => void) =>
  h('button', { class: 'ps-record-link', type: 'button', onClick }, label)

export const PAGE_ICON =
  'M3 3h7v7H3V3m2 2v3h3V5H5m9-2h7v7h-7V3m2 2v3h3V5h-3M3 14h7v7H3v-7m2 2v3h3v-3H5m9-2h7v7h-7v-7m2 2v3h3v-3h-3Z'
