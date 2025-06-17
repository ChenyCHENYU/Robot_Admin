/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-17 18:27:13
 * @FilePath: \Robot_Admin\src\types\modules\table.d.ts
 * @Description: 表格类型系统
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
import type { VNodeChild, Ref, ComputedRef } from 'vue'
import type { FormItemRule } from 'naive-ui/es/form'

// ================= 核心类型定义 =================

// 🔥 统一数据记录类型 - 所有组件和 Hook 都使用这个
export type DataRecord = Record<string, unknown>

export type EditMode = 'row' | 'cell' | 'both' | 'modal' | 'none'

export type EditType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'date'
  | 'number'
  | 'switch'
  | 'email'
  | 'mobile'

export type ButtonType =
  | 'default'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

export type ParentChildLinkMode = 'strict' | 'loose'

// ================= 数据映射类型 =================

// 通用选项类型
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 预设数据映射类型
export interface DataMapping {
  [key: string]: string
}

// 常用数据映射
export interface CommonMappings {
  gender: DataMapping
  department: DataMapping
  status: DataMapping
}

// ================= 编辑相关类型 =================

// 编辑属性配置
export interface EditProps {
  min?: number
  max?: number
  step?: number
  showButton?: boolean
  type?: string
  rows?: number
  placeholder?: string
  options?: SelectOption[]
  rules?: FormItemRule[]
  format?: string
  valueFormat?: string
  clearable?: boolean
  disabled?: boolean
  readonly?: boolean
}

// 表格列配置 - 使用统一的 DataRecord 约束
export interface TableColumn<T extends DataRecord = DataRecord>
  extends Omit<DataTableColumns<T>[number], 'key' | 'render'> {
  key: keyof T | string
  title: string
  editable?: boolean
  required?: boolean
  editType?: EditType
  editProps?: EditProps
  editRender?: (value: any, rowData: T, rowIndex: number) => VNodeChild
  render?: (rowData: T, rowIndex: number) => VNodeChild
}

// 行操作配置 - 使用统一的 DataRecord 约束
export interface RowAction<T extends DataRecord = DataRecord> {
  label: string
  icon?: string
  type?: ButtonType
  onClick: (row: T, index: number) => void
  show?: (row: T, index: number) => boolean
  disabled?: (row: T, index: number) => boolean
}

// ================= 🔥 展开和选择功能类型定义 =================

// 子选择状态
export interface ChildSelectionState {
  selectedKeys: DataTableRowKey[]
  isAllChecked: boolean
  selectAll: () => void
  clearAll: () => void
}

// 展开配置选项 - 使用统一的 DataRecord 约束
export interface ExpandConfig<T extends DataRecord = DataRecord, C = any> {
  // 数据加载函数
  onLoadData?: (row: T) => Promise<C[]> | C[]

  // 内容渲染函数
  renderContent?: (
    row: T,
    expandData: C[],
    loading: boolean,
    childSelection?: ChildSelectionState
  ) => VNodeChild

  // 行可展开判断
  rowExpandable?: (row: T) => boolean
}

// 选择配置选项 - 使用统一的 DataRecord 约束
export interface SelectionConfig<T extends DataRecord = DataRecord> {
  // 基础选择配置
  enableSelection?: boolean
  defaultCheckedKeys?: DataTableRowKey[]
  rowCheckable?: (row: T) => boolean
  maxSelection?: number

  // 子选择配置
  enableChildSelection?: boolean
  childRowCheckable?: (childRow: any, parentRow: T) => boolean

  // 父子联动配置
  enableParentChildLink?: boolean
  parentChildLinkMode?: ParentChildLinkMode
}

// ================= 表格组件类型 - 增强版 =================

// 表格属性 - 使用统一的 DataRecord 约束
export interface TableProps<T extends DataRecord = DataRecord> {
  // 数据相关
  columns: TableColumn<T>[]
  data: T[]
  rowKey?: (row: T) => DataTableRowKey
  loading?: boolean

