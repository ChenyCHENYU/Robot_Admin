/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-16 16:02:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-17 00:06:41
 * @FilePath: \Robot_Admin\src\axios\plugins\retry.ts
 * @Description: 请求重试插件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { AxiosInstance, AxiosError } from 'axios'
import type { EnhancedAxiosRequestConfig, RetryConfig } from '../types'
import {
  delay,
  isNetworkError,
  isTimeoutError,
  isRetryableStatus,
  normalizeConfig,
} from '../utils/helpers'

/**
 * 默认重试配置
 * - enabled: 是否启用重试，默认关闭
 * - count: 最大重试次数，默认3次
 * - delay: 重试延迟时间，默认1000ms
 * - exponentialBackoff: 是否启用指数退避，默认开启
 * - retryableStatusCodes: 可重试的状态码列表
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  enabled: false,
  count: 3,
  delay: 1000,
  exponentialBackoff: true,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

/**
 * 判断是否为取消错误
 *
 * @param error 错误对象
 * @returns 是否为取消错误
 *
 * 取消错误类型：
 * - Axios 的 CanceledError
 * - DOM 的 AbortError
 * - Node.js 的 ERR_CANCELED
 * - 包含 'canceled' 或 'abort' 的错误消息
 *
 * 重试策略：
 * - 用户主动取消的请求不应该重试
 * - 避免无限重试循环
 */
function isCancelError(error: any): boolean {
  return (
    error.name === 'CanceledError' ||
    error.name === 'AbortError' ||
    error.code === 'ERR_CANCELED' ||
    error.message === 'canceled' ||
    error.message?.includes('abort')
  )
}

/**
 * 判断是否应该重试
 *
 * @param error Axios 错误对象
 * @param retryConfig 重试配置
 * @returns 是否应该重试
 *
 * 重试条件判断：
 * 1. 重试功能必须启用
 * 2. 未达到最大重试次数
 * 3. 非用户主动取消的请求
 * 4. 网络错误或超时错误可重试
 * 5. 特定状态码可重试
 *
 * 重试策略：
 * - 网络问题：可重试（网络不稳定）
 * - 超时问题：可重试（临时拥堵）
 * - 服务器错误：部分可重试（5xx 错误）
 * - 客户端错误：一般不重试（4xx 错误）
 */
function shouldRetry(
  error: AxiosError,
  retryConfig: Required<RetryConfig>
): boolean {
  if (!retryConfig.enabled) {
    return false
  }

  const config = error.config as EnhancedAxiosRequestConfig
  const currentRetryCount = config.__retryCount ?? 0

  // 检查重试次数
  if (currentRetryCount >= retryConfig.count) {
    return false
  }

  // 用户主动取消的请求不重试
  if (isCancelError(error)) {
    return false
  }

  // 网络错误可重试
  if (isNetworkError(error)) {
    return true
  }

  // 超时错误可重试
  if (isTimeoutError(error)) {
    return true
  }

  // 检查状态码是否可重试
  if (error.response?.status) {
    return isRetryableStatus(
      error.response.status,
      retryConfig.retryableStatusCodes
    )
  }

  return false
}

/**
 * 计算重试延迟时间
 *
 * @param retryCount 当前重试次数
 * @param retryConfig 重试配置
 * @returns 延迟时间（毫秒）
 *
 * 延迟策略：
 * - 固定延迟：使用配置的基础延迟时间
 * - 指数退避：delay * 2^retryCount，最大30秒
 *
 * 指数退避优势：
 * - 避免短时间内频繁重试
 * - 给服务器恢复时间
 * - 减少网络拥堵
 */
function getRetryDelay(
  retryCount: number,
  retryConfig: Required<RetryConfig>
): number {
  if (!retryConfig.exponentialBackoff) {
    return retryConfig.delay
  }

  // 指数退避：delay * 2^retryCount，最大30秒
  const calculatedDelay = retryConfig.delay * Math.pow(2, retryCount)
  return Math.min(calculatedDelay, 30000)
}

/**
 * 设置请求重试插件
 *
 * @param instance Axios 实例
 *
 * 核心功能：
 * 1. 自动重试失败的请求
 * 2. 智能延迟策略（固定或指数退避）
 * 3. 保留取消信号的能力
 * 4. 清理其他插件的内部状态
 *
 * 重试机制：
 * - 仅在响应错误拦截器中处理
 * - 增加重试计数器
 * - 延迟后重新发起请求
 * - 创建新的 AbortController 但关联原取消逻辑
 */
export function setupRetryPlugin(instance: AxiosInstance): void {
  /**
   * 响应错误处理：自动重试
   *
   * @param error Axios 错误对象
   * @returns 重试结果或 rejected Promise
   *
   * 重试流程：
   * 1. 检查配置和重试条件
   * 2. 增加重试计数
   * 3. 计算延迟时间
   * 4. 等待延迟
   * 5. 创建新的请求配置
   * 6. 处理取消信号的传递
   * 7. 清理其他插件状态
   * 8. 重新发起请求
   */
  const onResponseError = async (error: AxiosError): Promise<any> => {
    const config = error.config as EnhancedAxiosRequestConfig

    if (!config) {
      return Promise.reject(error)
    }

    const retryConfig = normalizeConfig(
      config.retry,
      DEFAULT_RETRY_CONFIG
    ) as Required<RetryConfig>

    if (!shouldRetry(error, retryConfig)) {
      return Promise.reject(error)
    }

    // 增加重试计数
    config.__retryCount = (config.__retryCount ?? 0) + 1

    // 计算延迟时间
    const retryDelay = getRetryDelay(config.__retryCount, retryConfig)

    // 延迟后重试
    await delay(retryDelay)

    // 创建干净的重试配置
    const retryConfig_: EnhancedAxiosRequestConfig = { ...config }

    // 创建新的 AbortController，但监听原 signal 的 abort 事件
    const originalSignal = config.signal
    const newController = new AbortController()

    // ✅ 关键修复：如果原 signal 被触发，也触发新的 signal
    // 这样确保重试请求仍然可以被用户取消
    if (
      originalSignal &&
      typeof originalSignal.addEventListener === 'function'
    ) {
      originalSignal.addEventListener('abort', () => {
        newController.abort()
      })
    }

    // 设置新的 signal
    retryConfig_.signal = newController.signal

    // 清除其他插件相关的内部状态（保留 signal 相关的）
    // 避免插件状态冲突，确保重试请求的干净状态
    delete retryConfig_.__cancelId
    delete retryConfig_.__managedByCancel
    delete retryConfig_.__handling401

    // 使用闭包中的 instance 重新发起请求
    return instance.request(retryConfig_)
  }

  instance.interceptors.response.use(undefined, onResponseError)
}
