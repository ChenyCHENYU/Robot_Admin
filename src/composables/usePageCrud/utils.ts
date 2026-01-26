/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: usePageCrud 工具函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type {
  AutoRefreshStrategy,
  MutationAction,
  IdIn,
  EndpointOpt,
  NormalizedResult,
  RequestConfig,
  ResolvedConfig,
  UsePageCrudOptions,
  Notifier,
  ErrorHandler,
  IdSerializer,
  ParamsSerializer,
  Messages,
} from './types'

import {
  DEFAULT_MESSAGES,
  DEFAULT_ENDPOINT_OPTIONS,
  LIST_FIELD_ALIASES,
  TOTAL_FIELD_ALIASES,
  DATA_FIELD_ALIASES,
  SUCCESS_CODES,
  ERROR_RULES,
  DEFAULT_ID_KEY,
  DEFAULT_PAGE,
  DEFAULT_FLAGS,
  ACTION_REFRESH_KEY_MAP,
  type ErrorType,
} from './constants'

// ==================== 字段查找器 ====================

export const FieldFinder = {
  /** 查找第一个存在的字段值 */
  findFirst<T>(
    obj: Record<string, any> | null | undefined,
    aliases: readonly string[],
    defaultValue: T
  ): T {
    if (!obj || typeof obj !== 'object') return defaultValue

    for (const key of aliases) {
      if (key in obj && obj[key] !== undefined) {
        return obj[key] as T
      }
    }
    return defaultValue
  },

  /** 查找第一个存在的数字字段 */
  findNumber(
    obj: Record<string, any> | null | undefined,
    aliases: readonly string[],
    defaultValue = 0
  ): number {
    const value = this.findFirst(obj, aliases, defaultValue)
    return Number(value) || defaultValue
  },
}

// ==================== 参数工具 ====================

export const ParamUtils = {
  /** 判断值是否为空 */
  isEmpty(value: any): boolean {
    if (value === null || value === undefined || value === '') return true
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  },

  /** 过滤空值参数 */
  filterEmpty(params: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => !this.isEmpty(v))
    )
  },
}

// ==================== 序列化器 ====================

export const Serializers = {
  /** 默认 ID 序列化 - 逗号分隔 */
  commaIds: (ids => ids.map(String).join(',')) as IdSerializer,

  /** 数组形式 ID 序列化 */
  arrayIds: (ids => ids) as IdSerializer,

  /** 管道分隔 ID 序列化 */
  pipeIds: (ids => ids.map(String).join('|')) as IdSerializer,

  /** URLSearchParams 序列化 */
  urlParams: (params => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    return searchParams.toString()
  }) as ParamsSerializer,

  /** JSON 序列化 */
  json: (params => JSON.stringify(params)) as ParamsSerializer,
}

// ==================== 错误检测器 ====================

export const ErrorDetector = {
  /** 获取错误类型 */
  getType(error: any): ErrorType | null {
    return ERROR_RULES.find(rule => rule.test(error))?.type ?? null
  },

  /** 标记错误属性 */
  mark(error: any): void {
    for (const rule of ERROR_RULES) {
      if (rule.mark && rule.test(error)) {
        error[rule.mark] = true
      }
    }
  },

  /** 判断是否为网络错误 */
  isNetwork: (e: any) => ERROR_RULES[0].test(e),

  /** 判断是否为未授权错误 */
  isUnauthorized: (e: any) => ERROR_RULES[1].test(e),

  /** 判断是否为资源不存在错误 */
  isNotFound: (e: any) => ERROR_RULES[2].test(e),

  /** 判断是否为服务器错误 */
  isServer: (e: any) => ERROR_RULES[3].test(e),
}

// ==================== 错误处理器 ====================

export const ErrorHandlerUtils = {
  /** 获取错误消息 */
  getMessage(action: string, error: any, messages: Messages): string {
    const errorType = ErrorDetector.getType(error)
    const msgKey = errorType || (`${action}Fail` as keyof Messages)
    return messages[msgKey] || messages.fetchFail
  },

  /** 处理错误 */
  handle(
    error: any,
    action: string,
    options: {
      notifier?: Notifier
      messages: Messages
      errorHandler?: ErrorHandler
    }
  ): void {
    const { notifier, messages, errorHandler } = options

    ErrorDetector.mark(error)

    if (errorHandler) {
      errorHandler(error, { action })
      return
    }

    if (error?.message === '重新登录已取消') return

    const errorMsg = this.getMessage(action, error, messages)
    notifier?.error?.(errorMsg)
  },
}

