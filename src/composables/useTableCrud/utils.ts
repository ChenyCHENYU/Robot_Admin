/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-06
 * @Description: useTableCrud 工具函数
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { DataRecord } from './types'
import {
  DATA_FIELD_ALIASES,
  LIST_FIELD_ALIASES,
  TOTAL_FIELD_ALIASES,
  SUCCESS_CODES,
} from './constants'

/**
 * 字段查找器（支持多种字段别名）
 */
export const FieldFinder = {
  /**
   * 查找第一个存在的字段值
   */
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

  /**
   * 查找第一个存在的数字字段
   */
  findNumber(
    obj: Record<string, any> | null | undefined,
    aliases: readonly string[],
    defaultValue = 0
  ): number {
    const value = this.findFirst(obj, aliases, defaultValue)
    return Number(value) || defaultValue
  },
}

/**
 * 响应标准化工具
 */
export const ResponseNormalizer = {
  /**
   * 判断响应是否成功
   */
  isSuccess(res: any): boolean {
    if (typeof res.success === 'boolean') return res.success
    // 支持数字和字符串类型的 code
    return (
      SUCCESS_CODES.includes(res.code) ||
      SUCCESS_CODES.includes(String(res.code) as any)
    )
  },

  /**
   * 标准化响应数据（提取 data 层）
   */
  normalize<T = any>(res: any): { data: T; success: boolean; raw: any } {
    // 如果响应没有标准结构，直接返回
    if (!res || typeof res !== 'object' || !('data' in res)) {
      return { data: res as T, success: true, raw: res }
    }

    return {
      data: FieldFinder.findFirst(res, DATA_FIELD_ALIASES, res),
      success: ResponseNormalizer.isSuccess(res),
      raw: res,
    }
  },
}

/**
 * URL 工具
 */
export const UrlUtils = {
  /**
   * 构建 URL（处理路径参数）
   */
  buildUrl(endpoint: string, id?: string | number): string {
    if (id !== undefined && endpoint.includes(':id')) {
      return endpoint.replace(':id', String(id))
    }
    return endpoint
  },
}

/**
 * 数据提取工具（增强版，支持多种响应格式）
 */
export const DataExtractor = {
  /**
   * 从响应中提取列表数据（支持多种格式）
   *
   * 支持的响应结构：
   * 1. { code: 0, data: { list: [...], total: 10 } }  // 嵌套结构（最常见）
   * 2. { data: { items: [...], total: 10 } }           // 嵌套结构
   * 3. { list: [...], total: 10 }                      // 扁平结构
   * 4. { items: [...], totalCount: 10 }                // 不同字段名
   * 5. { data: [...] }                                  // 直接数组
   * 6. [...]                                            // 纯数组
   */
  extractList<T = any>(response: any): { items: T[]; total: number } {
    // 第一步：标准化响应，提取 data 层
    const normalized = ResponseNormalizer.normalize(response)
    const dataLayer = normalized.data ?? response

    // 第二步：从 data 层提取列表数组
    const list = FieldFinder.findFirst<any[]>(dataLayer, LIST_FIELD_ALIASES, [])

    // 第三步：提取总数
    const total = FieldFinder.findNumber(dataLayer, TOTAL_FIELD_ALIASES, 0)

    return {
      items: Array.isArray(list) ? list : [],
      total,
    }
  },

  /**
   * 从响应中提取详情数据
   */
  extractDetail<T = any>(response: any): T | null {
    // 标准化响应
    const normalized = ResponseNormalizer.normalize(response)
    return normalized.data as T | null
  },
}

/**
 * 行操作工具
 */
export const RowUtils = {
  /**
   * 从数组中查找行索引
   */
  findIndex<T extends DataRecord>(items: T[], idKey: keyof T, id: any): number {
    return items.findIndex(item => item[idKey] === id)
  },

  /**
   * 从数组中移除行
   */
  remove<T extends DataRecord>(items: T[], idKey: keyof T, id: any): boolean {
    const index = this.findIndex(items, idKey, id)
    if (index !== -1) {
      items.splice(index, 1)
      return true
    }
    return false
  },

  /**
   * 生成默认 ID
   */
  generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000)
  },
}
