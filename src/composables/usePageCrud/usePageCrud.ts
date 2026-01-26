/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: 通用页面 CRUD 组合式 API
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { shallowRef, ref, reactive, computed, type Ref } from 'vue'
import { getData, postData, putData, deleteData } from '@/axios/request'

import type {
  ApiEndpoints,
  UsePageCrudOptions,
  UsePageCrudReturn,
  ResolvedConfig,
  EndpointOpt,
  IdIn,
  MutationAction,
  HttpMethod,
} from './types'

import {
  ConfigMerger,
  ParamUtils,
  ResponseNormalizer,
  RequestBuilder,
  ErrorHandlerUtils,
  AutoRefresh,
  FileUtils,
} from './utils'

import { normalizeApi } from './apiParser'
import { createAutoNotifier } from './notifier'
import { getGlobalConfig, applyPreset } from './config'

// ==================== 主函数 ====================

/**
 * 通用页面 CRUD 组合式 API
 *
 * @description
 * 基于配置驱动的 CRUD 操作封装，提供完整的增删改查功能，无需手动定义 API 方法。
 * 内置状态管理、加载状态、错误处理、自动刷新等功能，大幅减少样板代码。
 *
 * @template Row - 数据行类型（列表项类型）
 * @template Query - 查询参数类型
 *
 * @param {ApiEndpoints} api - API 端点配置对象
 * @param {string} [api.list] - 列表查询接口路径
 * @param {string} [api.get] - 详情查询接口路径
 * @param {string} [api.create] - 新增数据接口路径
 * @param {string} [api.update] - 更新数据接口路径
 * @param {string} [api.remove] - 删除数据接口路径
 *
 * @param {UsePageCrudOptions<Row, Query>} [options={}] - 配置选项
 * @param {'standard' | 'restful' | 'silent' | 'manual'} [options.preset] - 预设配置
 * @param {string} [options.idKey='id'] - 数据 ID 字段名
 * @param {Partial<Query>} [options.defaultQuery={}] - 默认查询条件
 * @param {PageConfig} [options.defaultPage] - 默认分页配置 { current: 1, size: 10 }
 * @param {Function} [options.mapListResult] - 自定义列表结果映射函数
 * @param {Function} [options.normalize] - 自定义响应标准化函数
 * @param {Function} [options.beforeFetch] - 请求前参数处理钩子
 * @param {ParamsSerializer} [options.paramsSerializer] - 参数序列化器
 * @param {IdSerializer} [options.idSerializer] - ID 序列化器（默认逗号分隔）
 * @param {AutoRefreshStrategy} [options.autoRefresh=true] - 自动刷新策略
 * @param {Function} [options.afterMutate] - 操作后回调钩子
 * @param {Notifier} [options.notifier] - 消息通知器
 * @param {Partial<Messages>} [options.messages] - 自定义消息文本
 * @param {ErrorHandler} [options.errorHandler] - 自定义错误处理器
 * @param {Record<string, EndpointOpt>} [options.endpointOptions] - 端点详细配置
 * @param {boolean} [options.resetPageOnFetchParams=false] - 查询时是否重置页码
 * @param {boolean} [options.resetPageOnReset=true] - 重置时是否重置页码
 * @param {boolean} [options.throwOnFetchError=false] - 查询失败时是否抛出错误
 * @param {boolean} [options.filterParams=true] - 是否过滤空值参数
 * @param {Record<string, string>} [options.headers={}] - 全局请求头
 * @param {BatchOperations} [options.batchOperations] - 批量操作配置
 *
 * @returns {UsePageCrudReturn<Row, Query>} CRUD 操作实例
 * @returns {Function} return.fetch - 查询列表数据
 * @returns {Function} return.refresh - 刷新列表（使用当前参数）
 * @returns {Function} return.reset - 重置查询条件并刷新
 * @returns {Function} return.get - 获取单条数据详情
 * @returns {Function} return.create - 创建新数据
 * @returns {Function} return.update - 更新数据
 * @returns {Function} return.remove - 删除数据（单个或批量）
 * @returns {Function} [return.batchUpdate] - 批量更新（需配置）
 * @returns {Function} [return.batchExport] - 批量导出（需配置）
 * @returns {ShallowRef<Row[]>} return.items - 数据列表
 * @returns {Ref<number>} return.total - 数据总数
 * @returns {Ref<boolean>} return.loading - 加载状态
 * @returns {Ref<number>} return.loadingCount - 加载计数器
 * @returns {Partial<Query>} return.query - 查询条件（响应式）
 * @returns {Object} return.page - 分页信息（响应式）
 *
 * @example
 * // 基础用法（清晰明了，一目了然）
 * const crud = usePageCrud({
 *   list: '/api/user/list',
 *   get: '/api/user/detail',
 *   create: '/api/user/create',
 *   update: '/api/user/update',
 *   remove: '/api/user/delete',
 * })
 *
 * await crud.fetch()                        // 查询列表
 * await crud.get(1)                         // 获取详情
 * await crud.create({ name: '张三' })       // 新增
 * await crud.update({ id: 1, name: '李四' }) // 更新
 * await crud.remove(1)                      // 删除
 * await crud.remove({ ids: [1, 2, 3] })     // 批量删除
 *
 * @example
 * // 带类型和配置
 * interface User {
 *   id: number
 *   name: string
 *   email: string
 * }
 *
 * interface UserQuery {
 *   keyword?: string
 *   status?: string
 * }
 *
 * const crud = usePageCrud<User, UserQuery>({
 *   list: '/api/user/list',
 *   get: '/api/user/detail',
 *   create: '/api/user/create',
 *   update: '/api/user/update',
 *   remove: '/api/user/delete',
 * }, {
 *   preset: 'restful',
 *   defaultQuery: { status: 'active' },
 * })
 *
 * @see {@link https://github.com/your-repo/docs 完整文档}
 */
