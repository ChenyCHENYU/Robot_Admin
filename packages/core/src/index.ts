/*
 * @robot/core - 核心基础设施
 * 
 * 提供 Robot Admin 应用所需的核心功能:
 * - 认证工具 (utils/auth)
 * - 存储工具 (utils/storage)
 * - 路由工具 (utils/route)
 * - 菜单工具 (utils/menu)
 * - Axios 请求封装 (axios)
 * - 指令系统 (directives)
 * - Store 模板 (stores)
 * - 类型定义 (types)
 */

export const CORE_VERSION = '1.0.0'

// 导出工具函数
export * from './utils'

// 导出 Axios 实例和方法
export * from './axios'

// 导出类型定义
export * from './types'
