/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-16 16:02:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-17 00:04:36
 * @FilePath: \Robot_Admin\src\axios\plugins\cancel.ts
 * @Description: 路由切换时自动取消请求插件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type {
  EnhancedAxiosRequestConfig,
  CancelConfig,
  EnhancedAbortController,
} from '../types'
import { normalizeConfig } from '../utils/helpers'

/**
 * 默认取消配置
 * - enabled: 是否启用自动取消，默认开启
 * - whitelist: 白名单，匹配的请求不会被取消
 */
const DEFAULT_CANCEL_CONFIG: Required<CancelConfig> = {
  enabled: true,
  whitelist: [],
}

/**
 * 待取消的请求 Map
 * key: 请求唯一标识符
 * value: 增强的 AbortController（包含创建时间）
 *
 * 设计说明：
 * - 使用 Map 而非 Object，提供更好的性能和 API
 * - 存储增强的 AbortController，支持超时管理
 */
const cancelableRequests = new Map<string, EnhancedAbortController>()

/**
 * 请求计数器（用于生成唯一 ID）
 *
 * 确保每个请求都有唯一的标识符，避免冲突
 */
let requestId = 0

/**
 * 清理超时请求的定时器配置
 * - CLEANUP_INTERVAL: 清理间隔，30秒
 * - REQUEST_TIMEOUT: 请求超时时间，5分钟
 */
const CLEANUP_INTERVAL = 30000 // 30 秒
const REQUEST_TIMEOUT = 300000 // 5 分钟

let cleanupTimer: NodeJS.Timeout | null = null

/**
 * 清理超时的请求
 *
 * 功能：
 * 1. 遍历所有待取消的请求
 * 2. 检查请求是否超时（基于创建时间）
 * 3. 取消超时请求并从 Map 中移除
 * 4. 错误处理避免清理过程异常
 *
 * 防止内存泄漏：
 * - 长时间运行的请求可能永远不会完成
 * - 定期清理避免内存积累
 */
function cleanupExpiredRequests(): void {
  const now = Date.now()
  const expiredKeys: string[] = []

  for (const [key, controller] of cancelableRequests.entries()) {
    // 检查请求是否超时（基于创建时间）
    const requestStartTime = controller._startTime || now
    if (now - requestStartTime > REQUEST_TIMEOUT) {
      expiredKeys.push(key)
      try {
        controller.abort()
      } catch (error) {
        console.warn('Error aborting expired request:', error)
      }
    }
  }

  // 移除超时的请求
  expiredKeys.forEach(key => cancelableRequests.delete(key))
}

/**
 * 启动清理定时器
 *
 * 生命周期管理：
 * - 清理之前的定时器（避免重复）
 * - 设置新的定时器进行定期清理
 */
function startCleanupTimer(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
  }

  cleanupTimer = setInterval(cleanupExpiredRequests, CLEANUP_INTERVAL)
}

/**
 * 停止清理定时器
 *
 * 资源清理：
 * - 清理定时器避免内存泄漏
 * - 页面卸载时调用
 */
function stopCleanupTimer(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}

/**
 * 判断请求是否在白名单中
 *
 * @param url 请求 URL
 * @param whitelist 白名单正则表达式数组
 * @returns 是否在白名单中
 *
 * 白名单机制：
 * - 匹配白名单的请求不会被自动取消
 * - 支持正则表达式灵活匹配
 * - 适用于重要的系统请求（如心跳检测）
 */
function isInWhitelist(url: string, whitelist: RegExp[]): boolean {
  return whitelist.some(pattern => pattern.test(url))
}

/**
 * 请求拦截器：添加取消控制器
 *
 * @param config 请求配置
 * @returns 增强的请求配置
 *
 * 核心功能：
 * 1. 检查 AbortController 兼容性
 * 2. 验证取消配置和白名单
 * 3. 创建 AbortController 并关联到请求
 * 4. 记录请求开始时间用于超时管理
 * 5. 将控制器存储到全局 Map 中
 *
 * 特殊处理：
 * - 缓存响应不创建 AbortController
 * - 白名单请求不创建 AbortController
 */
