/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-16 16:02:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-15 20:10:23
 * @FilePath: \Robot_Admin\src\axios\utils\helpers.ts
 * @Description: axios 插件 - 工具函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { AxiosRequestConfig } from 'axios'
import type { CacheItem } from '../types'

/**
 * 对象键排序后序列化（确保相同对象生成相同的 key）
 * 增强版：处理数组排序和循环引用
 */
function sortedStringify(obj: any, seen = new WeakSet()): string {
  if (obj === null || obj === undefined) {
    return ''
  }

  if (typeof obj !== 'object') {
    return String(obj)
  }

  // 处理循环引用 - 抛出错误而不是静默处理
  if (seen.has(obj)) {
    throw new Error('检测到循环引用，无法生成稳定的缓存键')
  }
  seen.add(obj)

  if (Array.isArray(obj)) {
    // 数组保持原始顺序，不进行排序
    // 因为数组顺序通常是有意义的（如排序参数、多选等）
    return JSON.stringify(obj.map(item => sortedStringify(item, seen)))
  }

  const sortedKeys = Object.keys(obj).sort()
  const sortedObj: Record<string, any> = {}

  for (const key of sortedKeys) {
    sortedObj[key] = obj[key]
  }

  return JSON.stringify(sortedObj)
}

/**
 * 生成请求唯一标识 key
 */
export function generateRequestKey(config: AxiosRequestConfig): string {
  const { method = 'get', url = '', params, data } = config

  const parts: string[] = [method.toUpperCase(), url]

  // 添加 params（GET 请求参数）- 使用排序后的序列化
  if (params && Object.keys(params).length > 0) {
    parts.push(sortedStringify(params))
  }

  // 添加 data（POST 请求体）- 使用排序后的序列化
  if (data && Object.keys(data).length > 0) {
    parts.push(sortedStringify(data))
  }

  return parts.join('|')
}

/**
 * 内存缓存管理器（增强版：支持大小限制和 LRU）
 */
export class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private maxSize = 1000 // 最大缓存数量
  private accessOrder = new Set<string>() // 记录访问顺序

  /**
   * 获取缓存
   */
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) return null

    // 检查是否过期
    if (Date.now() > item.expireAt) {
      this.cache.delete(key)
      this.accessOrder.delete(key)
      return null
    }

    // 更新访问顺序（LRU）
    this.accessOrder.delete(key)
    this.accessOrder.add(key)

    return item.data as T
  }

  /**
   * 设置缓存
   */
  set<T = any>(key: string, data: T, ttl: number): void {
    // 如果超过最大大小，清理最旧的缓存
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest()
    }

    const expireAt = Date.now() + ttl

    this.cache.set(key, {
      data,
      expireAt,
    })

    // 更新访问顺序
    this.accessOrder.delete(key)
    this.accessOrder.add(key)
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    this.accessOrder.delete(key)
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())

    for (const [key, item] of entries) {
      if (now > item.expireAt) {
        this.cache.delete(key)
        this.accessOrder.delete(key)
      }
    }
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 设置最大缓存大小
   */
  setMaxSize(size: number): void {
    this.maxSize = size

    // 如果当前缓存超过新的大小限制，清理最旧的
    while (this.cache.size > this.maxSize) {
      this.evictOldest()
    }
  }

  /**
   * 清理最旧的缓存（LRU）
   */
  private evictOldest(): void {
    const oldestKey = this.accessOrder.values().next().value
    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.accessOrder.delete(oldestKey)
    }
  }
}

/**
 * 全局缓存实例
 */
export const globalCache = new MemoryCache()

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: any): boolean {
  return (
    !error.response &&
    Boolean(error.code) &&
    error.code !== 'ECONNABORTED' &&
    error.code !== 'ERR_CANCELED' &&
    error.message !== 'canceled' &&
    error.message !== 'Request aborted' &&
    error.message !== 'Request cancelled'
  )
}

/**
 * 判断是否为超时错误
 */
export function isTimeoutError(error: any): boolean {
  return error.code === 'ECONNABORTED' && error.message.includes('timeout')
}

/**
 * 判断是否为可重试的状态码
 */
export function isRetryableStatus(
  status: number,
  retryableStatusCodes: number[]
): boolean {
  return retryableStatusCodes.includes(status)
}

/**
 * 规范化配置（将 boolean 转换为对象）
 */
export function normalizeConfig<T extends Record<string, any>>(
  config: boolean | T | undefined,
  defaults: T
): T {
  if (config === true) {
    return { ...defaults, enabled: true }
  }

  if (config === false) {
    return { ...defaults, enabled: false }
  }

  if (typeof config === 'object') {
    return { ...defaults, ...config }
  }

  return defaults
}
