/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-16 16:02:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-17 00:03:28
 * @FilePath: \Robot_Admin\src\axios\plugins\cache.ts
 * @Description: 请求缓存插件（内存缓存）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import type {
  EnhancedAxiosRequestConfig,
  CacheConfig,
  CachedResponseData,
} from '../types'
import {
  generateRequestKey,
  globalCache,
  normalizeConfig,
} from '../utils/helpers'

/**
 * 默认缓存配置
 * - enabled: 是否启用缓存，默认关闭
 * - ttl: 缓存生存时间，默认5分钟
 * - forceUpdate: 是否强制更新缓存，默认false
 */
const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  enabled: false,
  ttl: 5 * 60 * 1000, // 5 分钟
  forceUpdate: false,
}

/**
 * 判断是否应该使用缓存
 *
 * @param config 请求配置
 * @param cacheConfig 缓存配置
 * @returns 是否使用缓存
 *
 * 缓存策略：
 * 1. 只缓存 GET 请求
 * 2. 必须显式启用缓存
 * 3. 非强制刷新模式
 */
function shouldUseCache(
  config: InternalAxiosRequestConfig,
  cacheConfig: CacheConfig
): boolean {
  // 只缓存 GET 请求
  if (config.method?.toUpperCase() !== 'GET') {
    return false
  }

  // 检查是否启用缓存
  if (!cacheConfig.enabled) {
    return false
  }

  // 检查是否强制刷新
  if (cacheConfig.forceUpdate) {
    return false
  }

  return true
}

/**
 * 创建缓存响应对象
 *
 * @param cachedData 缓存的数据
 * @param config 请求配置
 * @returns 格式化的 Axios 响应对象
 *
 * 注意：在 statusText 中添加 "(from cache)" 标识，便于调试
 */
function createCacheResponse(
  cachedData: CachedResponseData,
  config: InternalAxiosRequestConfig
): AxiosResponse {
  return {
    data: cachedData.data,
    status: cachedData.status,
    statusText: `${cachedData.statusText} (from cache)`,
    headers: cachedData.headers,
    config,
  } as AxiosResponse
}

/**
 * 尝试从缓存获取响应
 *
 * @param config 请求配置
 * @param cacheConfig 缓存配置
 * @returns 缓存的响应或 null
 *
 * 流程：
 * 1. 检查是否应该使用缓存
 * 2. 生成请求键
 * 3. 从全局缓存中获取数据
 * 4. 如果命中，创建并返回缓存响应
 */
function tryGetFromCache(
  config: InternalAxiosRequestConfig,
  cacheConfig: Required<CacheConfig>
): AxiosResponse | null {
  if (!shouldUseCache(config, cacheConfig)) {
    return null
  }

  const requestKey = generateRequestKey(config)
  const cachedData = globalCache.get<CachedResponseData>(requestKey)

  if (cachedData) {
    return createCacheResponse(cachedData, config)
  }

  return null
}

/**
 * 保存响应到缓存
 *
 * @param response Axios 响应对象
 * @param config 请求配置
 * @param cacheConfig 缓存配置
 *
 * 缓存条件：
 * 1. 必须是 GET 请求
 * 2. 缓存功能已启用
 * 3. 响应状态码为 200
 *
 * 保存内容：
 * - 响应数据
 * - 状态码和状态文本
 * - 完整的响应头
 */
function saveToCache(
  response: AxiosResponse,
  config: InternalAxiosRequestConfig,
  cacheConfig: Required<CacheConfig>
): void {
  if (
    config.method?.toUpperCase() === 'GET' &&
    cacheConfig.enabled &&
    response.status === 200
  ) {
    const requestKey = generateRequestKey(config)
    const ttl = cacheConfig.ttl ?? DEFAULT_CACHE_CONFIG.ttl

    // 保存完整的响应信息，包括 headers
    const cachedResponse: CachedResponseData = {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: { ...response.headers },
    }

    globalCache.set(requestKey, cachedResponse, ttl)
  }
}