function onRequest(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  // 检查 AbortController 兼容性
  if (typeof AbortController === 'undefined') {
    console.warn('AbortController is not supported in this environment')
    return config
  }

  const enhancedConfig = config as EnhancedAxiosRequestConfig
  const cancelConfig = normalizeConfig(
    enhancedConfig.cancel,
    DEFAULT_CANCEL_CONFIG
  ) as Required<CancelConfig>

  if (!cancelConfig.enabled) {
    return config
  }

  // ✅ 如果来自缓存，不创建 AbortController
  // 缓存响应不需要网络请求，因此不需要取消机制
  if ((config as any).__fromCache) {
    return config
  }

  const url = config.url || ''

  // 检查是否在白名单中
  if (isInWhitelist(url, cancelConfig.whitelist)) {
    return config
  }

  // 创建取消控制器
  const controller = new AbortController() as EnhancedAbortController
  const id = `request_${++requestId}`

  // 记录请求开始时间，用于超时管理
  controller._startTime = Date.now()
  config.signal = controller.signal
  ;(config as any).__cancelId = id

  cancelableRequests.set(id, controller)

  return config
}

/**
 * 响应拦截器：清理已完成的请求
 *
 * @param response 响应对象
 * @returns 原始响应
 *
 * 清理机制：
 * - 请求成功完成后，从 Map 中移除对应的控制器
 * - 避免内存泄漏和无效的取消操作
 */
function onResponse(response: any): any {
  const config = response.config as any
  const cancelId = config.__cancelId

  if (cancelId) {
    cancelableRequests.delete(cancelId)
  }

  return response
}

/**
 * 响应错误处理：清理失败的请求
 *
 * @param error 错误对象
 * @returns rejected Promise
 *
 * 清理机制：
 * - 请求失败时，同样需要清理控制器
 * - 确保无论成功还是失败都正确清理资源
 */
function onResponseError(error: any): Promise<never> {
  const config = error.config as any
  const cancelId = config?.__cancelId

  if (cancelId) {
    cancelableRequests.delete(cancelId)
  }

  return Promise.reject(error)
}

/**
 * 设置路由取消插件
 *
 * @param instance Axios 实例
 *
 * 注册拦截器：
 * - 请求拦截器：添加取消控制器
 * - 响应拦截器：清理完成的请求
 * - 响应错误拦截器：清理失败的请求
 */
export function setupCancelPlugin(instance: AxiosInstance): void {
  instance.interceptors.request.use(onRequest)
  instance.interceptors.response.use(onResponse, onResponseError)
}

/**
 * 取消所有待处理的请求
 *
 * 使用场景：
 * - 路由切换时取消当前页面的所有请求
 * - 用户登出时清理所有请求
 * - 网络异常时重置请求状态
 *
 * 安全机制：
 * - 捕获每个取消操作的异常
 * - 确保一个请求的失败不影响其他请求的取消
 */
export function cancelAllRequests(): void {
  cancelableRequests.forEach(controller => {
    try {
      controller.abort()
    } catch (error) {
      console.warn('Error aborting request:', error)
    }
  })
  cancelableRequests.clear()
}

/**
 * 页面卸载时清理请求
 *
 * 生命周期管理：
 * - beforeunload 事件触发时清理所有请求
 * - 避免页面卸载后继续发送请求
 * - 清理定时器防止内存泄漏
 *
 * 浏览器兼容性：
 * - 检查 window 对象存在性
 * - 仅在浏览器环境中执行
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cancelAllRequests()
    stopCleanupTimer()
  })

  // 启动清理定时器
  startCleanupTimer()
}

/**
 * 获取待取消请求数量
 *
 * @returns 当前待取消的请求数量
 *
 * 监控用途：
 * - 性能监控和分析
 * - 调试请求状态
 * - 检测潜在的请求泄漏
 */
export function getCancelableRequestCount(): number {
  return cancelableRequests.size
}
