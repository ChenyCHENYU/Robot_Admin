/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-06
 * @Description: useTableCrud 类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref, ComputedRef } from 'vue'
import type { TableColumn } from '@/types/modules/table'

// ==================== 基础类型 ====================

/**
 * 数据记录基础类型
 */
export interface DataRecord {
  [key: string]: any
}

/**
 * API 端点配置
 */
export interface ApiEndpoints {
  /** 列表查询接口 */
  list: string
  /** 详情查询接口 */
  get?: string
  /** 新增接口 */
  create?: string
  /** 更新接口 */
  update?: string
  /** 删除接口 */
  remove?: string
  /** 批量删除接口 */
  batchRemove?: string
}

// ==================== 自定义操作 ====================

/**
 * 操作上下文（传递给自定义操作处理函数）
 */
export interface ActionContext<T> {
  /** 表格数据数组 */
  data: T[]
  /** 当前行索引 */
  index: number
  /** 分页信息 */
  page: { current: number; size: number }
  /** 分页是否启用 */
  paginationEnabled: boolean
  /** 消息通知实例 */
  message: any
  /** 对话框实例 */
  dialog: any
  /** 刷新数据 */
  refresh: () => Promise<void>
}

/**
 * 自定义操作按钮配置
 */
export interface CustomAction<T> {
  /** 操作唯一标识 */
  key: string
  /** 按钮文本 */
  label: string
  /** 图标名称 */
  icon: string
  /** 按钮类型 */
  type?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  /** 操作处理函数 */
  handler: (row: T, context: ActionContext<T>) => void | Promise<void>
}

// ==================== 详情配置 ====================

/**
 * 详情项配置
 */
export interface DetailItem {
  /** 字段标签 */
  label: string
  /** 数据字段名 */
  key: string
  /** 显示类型 */
  type?: string
  /** 占据列数 */
  span?: number
  /** 值格式化函数 */
  formatter?: (val: any) => string
  /** 标签类型 */
  tagType?: string
  [key: string]: any
}

/**
 * 详情分组配置
 */
export interface DetailSection {
  /** 分组标题 */
  title: string
  /** 列数 */
  columns: number
  /** 字段列表 */
  items: DetailItem[]
}

/**
 * 详情配置
 */
export interface DetailConfig {
  /** 详情分组 */
  sections: DetailSection[]
}

// ==================== 主配置 ====================

/**
 * useTableCrud 配置选项
 */
export interface UseTableCrudConfig<T extends DataRecord> {
  /** API 端点配置 */
  api: ApiEndpoints

  /** 表格列配置 */
  columns: TableColumn<T>[]

  /** 自定义操作按钮 */
  customActions?: CustomAction<T>[]

  /** 详情弹窗配置 */
  detail?: DetailConfig

  /** ID 字段名，默认 'id' */
  idKey?: keyof T

  /** 默认分页大小，默认 10 */
  defaultPageSize?: number

  /** 是否默认启用分页，默认 true */
  defaultPaginationEnabled?: boolean

  /** 创建新行的工厂函数 */
  createNewRow?: () => T

  /** 列表数据提取函数（处理不同响应格式） */
  extractListData?: (response: any) => { items: T[]; total: number }

  /** 是否自动加载数据，默认 true */
  autoLoad?: boolean
}

// ==================== 返回类型 ====================

/**
 * 详情弹窗状态
 */
export interface DetailModal<T> {
  /** 弹窗可见性 */
  visible: Ref<boolean>
  /** 详情数据 */
  data: Ref<T | null>
  /** 弹窗标题 */
  title: Ref<string>
  /** 显示详情 */
  show: (row: T) => void
  /** 关闭详情 */
  close: () => void
}

/**
 * useTableCrud 返回类型
 */
export interface UseTableCrudReturn<T extends DataRecord> {
  // ========== 数据状态 ==========
  /** 表格数据 */
  data: Ref<T[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 数据总数 */
  total: Ref<number>

  // ========== 表格配置 ==========
  /** 表格列配置 */
  columns: ComputedRef<TableColumn<T>[]>
  /** 操作按钮配置 */
  actions: ComputedRef<any>
  /** 表格引用 */
  tableRef: Ref<any>

  // ========== 分页 ==========
  /** 分页状态 */
  page: { current: number; size: number }
  /** 分页启用状态 */
  paginationEnabled: Ref<boolean>
  /** 分页配置（供组件使用） */
  pagination: ComputedRef<
    false | { enabled: boolean; page: number; pageSize: number }
  >

  // ========== 核心方法 ==========
  /** 刷新数据 */
  refresh: () => Promise<void>
  /** 新增数据 */
  create: (row: T) => Promise<void>
  /** 更新数据 */
  save: (row: T) => Promise<void>
  /** 删除数据 */
  remove: (row: T) => Promise<void>
  /** 批量删除数据 */
  batchRemove: (rows: T[]) => Promise<void>
  /** 获取详情 */
  getDetail: (row: T) => Promise<T | null>

  // ========== 事件处理 ==========
  /** 处理取消编辑 */
  handleCancel: () => Promise<void>
  /** 处理分页变化 */
  handlePaginationChange: (pageNum: number, pageSize: number) => void
  /** 处理行删除（UI层） */
  handleRowDelete: (row: T, index: number) => void

  // ========== 详情弹窗 ==========
  /** 详情弹窗状态 */
  detail: DetailModal<T>
  /** 详情配置 */
  detailConfig?: DetailConfig
}
