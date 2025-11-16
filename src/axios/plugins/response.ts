/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-14 14:37:09
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-16 23:52:55
 * @FilePath: \Robot_Admin\src\axios\plugins\response.ts
 * @Description: 统一响应处理插件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { AxiosInstance, AxiosResponse } from 'axios'
import { createDiscreteApi } from 'naive-ui/es'
import { s_reLoginStore } from '@/stores/reLogin'
import { s_userStore } from '@/stores/user'
import { createReLoginPromise, getReLoginPromise } from './request'

const { message } = createDiscreteApi(['message'])

/**
 * 401 重试记录（存储计数和时间戳）
 *
 * 设计说明：
 * - count: 重试次数计数器
 * - timestamp: 最后一次重试时间戳
 * - 用于限制单个请求的最大重试次数
 */
interface RetryRecord {
  count: number
  timestamp: number
}

/**
 * 401 重试记录 Map
 * key: 请求唯一标识符（method-url）
 * value: 重试记录信息
 *
 * 作用：
 * - 跟踪每个 401 请求的重试状态
 * - 防止无限重试循环
 * - 支持基于时间的过期清理
 */
const retry401Map = new Map<string, RetryRecord>()

/**
 * 单个请求最大重试次数
 *
 * 设计考虑：
 * - 2 次重试足够处理临时 token 失效
 * - 避免无限重试造成资源浪费
 * - 给用户明确的失败反馈
 */
const MAX_401_RETRY = 2

/**
 * 全局 401 处理锁
 *
 * 作用：
 * - 确保同时只有一个重新登录流程
 * - 避免多个 401 请求同时触发重新登录
 * - 提高系统性能和用户体验
 */
let isHandling401Globally = false

/**
 * 等待处理的 401 请求数组
 *
 * 数据结构：
 * - config: 原始请求配置（包含完整的请求信息）
 * - resolve: Promise resolve 函数
 * - reject: Promise reject 函数
 *
 * 工作机制：
 * 1. 第一个 401 请求负责处理重新登录
 * 2. 后续 401 请求加入等待队列
 * 3. 重新登录成功后，批量处理所有等待请求
 * 4. 重新登录失败时，拒绝所有等待请求
 */
const pending401Requests: Array<{
  config: any // ✅ 保存每个请求自己的 config
  resolve: (value: any) => void
  reject: (reason?: any) => void
}> = []

/**
 * 清理过期的 401 重试记录
 *
 * 功能：
 * 1. 清理超过 5 分钟的重试记录
 * 2. 防止内存泄漏
 * 3. 确保重试记录的时效性
 *
 * 清理策略：
 * - 每 30 秒执行一次清理
 * - 基于时间戳判断过期
 * - 仅在浏览器环境中执行
 */
function cleanup401Records(): void {
  const now = Date.now()
  const EXPIRE_TIME = 5 * 60 * 1000 // 5分钟

  Array.from(retry401Map.entries()).forEach(([key, record]) => {
    if (now - record.timestamp > EXPIRE_TIME) {
      retry401Map.delete(key)
    }
  })
}

// 每 30 秒清理一次，仅在浏览器环境中执行
if (typeof window !== 'undefined') {
  setInterval(cleanup401Records, 30000)
}

/**
 * 处理 token 过期
 *
 * @returns Promise<void> 重新登录的 Promise
 *
 * 处理流程：
 * 1. 检查是否已有重新登录 Promise
 * 2. 如果没有，显示重新登录弹窗
 * 3. 创建并返回重新登录 Promise
 *
 * 设计优势：
 * - 避免重复显示登录弹窗
 * - 统一管理重新登录流程
 * - 支持并发 401 请求的统一处理
 */
function handleTokenExpire(): Promise<void> {
  let promise = getReLoginPromise()
  if (!promise) {
    const { userInfo } = s_userStore()
    const reLoginStore = s_reLoginStore()
    reLoginStore.show(userInfo?.username || '')
    promise = createReLoginPromise()
  }
  return promise
}

/**
 * 生成 401 重试的 key
 *
 * @param config 请求配置
 * @returns 唯一标识符
 *
 * 生成规则：
 * - 使用 method-url 格式
 * - 确保相同请求有相同的 key
 * - 不同请求有不同的 key
 *
 * 示例：
 * - GET-/api/user/profile
 * - POST-/api/user/login
 */
function get401RetryKey(config: any): string {
  return `${config?.method || ''}-${config?.url || ''}`
}

/**
 * 检查是否可以重试 401
 *
 * @param key 请求标识符
 * @returns 是否可以重试
 *
 * 判断条件：
 * - 没有重试记录：可以重试
 * - 重试次数未达到上限：可以重试
 * - 重试次数达到上限：不可重试
 */
function canRetry401(key: string): boolean {
  const record = retry401Map.get(key)
  return !record || record.count < MAX_401_RETRY
}

/**
 * 更新 401 重试记录
 *
 * @param key 请求标识符
 *
 * 更新逻辑：
 * - 获取现有记录或创建新记录
 * - 增加重试计数
 * - 更新时间戳
 * - 保存到 Map 中
 */
