/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: usePageCrud 常量配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Messages, EndpointOpt } from './types'

// ==================== 消息配置 ====================

export const DEFAULT_MESSAGES: Messages = {
  createSuccess: '新增成功',
  updateSuccess: '更新成功',
  removeSuccess: '删除成功',
  batchDeleteSuccess: '批量删除成功',
  fetchFail: '查询失败，请重试',
  getFail: '获取详情失败，请重试',
  createFail: '新增失败，请重试',
  updateFail: '更新失败，请重试',
  removeFail: '删除失败，请重试',
  networkError: '网络错误，请检查网络连接',
  unauthorized: '未授权，请重新登录',
  serverError: '服务器错误，请稍后重试',
  notFound: '请求的资源不存在',
}

// ==================== 端点默认配置 ====================

export const DEFAULT_ENDPOINT_OPTIONS: Record<string, EndpointOpt> = {
  list: { method: 'get' },
  get: { method: 'get', idIn: 'params', idParam: 'id' },
  create: { method: 'post' },
  update: { method: 'put', idIn: 'body', idParam: 'id' },
  remove: {
    method: 'delete',
    idsIn: 'body',
    idsParam: 'ids',
    idIn: 'path',
    appendIdToPath: true,
  },
}

// ==================== 字段别名映射 ====================

/**
 * 数据字段别名（按优先级排序）
 * 用于从后端响应中提取数据对象
 *
 * 处理流程：
 * 1. normalize() 使用 DATA_FIELD_ALIASES 从响应中提取数据层
 *    例如：{ code: 0, data: {...} } → 提取 data
 * 2. extractList() 使用 LIST_FIELD_ALIASES 从数据层提取列表
 *    例如：{ list: [...], total: 10 } → 提取 list
 *
 * 支持的响应结构：
 * - 嵌套：{ data: { list: [...], total: 10 } }  ✅ 常用
 * - 扁平：{ list: [...], total: 10 }            ✅ 支持
 */
export const DATA_FIELD_ALIASES = ['data', 'list', 'items', 'records'] as const

/** 列表字段可能的名称（按优先级排序） */
export const LIST_FIELD_ALIASES = [
  'list',
  'items',
  'records',
  'rows',
  'data',
] as const

/** 总数字段可能的名称（按优先级排序） */
export const TOTAL_FIELD_ALIASES = [
  'total',
  'totalCount',
  'count',
  'totalElements',
] as const

/** 成功状态码（支持数字和字符串） */
export const SUCCESS_CODES = [200, 0, '200', '0'] as const

// ==================== 默认选项值 ====================

export const DEFAULT_ID_KEY = 'id'

export const DEFAULT_PAGE = {
  current: 1,
  size: 10,
} as const

export const DEFAULT_FLAGS = {
  autoRefresh: true,
  resetPageOnFetchParams: false,
  resetPageOnReset: true,
  throwOnFetchError: false,
  filterParams: true,
} as const

// ==================== 错误检测规则 ====================

export type ErrorType =
  | 'networkError'
  | 'unauthorized'
  | 'notFound'
  | 'serverError'

export interface ErrorRule {
  type: ErrorType
  test: (error: any) => boolean
  mark?: string
}

/** 取消请求的消息列表 */
const CANCELED_MESSAGES = ['canceled', 'Request aborted', 'Request cancelled']

/** 取消请求的错误码列表 */
const CANCELED_CODES = ['ECONNABORTED', 'ERR_CANCELED']

export const ERROR_RULES: ErrorRule[] = [
  {
    type: 'networkError',
    test: (e: any): boolean =>
      !e.response &&
      Boolean(e.code) &&
      !CANCELED_CODES.includes(e.code) &&
      !CANCELED_MESSAGES.includes(e.message),
    mark: 'isNetwork',
  },
  {
    type: 'unauthorized',
    test: (e: any): boolean => [401, 403].includes(e.response?.status),
    mark: 'isUnauthorized',
  },
  {
    type: 'notFound',
    test: (e: any): boolean => e.response?.status === 404,
  },
  {
    type: 'serverError',
    test: (e: any): boolean => {
      const status = e.response?.status
      return typeof status === 'number' && status >= 500 && status < 600
    },
  },
]

// ==================== 操作类型映射 ====================

export const ACTION_REFRESH_KEY_MAP = {
  create: 'onCreate',
  update: 'onUpdate',
  remove: 'onRemove',
} as const

export const ACTION_FAIL_MESSAGE_KEY_MAP = {
  fetch: 'fetchFail',
  get: 'getFail',
  create: 'createFail',
  update: 'updateFail',
  remove: 'removeFail',
} as const