/**
 * 请求拦截器：检查缓存
 *
 * @param config 请求配置
 * @returns 请求配置或 rejected Promise
 *
 * 核心机制：
 * 1. 检查缓存是否命中
 * 2. 如果命中，返回 rejected Promise 携带缓存响应
 * 3. 标记 __fromCache 让其他插件知道这是缓存响应
 *
 * 为什么用 rejected Promise：
 * - 避免发送真实网络请求
 * - 在响应拦截器中通过 onResponseError 处理
 * - 确保其他插件的请求拦截器正常执行
 */
function onRequest(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig | Promise<never> {
  const enhancedConfig = config as EnhancedAxiosRequestConfig
  const cacheConfig = normalizeConfig(
    enhancedConfig.cache,
    DEFAULT_CACHE_CONFIG
  ) as Required<CacheConfig>

  // 尝试从缓存获取
  const cachedResponse = tryGetFromCache(config, cacheConfig)
  if (cachedResponse) {
    // 标记来自缓存，让其他插件知道
    ;(config as any).__fromCache = true

    // ✅ 直接返回一个 rejected Promise，携带缓存响应
    // 这样可以避免发送真实网络请求，同时在响应拦截器中处理
    return Promise.reject({
      __fromCache: true,
      __cachedResponse: cachedResponse,
      config,
    })
  }

  return config
}

/**
 * 响应拦截器：处理缓存或保存缓存
 *
 * @param response Axios 响应对象
 * @returns 处理后的响应
 *
 * 处理逻辑：
 * 1. 如果是缓存响应，直接返回缓存数据
 * 2. 如果是真实响应，保存到缓存
 */
function onResponse(response: AxiosResponse): AxiosResponse {
  const config = response.config as EnhancedAxiosRequestConfig

  // 如果来自缓存，直接返回缓存数据
  if ((config as any).__fromCache) {
    return (config as any).__cachedResponse
  }

  // 保存到缓存
  const cacheConfig = normalizeConfig(
    config.cache,
    DEFAULT_CACHE_CONFIG
  ) as Required<CacheConfig>
  saveToCache(response, response.config, cacheConfig)

  return response
}

/**
 * 响应错误处理：处理缓存响应
 *
 * @param error 错误对象
 * @returns Promise<AxiosResponse | never>
 *
 * 关键作用：
 * - 处理缓存命中时的 rejected Promise
 * - 将缓存响应转换为正常的 Promise.resolve
 * - 确保缓存响应被正确处理，不被误判为错误
 *
 * 返回类型统一为 Promise，确保类型一致性
 */
function onResponseError(error: any): Promise<AxiosResponse | never> {
  // 如果是缓存响应，直接返回缓存数据
  if (error.__fromCache) {
    return Promise.resolve(error.__cachedResponse)
  }

  return Promise.reject(error)
}

/**
 * 设置请求缓存插件
 *
 * @param instance Axios 实例
 *
 * 注册拦截器：
 * - 请求拦截器：检查缓存
 * - 响应拦截器：处理缓存响应或保存缓存
 * - 响应错误拦截器：处理缓存响应
 */
export function setupCachePlugin(instance: AxiosInstance): void {
  instance.interceptors.request.use(onRequest)
  instance.interceptors.response.use(onResponse, onResponseError)
}

/**
 * 清空所有缓存
 *
 * 用于：
 * - 用户登出时清理敏感数据
 * - 开发调试时重置缓存状态
 */
export function clearAllCache(): void {
  globalCache.clear()
}

/**
 * 删除指定缓存
 *
 * @param config 请求配置
 * @returns 是否删除成功
 *
 * 用于：
 * - 数据更新时清理特定缓存
 * - 缓存失效时的精确清理
 */
export function clearCache(config: InternalAxiosRequestConfig): boolean {
  const requestKey = generateRequestKey(config)
  return globalCache.delete(requestKey)
}

/**
 * 清理过期缓存
 *
 * 自动清理机制：
 * - 由 globalCache 内部实现
 * - 基于 TTL 过期时间
 * - 定期清理防止内存泄漏
 */
export function cleanupExpiredCache(): void {
  globalCache.cleanup()
}

/**
 * 获取缓存大小
 *
 * @returns 当前缓存条目数量
 *
 * 用于：
 * - 监控缓存使用情况
 * - 性能分析和调试
 */
export function getCacheSize(): number {
  return globalCache.size
}