export function usePageCrud<Row = any, Query = any>(
  api: ApiEndpoints,
  options: UsePageCrudOptions<Row, Query> = {}
): UsePageCrudReturn<Row, Query> {
  // 1. 规范化 API 配置（移除路径参数占位符）
  const normalizedApi = normalizeApi(api)

  // 2. 合并全局配置
  const globalConfig = getGlobalConfig()

  // 3. 应用预设配置
  const { preset, ...restOptions } = options
  const presetConfig = preset ? applyPreset(preset, {}) : {}

  // 4. 自动注入消息通知器
  const autoNotifier = createAutoNotifier()

  // 5. 合并所有配置（优先级：用户配置 > 预设配置 > 全局配置 > 默认配置）
  const mergedOptions = {
    ...globalConfig,
    ...presetConfig,
    ...restOptions,
    // 自动注入 notifier（如果用户没有提供）
    notifier:
      restOptions.notifier ??
      presetConfig.notifier ??
      globalConfig.notifier ??
      autoNotifier,
  } as UsePageCrudOptions<Row, Query>

  // 6. 解析配置
  const config = ConfigMerger.merge(mergedOptions)
  const state = createState<Row, Query>(config)
  const helpers = createHelpers(config, state)
  const methods = createMethods(normalizedApi, config, state, helpers)

  return { ...methods, ...state.exposed }
}

// ==================== 状态创建 ====================

/**
 * 创建 CRUD 状态对象
 *
 * @private
 * @template Row - 数据行类型
 * @template Query - 查询参数类型
 * @param {ResolvedConfig} config - 解析后的配置对象
 * @returns {Object} 状态对象和暴露的响应式引用
 */
function createState<Row, Query>(config: ResolvedConfig) {
  const items = shallowRef<Row[]>([])
  const total = ref(0)
  const query = reactive<Partial<Query>>({ ...config.defaultQuery } as any)
  const page = reactive({ ...config.defaultPage })
  const loadingCount = ref(0)
  const loading = computed(() => loadingCount.value > 0)

  return {
    items,
    total,
    query,
    page,
    loadingCount,
    exposed: {
      items,
      total,
      loading: loading as unknown as Ref<boolean>,
      loadingCount,
      query: query as Partial<Query>,
      page,
    },
  }
}

// ==================== 辅助方法创建 ====================

/**
 * 创建辅助方法集合
 *
 * @private
 * @template Row - 数据行类型
 * @template Query - 查询参数类型
 * @param {ResolvedConfig} config - 解析后的配置对象
 * @param {Object} state - 状态对象
 * @returns {Object} 辅助方法集合
 */
