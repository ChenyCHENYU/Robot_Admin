/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: API 路径解析器
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { ApiEndpoints } from './types'

/**
 * 规范化 API 配置
 * 移除路径参数占位符（如 :id），避免与运行时 ID 拼接冲突
 *
 * @why 保留这个函数的原因：
 * 1. 用户可能写成 '/api/user/:id'，我们需要清理占位符
 * 2. 运行时根据 appendIdToPath 配置决定是否添加 ID
 * 3. 避免出现 '/api/user/:id/123' 这种错误路径
 *
 * @example
 * normalizeApi({ get: '/api/user/:id', update: '/api/user/:id' })
 * // => { get: '/api/user', update: '/api/user' }
 *
 * // 运行时根据配置动态拼接：
 * // appendIdToPath=true  → '/api/user/123'
 * // appendIdToPath=false → '/api/user?id=123' 或 body: {id: 123}
 */
export function normalizeApi(api: ApiEndpoints): ApiEndpoints {
  // 处理路径参数占位符
  const normalized: Record<string, any> = {}

  for (const [key, value] of Object.entries(api)) {
    if (key === 'actions' && typeof value === 'object') {
      // actions 是对象，需要递归处理
      const normalizedActions: Record<string, string> = {}
      for (const [actionKey, actionPath] of Object.entries(
        value as Record<string, string>
      )) {
        normalizedActions[actionKey] =
          typeof actionPath === 'string'
            ? actionPath.replace(/:id/g, '')
            : actionPath
      }
      normalized[key] = normalizedActions
    } else if (typeof value === 'string') {
      normalized[key] = value.replace(/:id/g, '')
    } else {
      normalized[key] = value
    }
  }

  return normalized as ApiEndpoints
}