  // 显示相关
  maxHeight?: number | string
  minHeight?: number | string
  scrollX?: number | string
  striped?: boolean
  bordered?: boolean
  singleLine?: boolean
  size?: 'small' | 'medium' | 'large'

  // 编辑相关
  editable?: boolean
  editMode?: EditMode
  onSave?: (
    rowData: T,
    rowIndex: number,
    columnKey?: string
  ) => void | Promise<void>
  onCancel?: (rowData: T, rowIndex: number) => void

  // 行操作
  showRowActions?: boolean
  rowActions?: RowAction<T>[]

  // 模态框相关
  modalTitle?: string
  modalWidth?: number

  // 列宽配置
  columnWidth?: number

  // 🔥 展开功能配置
  expandable?: boolean
  onLoadExpandData?: (row: T) => Promise<any[]> | any[]
  renderExpandContent?: (
    row: T,
    expandData: any[],
    loading: boolean,
    childSelection?: ChildSelectionState
  ) => VNodeChild
  rowExpandable?: (row: T) => boolean
  defaultExpandedKeys?: DataTableRowKey[]

  // 🔥 选择功能配置
  enableSelection?: boolean
  defaultCheckedKeys?: DataTableRowKey[]
  rowCheckable?: (row: T) => boolean
  maxSelection?: number

  // 🔥 子表格选择配置
  enableChildSelection?: boolean
  childRowCheckable?: (childRow: any, parentRow: T) => boolean

  // 🔥 父子联动配置
  enableParentChildLink?: boolean
  parentChildLinkMode?: ParentChildLinkMode
}

// 表格事件回调类型 - 使用统一的 DataRecord 约束
export interface TableEmits<T extends DataRecord = DataRecord> {
  'update:data': [data: T[]]
  save: [rowData: T, rowIndex: number, columnKey?: string]
  cancel: [rowData: T, rowIndex: number]

  // 🔥 展开事件
  'expand-change': [
    expandedKeys: DataTableRowKey[],
    row?: T,
    expanded?: boolean,
  ]

  // 🔥 选择事件
  'selection-change': [
    checkedKeys: DataTableRowKey[],
    checkedRows: T[],
    childSelections?: Map<DataTableRowKey, DataTableRowKey[]>,
  ]

  // 🔥 子选择事件
  'child-selection-change': [
    parentKey: DataTableRowKey,
    childKeys: DataTableRowKey[],
    childRows: any[],
  ]

  // 🔥 父子联动事件
  'parent-child-link-change': [
    parentKey: DataTableRowKey,
    shouldSelect: boolean,
  ]
}

// 表格实例方法 - 使用统一的 DataRecord 约束
export interface TableInstance<T extends DataRecord = DataRecord> {
  // 编辑功能
  startEdit: (rowKey: DataTableRowKey, columnKey?: string) => void
  cancelEdit: () => void
  saveEdit: () => Promise<void>
  isEditing: (rowKey: DataTableRowKey, columnKey?: string) => boolean
  getEditingData: () => any

  // 🔥 展开功能
  expandRow: (rowKey: DataTableRowKey) => Promise<void>
  collapseRow: (rowKey: DataTableRowKey) => void
  toggleExpand: (rowKey: DataTableRowKey) => Promise<void>
  expandAll: () => Promise<void>
  collapseAll: () => void
  isExpanded: (rowKey: DataTableRowKey) => boolean

  // 🔥 选择功能
  selectRow: (rowKey: DataTableRowKey) => void
  unselectRow: (rowKey: DataTableRowKey) => void
  selectAll: () => void
  clearSelection: () => void
  isRowSelected: (rowKey: DataTableRowKey) => boolean
  getSelectedRows: () => T[]

  // 🔥 子选择功能
  selectChildRow: (
    parentKey: DataTableRowKey,
    childKey: DataTableRowKey
  ) => void
  unselectChildRow: (
    parentKey: DataTableRowKey,
    childKey: DataTableRowKey
  ) => void
  selectAllChildren: (parentKey: DataTableRowKey) => void
  clearChildrenSelection: (parentKey: DataTableRowKey) => void
  getChildSelectedRows: (parentKey: DataTableRowKey) => any[]
  clearAllSelections: () => void
}

