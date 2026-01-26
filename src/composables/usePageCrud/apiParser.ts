/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-01-26 14:00:00
 * @Description: API 路径解析器
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { ApiEndpoints } from './types'

/**
 * 规范化 API 配置
 * 移除路径参数占位符，实际 ID 在运行时添加
 *
 * @example
 * normalizeApi({ list: '/api/user/list', get: '/api/user/:id' })
 * // => { list: '/api/user/list', get: '/api/user' }
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
