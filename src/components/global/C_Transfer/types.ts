/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\components\global\C_Transfer\types.ts
 * @Description: 穿梭框组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 穿梭框数据项 */
export interface TransferItem {
  /** 唯一标识 */
  key: string | number
  /** 显示标签 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 分组名称 */
  group?: string
  /** 描述信息（用于详细模式） */
  description?: string
  /** 图标（Iconify） */
  icon?: string
  /** 额外数据 */
  extra?: Record<string, unknown>
}

/** 组件 Props */
export interface TransferProps {
  /** 数据源 */
  data: TransferItem[]
  /** 右侧已选 key 列表 (v-model) */
  modelValue: Array<string | number>
  /** 左右栏标题 */
  titles?: [string, string]
  /** 是否可搜索 */
  filterable?: boolean
  /** 搜索占位符 */
  filterPlaceholder?: string
  /** 自定义筛选函数 */
  filterMethod?: (query: string, item: TransferItem) => boolean
  /** 是否显示全选复选框 */
  showSelectAll?: boolean
  /** 右侧列表是否可排序（拖拽） */
  sortable?: boolean
  /** 左侧空状态描述 */
  sourceEmptyText?: string
  /** 右侧空状态描述 */
  targetEmptyText?: string
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
}

/** 默认 Props */
export const DEFAULT_TRANSFER_PROPS: Partial<TransferProps> = {
  titles: ['可选列表', '已选列表'],
  filterable: false,
  filterPlaceholder: '搜索...',
  showSelectAll: true,
  sortable: false,
  sourceEmptyText: '暂无数据',
  targetEmptyText: '未选择任何项',
  size: 'medium',
}