function updateRetryRecord(key: string): void {
  const record = retry401Map.get(key) || { count: 0, timestamp: Date.now() }
  retry401Map.set(key, {
    count: record.count + 1,
    timestamp: Date.now(),
  })
}

/**
 * 更新请求的 token
 *
 * @param config 请求配置
 *
 * 功能：
 * - 从用户 store 获取最新 token
 * - 更新请求头的 Authorization 字段
 * - 使用 Bearer token 格式
 *
 * 安全考虑：
 * - 检查 token 存在性
 * - 检查 headers 对象存在性
 * - 避免空指针异常
 */
function updateRequestToken(config: any): void {
  const { token } = s_userStore()
  if (token && config?.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
}

/**
 * 响应拦截器：统一处理响应
 *
 * @param response Axios 响应对象
 * @returns 处理后的响应或 rejected Promise
 *
 * 处理逻辑：
 * 1. 成功响应（200）：清理重试记录，返回响应
 * 2. 失败响应：显示错误消息，返回 rejected Promise
 *
 * 设计考虑：
 * - 统一的错误处理和用户反馈
 * - 成功时清理重试状态
 * - 保持响应数据的原始性
 */
function onResponse(response: AxiosResponse): AxiosResponse | Promise<never> {
  if (response.status === 200) {
    const key = get401RetryKey(response.config)
    retry401Map.delete(key)
    return response
  }
  message.error('调用接口失败')
  return Promise.reject(new Error(response.statusText || '接口请求失败'))
}

/**
 * 设置响应处理插件
 *
 * @param instance Axios 实例
 *
 * 核心功能：
 * 1. 统一的响应处理
 * 2. 401 错误的自动重试机制
 * 3. 重新登录的并发控制
 * 4. 用户友好的错误提示
 *
 * 注册拦截器：
 * - 响应拦截器：处理成功响应
 * - 响应错误拦截器：处理 401 和其他错误
 */
export function setupResponsePlugin(instance: AxiosInstance): void {
  /**
   * 处理 401 错误并重试请求
   *
   * @param error 401 错误对象
   * @returns 重试结果或 rejected Promise
   *
   * 核心机制：
   * 1. 全局锁：确保同时只有一个重新登录流程
   * 2. 等待队列：后续 401 请求等待第一个处理完成
   * 3. 批量处理：重新登录成功后批量重试所有等待请求
   * 4. 错误传播：重新登录失败时拒绝所有等待请求
   *
   * ✅ 关键修复：串行处理避免 Promise.all 的 resolve 用法错误
   * ✅ 关键修复：保存每个请求的独立 config
   * ✅ 关键修复：删除重复的 updateRequestToken 调用
   */
  const handle401Error = async (error: any): Promise<any> => {
    const key = get401RetryKey(error.config)

    // 检查是否可以重试
    if (!canRetry401(key)) {
      retry401Map.delete(key)
      return Promise.reject(new Error('认证失败，请重新登录'))
    }

    // 防止单个请求的并发重试
    if (error.config?.__handling401) {
      return Promise.reject(new Error('正在处理认证'))
    }

    error.config.__handling401 = true
    updateRetryRecord(key)

    // 全局 401 处理锁机制
    if (!isHandling401Globally) {
      // 第一个 401 请求，负责处理重新登录
      isHandling401Globally = true

      try {
        await handleTokenExpire()

        // 更新 token
        updateRequestToken(error.config)

        // 重新登录成功，处理当前请求
        const currentResult = await instance.request(error.config)

        // ✅ 修复：改为串行处理，避免 Promise.all 的 resolve 用法错误
        // 处理所有等待的请求
        await Promise.all(
          pending401Requests.map(async ({ config, resolve, reject }) => {
            try {
              updateRequestToken(config)
              const result = await instance.request(config)
              resolve(result)
            } catch (err) {
              reject(err)
            }
          })
        )

        // 清理所有等待的请求
        pending401Requests.length = 0
        retry401Map.delete(key)

        return currentResult // 返回当前请求的结果
      } catch (err) {
        // 重新登录失败，拒绝所有等待的请求
        pending401Requests.forEach(({ reject }) => reject(err))
        pending401Requests.length = 0
        retry401Map.delete(key)
        throw err
      } finally {
        isHandling401Globally = false
        delete error.config.__handling401
      }
    } else {
      // 不是第一个 401 请求，等待第一个处理完成
      return new Promise((resolve, reject) => {
        // ✅ 保存当前请求的 config，确保每个请求使用自己的配置
        pending401Requests.push({
          config: error.config,
          resolve,
          reject,
        })
      })
    }
  }

  /**
   * 响应错误处理
   *
   * @param error 错误对象
   * @returns 处理结果或 rejected Promise
   *
   * 处理策略：
   * 1. 401 错误：调用 handle401Error 处理
   * 2. 其他错误：显示错误消息，直接拒绝
   *
   * 用户体验：
   * - 401 错误：静默处理，用户无感知
   * - 其他错误：显示具体错误信息
   */
  const onResponseError = async (error: any): Promise<any> => {
    if (error?.response?.status === 401) {
      return handle401Error(error)
    }
    message.error(error.message || '请求失败')
    return Promise.reject(error)
  }

  instance.interceptors.response.use(onResponse, onResponseError)
}