// ==================== 响应解包器 ====================

export const ResponseNormalizer = {
  /** 判断响应是否成功 */
  isSuccess(res: any): boolean {
    if (typeof res.success === 'boolean') return res.success
    // 支持数字和字符串类型的 code
    return (
      SUCCESS_CODES.includes(res.code) ||
      SUCCESS_CODES.includes(String(res.code))
    )
  },

  /** 标准化响应 */
  normalize<T = any>(res: any): NormalizedResult<T> {
    if (!res || typeof res !== 'object' || !('data' in res)) {
      return { data: res as T, success: true, raw: res }
    }

    return {
      data: FieldFinder.findFirst(res, DATA_FIELD_ALIASES, res),
      message: res.message,
      success: this.isSuccess(res),
      raw: res,
    }
  },

  /** 提取列表数据 */
  extractList(data: any): {
    list: any[]
    total: number
    page?: number
    pageSize?: number
  } {
    const list = FieldFinder.findFirst<any[]>(data, LIST_FIELD_ALIASES, [])

    return {
      list: Array.isArray(list) ? list : [],
      total: FieldFinder.findNumber(data, TOTAL_FIELD_ALIASES, 0),
      page: data?.page,
      pageSize: data?.pageSize,
    }
  },
}

// ==================== 自动刷新策略（优化后）====================

/** 自动刷新策略处理器 */
type RefreshResolver = (
  strategy: AutoRefreshStrategy,
  action: MutationAction
) => boolean

/** 布尔策略：直接返回布尔值 */
const booleanResolver: RefreshResolver = strategy => strategy as boolean

/** 对象策略：从映射中查找 */
const objectResolver: RefreshResolver = (strategy, action) => {
  const key = ACTION_REFRESH_KEY_MAP[action]
  return (strategy as Record<string, boolean | undefined>)[key] ?? false
}

/** 策略解析器映射 */
const refreshResolvers: Record<'boolean' | 'object', RefreshResolver> = {
  boolean: booleanResolver,
  object: objectResolver,
}

export const AutoRefresh = {
  /** 解析是否需要刷新 */
  shouldRefresh(
    strategy: AutoRefreshStrategy,
    action: MutationAction
  ): boolean {
    const resolverType = typeof strategy === 'boolean' ? 'boolean' : 'object'
    return refreshResolvers[resolverType](strategy, action)
  },

  /** 创建策略 */
  create: (options: {
    onCreate?: boolean
    onUpdate?: boolean
    onRemove?: boolean
  }): AutoRefreshStrategy => options,

  /** 全部启用 */
  enableAll: (): AutoRefreshStrategy => true,

  /** 全部禁用 */
  disableAll: (): AutoRefreshStrategy => false,
}

// ==================== 请求构建器 ====================

export const RequestBuilder = {
  /** ID 位置策略 */
  idStrategies: {
    path: (
      baseUrl: string,
      id: string | number,
      opt: EndpointOpt
    ): RequestConfig => ({
      url: opt.appendIdToPath !== false ? `${baseUrl}/${id}` : baseUrl,
      data: {},
      headers: opt.headers || {},
    }),

    params: (
      baseUrl: string,
      id: string | number,
      opt: EndpointOpt
    ): RequestConfig => ({
      url: baseUrl,
      data: { [opt.idParam || 'id']: id },
      headers: opt.headers || {},
    }),

    body: (
      baseUrl: string,
      id: string | number,
      opt: EndpointOpt
    ): RequestConfig => ({
      url: baseUrl,
      data: { [opt.idParam || 'id']: id },
      headers: opt.headers || {},
    }),
  } as Record<
    IdIn,
    (url: string, id: string | number, opt: EndpointOpt) => RequestConfig
  >,

  /** 构建带 ID 的请求配置 */
  withId(
    baseUrl: string,
    id: string | number,
    opt: EndpointOpt,
    extraData: Record<string, any> = {}
  ): RequestConfig {
    const strategy = this.idStrategies[opt.idIn || 'params']
    const config = strategy(baseUrl, id, opt)

    return {
      ...config,
      data: { ...config.data, ...extraData },
    }
  },

  /** 构建批量删除请求配置 */
  forBatchDelete(
    baseUrl: string,
    ids: Array<string | number>,
    opt: EndpointOpt,
    serializer: IdSerializer
  ): { url: string; data: Record<string, any>; useBody: boolean } {
    return {
      url: baseUrl,
      data: { [opt.idsParam || 'ids']: serializer(ids) },
      useBody: opt.idsIn !== 'params',
    }
  },
}