function createHelpers<Row, Query>(
  config: ResolvedConfig,
  state: ReturnType<typeof createState<Row, Query>>
) {
  const { query, page, loadingCount, items, total } = state

  const getEndpointOpt = (name: string): EndpointOpt =>
    ConfigMerger.getEndpointOpt(name, config.endpointOptions)

  const buildParams = (extra: Record<string, any> = {}, opt?: EndpointOpt) => {
    const base = {
      ...(query as any),
      page: page.current,
      pageSize: page.size,
      ...extra,
    }
    const filtered = config.filterParams ? ParamUtils.filterEmpty(base) : base
    const processed = config.beforeFetch?.(filtered) ?? filtered
    const params = config.paramsSerializer?.(processed) ?? processed
    return { params, headers: { ...config.headers, ...opt?.headers } }
  }

  const handleListResponse = (rawRes: any) => {
    if (config.mapListResult) {
      const r = config.mapListResult(rawRes)
      items.value = r.items || []
      total.value = r.total || 0
      if (r.page != null) page.current = r.page
      if (r.pageSize != null) page.size = r.pageSize
      return
    }

    const normalized = config.normalize<any>(rawRes)
    const extracted = ResponseNormalizer.extractList(normalized.data ?? rawRes)

    items.value = extracted.list
    total.value = extracted.total
    if (extracted.page != null) page.current = extracted.page
    if (extracted.pageSize != null) page.size = extracted.pageSize
  }

  const handleError = (action: string, error: any) => {
    ErrorHandlerUtils.handle(error, action, {
      notifier: config.notifier,
      messages: config.messages,
      errorHandler: config.errorHandler,
    })
  }

  const afterMutate = async (
    action: MutationAction,
    result: any,
    refreshFn: () => Promise<void>
  ) => {
    await config.afterMutate?.({ action, result })
    if (AutoRefresh.shouldRefresh(config.autoRefresh, action)) {
      await refreshFn()
    }
  }

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    loadingCount.value++
    try {
      return await fn()
    } finally {
      loadingCount.value--
    }
  }

  const handleSuccess = <T>(res: any, successMsg?: string): T => {
    if (successMsg) config.notifier?.success?.(successMsg)
    return config.normalize<any>(res).data as T
  }

  const extractId = (data: any): string | number => {
    if (!data || typeof data !== 'object') {
      throw new Error('update(data) 需要传入对象')
    }
    const id = data[config.idKey]
    if (id == null || id === '') {
      throw new Error(`update(data) 缺少 idKey: ${config.idKey}`)
    }
    return id
  }

  return {
    getEndpointOpt,
    buildParams,
    handleListResponse,
    handleError,
    afterMutate,
    withLoading,
    handleSuccess,
    extractId,
  }
}

// ==================== CRUD 方法创建 ====================

/**
 * 创建 CRUD 操作方法集合
 *
 * @private
 * @template Row - 数据行类型
 * @template Query - 查询参数类型
 * @param {ApiEndpoints} api - API 端点配置
 * @param {ResolvedConfig} config - 解析后的配置对象
 * @param {Object} state - 状态对象
 * @param {Object} helpers - 辅助方法集合
 * @returns {Object} CRUD 方法集合
 */
