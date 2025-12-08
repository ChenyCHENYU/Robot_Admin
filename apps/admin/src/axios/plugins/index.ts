/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 11:43:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-15 17:55:21
 * @FilePath: \Robot_Admin\src\axios\plugins\index.ts
 * @Description: axios 插件体系
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { AxiosInstance } from 'axios'
import { setupRequestPlugin } from './request'
import { setupDedupePlugin } from './dedupe'
import { setupCachePlugin } from './cache'
import { setupRetryPlugin } from './retry'
import { setupResponsePlugin } from './response'
import { setupCancelPlugin } from './cancel'

/**
 * 设置所有插件
 *
 * 插件加载顺序说明：
 * 1. 请求拦截器按注册顺序执行
 * 2. 响应拦截器按注册逆序执行
 *
 * 优化后的顺序（解决冲突问题）：
 * - 请求阶段：request -> cache -> cancel -> dedupe -> retry -> response
 * - 响应阶段：response -> retry -> dedupe -> cancel -> cache -> request
 *
 * 优化说明：
 * - cache 在最前：确保缓存检查优先级最高
 * - cancel 在 dedupe 之前：确保 cancel 的 signal 不被覆盖
 * - dedupe 在 cancel 之后：复用 cancel 的 signal（如果存在）
 */
export function setupPlugins(instance: AxiosInstance): void {
  // 1. 请求通用处理（token、headers）
  setupRequestPlugin(instance)

  // 2. 请求缓存（GET 请求缓存，优先级最高）
  setupCachePlugin(instance)

  // 3. 路由取消（在去重之前，确保 signal 不被覆盖）
  setupCancelPlugin(instance)

  // 4. 请求去重（防止重复请求，复用 cancel 的 signal）
  setupDedupePlugin(instance)

  // 5. 请求重试（网络错误自动重试）
  setupRetryPlugin(instance)

  // 6. 响应统一处理（业务错误、401 处理）
  setupResponsePlugin(instance)
}

// 导出所有插件的工具函数
export { resolveReLogin, rejectReLogin, getReLoginPromise } from './request'
export { cancelAllPendingRequests, getPendingRequestCount } from './dedupe'
export {
  clearAllCache,
  clearCache,
  cleanupExpiredCache,
  getCacheSize,
} from './cache'
export { cancelAllRequests, getCancelableRequestCount } from './cancel'
