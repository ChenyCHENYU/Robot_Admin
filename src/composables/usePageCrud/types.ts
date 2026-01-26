/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: usePageCrud 类型定义
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Ref, ShallowRef } from 'vue'

// ==================== 基础类型 ====================

export type HttpMethod = 'get' | 'post' | 'put' | 'delete'
export type IdIn = 'path' | 'params' | 'body'
export type IdsIn = 'params' | 'body'
export type MutationAction = 'create' | 'update' | 'remove'

// ==================== 函数类型 ====================

export type ParamsSerializer = (
  params: Record<string, any>
) => Record<string, any> | string
export type IdSerializer = (
  ids: Array<string | number>
) => string | Array<string | number>
export type ErrorHandler = (
  error: HttpError,
  context: ErrorContext
) => void | Promise<void>

// ==================== 配置类型 ====================

export interface EndpointOpt {
  method?: HttpMethod
  idIn?: IdIn
  idParam?: string
  idsIn?: IdsIn
  idsParam?: string
  appendIdToPath?: boolean
  headers?: Record<string, string>
}

// ✨ 自定义业务操作配置
export interface ActionOpt {
  method?: HttpMethod
  autoRefresh?: boolean
  successMessage?: string
  errorMessage?: string
  headers?: Record<string, string>
}

export interface ApiEndpoints {
  list?: string
  get?: string
  create?: string
  update?: string
  remove?: string
  // ✨ 自定义业务操作
  actions?: Record<string, string>
  [key: string]: string | Record<string, string> | undefined
}

export interface BatchOperations {
  update?: boolean
  updateEndpoint?: string
  export?: boolean
  exportEndpoint?: string
}

export interface PageConfig {
  current?: number
  size?: number
}

// ==================== 结果类型 ====================

export interface ListResult<T> {
  items: T[]
  total: number
  page?: number
  pageSize?: number
}

export interface NormalizedResult<T = any> {
  data: T
  message?: string
  success?: boolean
  raw?: any
}

// ==================== 通知与错误 ====================

export interface Notifier {
  success?: (msg: string) => void
  error?: (msg: string) => void
  warning?: (msg: string) => void
  info?: (msg: string) => void
}

export interface HttpError extends Error {
  response?: {
    status: number
    data?: any
  }
  code?: string
  isNetwork?: boolean
  isUnauthorized?: boolean
}

export interface ErrorContext {
  action: string
  params?: any
}

// ==================== 自动刷新策略 ====================

export type AutoRefreshStrategy =
  | boolean
  | {
      onCreate?: boolean
      onUpdate?: boolean
      onRemove?: boolean
    }

// ==================== 主配置类型 ====================

export interface UsePageCrudOptions<Row = any, Query = any> {
  // 预设配置
  preset?: 'standard' | 'restful' | 'silent' | 'manual'

  // ID 配置
  idKey?: keyof Row | string

  // 默认值
  defaultQuery?: Partial<Query>
  defaultPage?: PageConfig

  // 数据处理
  mapListResult?: (res: any) => ListResult<Row>
  normalize?: <T = any>(res: any) => NormalizedResult<T>
  beforeFetch?: (params: Record<string, any>) => Record<string, any>

  // 序列化
  paramsSerializer?: ParamsSerializer
  idSerializer?: IdSerializer

  // 自动刷新
  autoRefresh?: AutoRefreshStrategy
  afterMutate?: (ctx: {
    action: MutationAction
    result: any
  }) => void | Promise<void>

  // 通知与错误
  notifier?: Notifier
  messages?: Partial<Messages>
  errorHandler?: ErrorHandler

  // 端点配置
  endpointOptions?: Record<string, EndpointOpt>

  // ✨ 自定义业务操作配置
  actionOptions?: Record<string, ActionOpt>

  // 行为控制
  resetPageOnFetchParams?: boolean
  resetPageOnReset?: boolean
  throwOnFetchError?: boolean
  filterParams?: boolean

  // 请求配置
  headers?: Record<string, string>
  batchOperations?: BatchOperations
}

// ==================== 返回类型 ====================

export interface UsePageCrudReturn<Row = any, Query = any> {
  // 方法
  fetch: (
    params?: Partial<Query>,
    opt?: { resetPage?: boolean }
  ) => Promise<void>
  refresh: () => Promise<void>
  reset: () => Promise<void>
  get: (id: string | number, params?: Record<string, any>) => Promise<any>
  create: (data: Partial<Row>, params?: Record<string, any>) => Promise<any>
  update: (data: Partial<Row>, params?: Record<string, any>) => Promise<any>
  /**
   * 删除数据（支持单个和批量）
   * @example
   * // 单个删除
   * await crud.remove(1)
   * await crud.remove('user-123')
   *
   * // 批量删除
   * await crud.remove({ ids: [1, 2, 3] })
   * await crud.remove({ ids: ['user-1', 'user-2'] })
   */
  remove: (
    input: string | number | { ids: Array<string | number> }
  ) => Promise<void>
  batchUpdate?: (data: Partial<Row>[]) => Promise<any>
  batchExport?: (params?: Record<string, any>) => Promise<void>

  // ✨ 自定义业务操作
  actions: Record<string, (data?: any) => Promise<any>>

  // ✨ 通用操作方法
  action: (method: HttpMethod, url: string, data?: any) => Promise<any>

  // 状态
  items: ShallowRef<Row[]>
  total: Ref<number>
  loading: Ref<boolean>
  loadingCount: Ref<number>
  query: Partial<Query>
  page: { current: number; size: number }
}

// ==================== 内部类型 ====================

export interface Messages {
  createSuccess: string
  updateSuccess: string
  removeSuccess: string
  batchDeleteSuccess: string
  fetchFail: string
  getFail: string
  createFail: string
  updateFail: string
  removeFail: string
  networkError: string
  unauthorized: string
  serverError: string
  notFound: string
}

export interface ResolvedConfig {
  idKey: string
  defaultQuery: Record<string, any>
  defaultPage: Required<PageConfig>
  mapListResult?: (res: any) => ListResult<any>
  normalize: <T = any>(res: any) => NormalizedResult<T>
  beforeFetch?: (params: Record<string, any>) => Record<string, any>
  paramsSerializer?: ParamsSerializer
  idSerializer: IdSerializer
  autoRefresh: AutoRefreshStrategy
  afterMutate?: (ctx: {
    action: MutationAction
    result: any
  }) => void | Promise<void>
  notifier?: Notifier
  messages: Messages
  errorHandler?: ErrorHandler
  endpointOptions: Record<string, EndpointOpt>
  actionOptions: Record<string, ActionOpt>
  resetPageOnFetchParams: boolean
  resetPageOnReset: boolean
  throwOnFetchError: boolean
  filterParams: boolean
  headers: Record<string, string>
  batchOperations: BatchOperations
}

export interface RequestConfig {
  url: string
  data: Record<string, any>
  headers: Record<string, string>
}