// ================= useTableExpand 类型 =================

// useTableExpand 配置选项 - 使用统一的 DataRecord 约束
export interface UseTableExpandOptions<
  T extends DataRecord = DataRecord,
  C = any,
> {
  // 基础数据
  data: Ref<T[]> | ComputedRef<T[]>
  rowKey: (row: T) => DataTableRowKey
  childRowKey?: (child: C) => DataTableRowKey

  // 展开配置
  defaultExpandedKeys?: DataTableRowKey[]
  onLoadData?: (row: T) => Promise<C[]> | C[]
  renderContent?: (
    row: T,
    expandData: C[],
    loading: boolean,
    childSelection?: ChildSelectionState
  ) => VNodeChild
  rowExpandable?: (row: T) => boolean

  // 选择配置
  enableSelection?: boolean
  defaultCheckedKeys?: DataTableRowKey[]
  rowCheckable?: (row: T) => boolean
  maxSelection?: number

  // 子选择配置
  enableChildSelection?: boolean
  childRowCheckable?: (child: C, parent: T) => boolean

  // 父子联动配置
  enableParentChildLink?: boolean
  parentChildLinkMode?: ParentChildLinkMode

  // 事件回调
  onExpandChange?: (
    expandedKeys: DataTableRowKey[],
    row?: T,
    expanded?: boolean
  ) => void
  onSelectionChange?: (
    checkedKeys: DataTableRowKey[],
    checkedRows: T[],
    childSelections?: Map<DataTableRowKey, DataTableRowKey[]>
  ) => void
  onChildSelectionChange?: (
    parentKey: DataTableRowKey,
    childKeys: DataTableRowKey[],
    childRows: C[]
  ) => void
}

// useTableExpand 返回类型 - 使用统一的 DataRecord 约束
export interface UseTableExpandReturn<
  T extends DataRecord = DataRecord,
  C = any,
> {
  // 基础状态
  expandedKeys: Ref<DataTableRowKey[]>
  checkedKeys: Ref<DataTableRowKey[]>
  childSelections: Ref<Map<DataTableRowKey, DataTableRowKey[]>>

  // 计算属性
  selectedRowsCount: ComputedRef<number>
  totalChildSelections: ComputedRef<number>

  // 展开方法
  expandAll: () => Promise<void>
  collapseAll: () => void
  expandRow: (key: DataTableRowKey) => Promise<void>
  handleExpandChange: (keys: DataTableRowKey[]) => void

  // 选择方法
  selectAll: () => void
  clearSelection: () => void
  clearAllSelections: () => void
  handleSelectionChange: (keys: DataTableRowKey[]) => void

  // 渲染方法
  getTableColumns: (originalColumns: TableColumn<T>[]) => any[]

  // 数据映射（供 C_Table 使用）
  expandDataMap: Ref<Map<DataTableRowKey, C[]>>
  loadingMap: Ref<Map<DataTableRowKey, boolean>>
}

// ================= 演示页面专用类型 =================

// 测试记录类型
export interface TestRecord extends DataRecord {
  id: number
  name: string
  department: string
  role: string
  status: string
  hasChildren: boolean
}

// 子数据类型
export interface ChildData extends DataRecord {
  id: number
  project?: string
  requirement?: string
  service?: string
  progress?: string
  status: string
  priority?: string
  version?: string
}

// 选中的子数据分组
export interface SelectedChildGroup {
  parentKey: number
  parentName: string
  children: ChildData[]
}

// 配置状态类型
export interface DemoConfig {
  enableSelection: boolean
  enableChildSelection: boolean
  parentChildLinkMode: ParentChildLinkMode
}

// ================= 工具类型 =================

// 提取对象值类型
export type ValueOf<T> = T[keyof T]

// 可选键类型
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

// 必需键类型
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

// 安全的键值对类型
export type SafeRecord<K extends string | number | symbol, V> = {
  [P in K]: V
}