function createMethods<Row, Query>(
  api: ApiEndpoints,
  config: ResolvedConfig,
  state: ReturnType<typeof createState<Row, Query>>,
  helpers: ReturnType<typeof createHelpers<Row, Query>>
) {
  const { page, query } = state
  const {
    getEndpointOpt,
    buildParams,
    handleListResponse,
    handleError,
    afterMutate,
    withLoading,
    handleSuccess,
    extractId,
  } = helpers

  // ---------- 列表操作 ----------

  const fetch = async (
    params?: Partial<Query>,
    opt?: { resetPage?: boolean }
  ): Promise<void> => {
    if (!api.list) return

    if (
      (opt?.resetPage ?? config.resetPageOnFetchParams) &&
      params &&
      Object.keys(params as any).length
    ) {
      page.current = 1
    }

    try {
      const { params: reqParams, headers } = buildParams(params as any)
      const res = await withLoading(() =>
        getData(api.list!, { params: reqParams, headers })
      )
      handleListResponse(res)
    } catch (e) {
      handleError('fetch', e)
      if (config.throwOnFetchError) throw e
    }
  }

  const refresh = () => fetch()

  const reset = async () => {
    Object.assign(query as any, config.defaultQuery)
    if (config.resetPageOnReset) Object.assign(page, config.defaultPage)
    await fetch()
  }

  // ---------- 单条操作 ----------

  const get = async (
    id: string | number,
    extraParams?: Record<string, any>
  ): Promise<any> => {
    if (!api.get) return null

    const opt = getEndpointOpt('get')
    const reqConfig = RequestBuilder.withId(api.get, id, opt, extraParams)
    const { params, headers } = buildParams(reqConfig.data, opt)

    try {
      const res = await withLoading(() =>
        getData(reqConfig.url, { params, headers })
      )
      return handleSuccess(res)
    } catch (e) {
      handleError('get', e)
      throw e
    }
  }

  const create = async (
    data: Partial<Row>,
    extraParams?: Record<string, any>
  ): Promise<any> => {
    if (!api.create) return null

    const opt = getEndpointOpt('create')
    const { params, headers } = buildParams({ ...data, ...extraParams }, opt)

    try {
      const res = await withLoading(() =>
        postData(api.create!, params, { headers })
      )
      const result = handleSuccess(res, config.messages.createSuccess)
      await afterMutate('create', res, refresh)
      return result
    } catch (e) {
      handleError('create', e)
      throw e
    }
  }

  const update = async (
    data: Partial<Row>,
    extraParams?: Record<string, any>
  ): Promise<any> => {
    if (!api.update) return null

    const opt = getEndpointOpt('update')
    const id = extractId(data)
    const reqConfig = RequestBuilder.withId(api.update, id, opt, {
      ...data,
      ...extraParams,
    })
    const { params, headers } = buildParams(reqConfig.data, opt)

    try {
      const res = await withLoading(() =>
        putData(reqConfig.url, params, { headers })
      )
      const result = handleSuccess(res, config.messages.updateSuccess)
      await afterMutate('update', res, refresh)
      return result
    } catch (e) {
      handleError('update', e)
      throw e
    }
  }

  // ---------- 删除操作 ----------

  const remove = async (
    input: string | number | { ids: Array<string | number> }
  ): Promise<void> => {
    if (!api.remove) return

    const opt = getEndpointOpt('remove')
    const isBatch = typeof input === 'object' && 'ids' in input

    try {
      await withLoading(async () => {
        if (isBatch) {
          await executeBatchRemove(
            api.remove!,
            (input as { ids: Array<string | number> }).ids,
            opt,
            config
          )
          config.notifier?.success?.(config.messages.batchDeleteSuccess)
        } else {
          await executeSingleRemove(api.remove!, input as string | number, opt)
          config.notifier?.success?.(config.messages.removeSuccess)
        }
      })
      await afterMutate('remove', null, refresh)
    } catch (e) {
      handleError('remove', e)
      throw e
    }
  }

  // ---------- 批量操作 ----------

  const batchUpdate = config.batchOperations.update
    ? async (data: Partial<Row>[]): Promise<any> => {
        const endpoint = config.batchOperations.updateEndpoint || api.update
        if (!endpoint) return null

        const opt = getEndpointOpt('update')
        const { params, headers } = buildParams({ items: data }, opt)

        try {
          const res = await withLoading(() =>
            postData(endpoint, params, { headers })
          )
          const result = handleSuccess(res, config.messages.updateSuccess)
          await afterMutate('update', res, refresh)
          return result
        } catch (e) {
          handleError('update', e)
          throw e
        }
      }
    : undefined

  const batchExport = config.batchOperations.export
    ? async (params?: Record<string, any>): Promise<void> => {
        const endpoint = config.batchOperations.exportEndpoint
        if (!endpoint) return

        const reqConfig = buildParams(params || {}, getEndpointOpt('list'))

        try {
          const res = await withLoading(() =>
            getData(endpoint, { ...reqConfig, responseType: 'blob' })
          )
          FileUtils.downloadBlob(res.data, FileUtils.generateFilename())
          config.notifier?.success?.('导出成功')
        } catch (e) {
          handleError('fetch', e)
          throw e
        }
      }
    : undefined

  // ---------- ✨ 自定义业务操作 ----------

  /**
   * 执行 HTTP 请求
   */
  const executeRequest = async (
    method: string,
    url: string,
    data: any,
    headers: Record<string, string>
  ) => {
    switch (method.toLowerCase()) {
      case 'get':
        return getData(url, { params: data, headers })
      case 'post':
        return postData(url, data, { headers })
      case 'put':
        return putData(url, data, { headers })
      case 'delete':
        return deleteData(url, { params: data, headers })
      default:
        return postData(url, data, { headers })
    }
  }

  /**
   * 处理操作结果并刷新
   */
  const handleActionResult = async (
    actionOpt: any,
    res: any,
    actionName: string
  ) => {
    const result = handleSuccess(
      res,
      actionOpt.successMessage || `${actionName} 成功`
    )

    if (actionOpt.autoRefresh ?? false) {
      await refresh()
    }

    return result
  }

  /**
   * 创建自定义业务操作方法
   */
  const createActionMethod = (actionName: string, actionUrl: string) => {
    return async (data?: any): Promise<any> => {
      const actionOpt = config.actionOptions?.[actionName] || {}
      const method = actionOpt.method || 'post'
      const headers = { ...config.headers, ...actionOpt.headers }

      try {
        const res = await withLoading(() =>
          executeRequest(method, actionUrl, data, headers)
        )

        return await handleActionResult(actionOpt, res, actionName)
      } catch (e) {
        handleError(actionName, e)
        if (actionOpt.errorMessage) {
          config.notifier?.error?.(actionOpt.errorMessage)
        }
        throw e
      }
    }
  }

  // 构建 actions 对象
  const actions: Record<string, (data?: any) => Promise<any>> = {}
  if (api.actions && typeof api.actions === 'object') {
    for (const [actionName, actionUrl] of Object.entries(api.actions)) {
      if (typeof actionUrl === 'string') {
        actions[actionName] = createActionMethod(actionName, actionUrl)
      }
    }
  }

  /**
   * 通用操作方法（用于临时性操作，不需要预定义）
   */
  const action = async (
    method: HttpMethod,
    url: string,
    data?: any
  ): Promise<any> => {
    const { headers } = config

    try {
      const res = await withLoading(() =>
        executeRequest(method, url, data, headers)
      )

      return handleSuccess(res)
    } catch (e) {
      handleError('action', e)
      throw e
    }
  }

  return {
    fetch,
    refresh,
    reset,
    get,
    create,
    update,
    remove,
    batchUpdate,
    batchExport,
    actions,
    action,
  }
}