// ==================== 配置合并器（优化后）====================

/** 默认配置对象 - 用于对象展开合并 */
const CONFIG_DEFAULTS: Omit<ResolvedConfig, 'normalize' | 'idSerializer'> & {
  normalize: null
  idSerializer: null
} = {
  idKey: DEFAULT_ID_KEY,
  defaultQuery: {},
  defaultPage: { ...DEFAULT_PAGE },
  mapListResult: undefined,
  normalize: null, // 需要特殊处理，避免循环引用
  beforeFetch: undefined,
  paramsSerializer: undefined,
  idSerializer: null, // 需要特殊处理
  autoRefresh: DEFAULT_FLAGS.autoRefresh,
  afterMutate: undefined,
  notifier: undefined,
  messages: DEFAULT_MESSAGES,
  errorHandler: undefined,
  endpointOptions: {},
  resetPageOnFetchParams: DEFAULT_FLAGS.resetPageOnFetchParams,
  resetPageOnReset: DEFAULT_FLAGS.resetPageOnReset,
  throwOnFetchError: DEFAULT_FLAGS.throwOnFetchError,
  filterParams: DEFAULT_FLAGS.filterParams,
  headers: {},
  batchOperations: {},
  actionOptions: {},
}

/** 合并分页配置 */
const mergePage = (custom?: { current?: number; size?: number }) => ({
  current: custom?.current ?? DEFAULT_PAGE.current,
  size: custom?.size ?? DEFAULT_PAGE.size,
})

/** 合并消息配置 */
const mergeMessages = (custom?: Partial<Messages>): Messages => ({
  ...DEFAULT_MESSAGES,
  ...custom,
})

/** 选择有效值（非 null/undefined）*/
const pick = <T>(value: T | null | undefined, fallback: T): T =>
  value ?? fallback

export const ConfigMerger = {
  /** 合并配置 - 使用对象展开减少条件分支 */
  merge<Row, Query>(options: UsePageCrudOptions<Row, Query>): ResolvedConfig {
    // 第一层：基础类型直接展开
    const base = {
      ...CONFIG_DEFAULTS,
      ...options,
    }

    // 第二层：需要特殊处理的字段
    return {
      idKey: String(base.idKey),
      defaultQuery: (base.defaultQuery ?? {}) as Record<string, any>,
      defaultPage: mergePage(options.defaultPage),
      mapListResult: base.mapListResult,
      normalize: pick(options.normalize, ResponseNormalizer.normalize),
      beforeFetch: base.beforeFetch,
      paramsSerializer: base.paramsSerializer,
      idSerializer: pick(options.idSerializer, Serializers.commaIds),
      autoRefresh: base.autoRefresh,
      afterMutate: base.afterMutate,
      notifier: base.notifier,
      messages: mergeMessages(options.messages),
      errorHandler: base.errorHandler,
      endpointOptions: base.endpointOptions ?? {},
      actionOptions: base.actionOptions ?? {},
      resetPageOnFetchParams: base.resetPageOnFetchParams,
      resetPageOnReset: base.resetPageOnReset,
      throwOnFetchError: base.throwOnFetchError,
      filterParams: base.filterParams,
      headers: base.headers ?? {},
      batchOperations: base.batchOperations ?? {},
    }
  },

  /** 获取端点配置 */
  getEndpointOpt(
    name: string,
    customOptions: Record<string, EndpointOpt>
  ): EndpointOpt {
    return {
      ...DEFAULT_ENDPOINT_OPTIONS[name],
      ...customOptions[name],
    }
  },
}

// ==================== 文件下载工具 ====================

export const FileUtils = {
  /** 下载 Blob */
  downloadBlob(data: any, filename: string): void {
    const blob = new Blob([data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  /** 生成导出文件名 */
  generateFilename(prefix = 'export', extension = 'xlsx'): string {
    return `${prefix}_${Date.now()}.${extension}`
  },
}
