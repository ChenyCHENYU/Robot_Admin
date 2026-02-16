/*
 * @Description: ColumnSettings 配置与工具函数
 */

import type { TableColumn } from '@/types/modules/table'

/** 固定列下拉选项  */
export const getFixedOptions = (column: TableColumn) => [
  {
    label: column.fixed ? '✓ 取消固定' : '不固定',
    key: 'none',
    disabled: !column.fixed,
  },
  {
    label: column.fixed === 'left' ? '✓ 固定左侧' : '固定左侧',
    key: 'left',
    disabled: false,
  },
  {
    label: column.fixed === 'right' ? '✓ 固定右侧' : '固定右侧',
    key: 'right',
    disabled: false,
  },
]

/** 不可操作的特殊列 key */
export const SPECIAL_COLUMN_KEYS = ['_actions'] as const

/** 不可拖拽的列 type */
export const SPECIAL_COLUMN_TYPES = ['selection', 'expand'] as const

/** 判断是否为特殊列（不可调宽、不可拖拽） */
export const isSpecialColumn = (column: TableColumn): boolean =>
  SPECIAL_COLUMN_KEYS.includes(
    column.key as (typeof SPECIAL_COLUMN_KEYS)[number]
  ) ||
  SPECIAL_COLUMN_TYPES.includes(
    column.type as (typeof SPECIAL_COLUMN_TYPES)[number]
  )