// ==================== 删除执行器 ====================

/**
 * 执行批量删除操作
 *
 * @private
 * @param {string} url - 删除接口 URL
 * @param {Array<string | number>} ids - 要删除的 ID 数组
 * @param {EndpointOpt} opt - 端点配置选项
 * @param {ResolvedConfig} config - 解析后的配置对象
 * @returns {Promise<void>}
 */
async function executeBatchRemove(
  url: string,
  ids: Array<string | number>,
  opt: EndpointOpt,
  config: ResolvedConfig
): Promise<void> {
  if (!ids.length) return

  const {
    url: reqUrl,
    data,
    useBody,
  } = RequestBuilder.forBatchDelete(url, ids, opt, config.idSerializer)
  const headers = { ...config.headers, ...opt.headers }
  const reqConfig = useBody ? { data, headers } : { params: data, headers }

  await deleteData(reqUrl, reqConfig)
}

const DELETE_STRATEGIES: Record<
  IdIn,
  (url: string, data: any, headers: any) => Promise<any>
> = {
  body: (url, data, headers) => deleteData(url, { data, headers }),
  params: (url, data, headers) => deleteData(url, { params: data, headers }),
  path: (url, _, headers) => deleteData(url, { headers }),
}

/**
 * 执行单条删除操作
 *
 * @private
 * @param {string} url - 删除接口 URL
 * @param {string | number} id - 要删除的数据 ID
 * @param {EndpointOpt} opt - 端点配置选项
 * @returns {Promise<void>}
 */
async function executeSingleRemove(
  url: string,
  id: string | number,
  opt: EndpointOpt
): Promise<void> {
  const reqConfig = RequestBuilder.withId(url, id, opt)
  const strategy = DELETE_STRATEGIES[opt.idIn || 'path']
  await strategy(reqConfig.url, reqConfig.data, reqConfig.headers)
}
