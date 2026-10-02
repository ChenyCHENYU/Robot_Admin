/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-13 23:13:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-14 10:51:23
 * @FilePath: \Robot_Admin\src\types\modules\global-errors.d.ts
 * @Description:  全局错误处理类型定义
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * 错误来源
 */
export type ErrorSource =
  | 'vue' // Vue 组件错误
  | 'promise' // 未捕获的 Promise 错误
  | 'resource' // 资源加载错误
  | 'script' // 脚本错误
  | 'network' // 网络错误
  | 'unknown' // 未知错误

/**
 * 资源类型
 */
export type ResourceType = 'img' | 'script' | 'link' | 'video' | 'audio'

/**
 * 错误严重程度
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * 标准错误对象接口
 */
export interface StandardError {
  message?: string
  stack?: string
  handled?: boolean
  url?: string
  line?: number
  column?: number
}

/**
 * 错误上下文
 */
export interface ErrorContext {
  source: ErrorSource
  message: string
  stack?: string
  timestamp: number
  url: string // 发生错误的页面 URL 或资源 URL
  componentName?: string // Vue 组件名称
  line?: number // 错误发生的行号（脚本错误）
  column?: number // 错误发生的列号（脚本错误）
  handled: boolean // 是否已被处理（避免重复提示）
  severity?: ErrorSeverity // 错误严重程度
  userId?: string // 用户ID（用于错误追踪）
  sessionId?: string // 会话ID（用于错误追踪）
  userAgent?: string // 用户代理
  additionalInfo?: Record<string, unknown> // 额外信息
}

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  showMessage?: boolean // 是否显示错误提示
  logToConsole?: boolean // 是否打印到控制台
  reportToServer?: boolean // 是否上报到服务器（预留）
  severity?: ErrorSeverity // 错误严重程度
  customMessage?: string // 自定义错误消息
  silent?: boolean // 静默模式（不显示任何提示）
}

/**
 * 错误上报配置
 */
export interface ErrorReportConfig {
  endpoint: string // 上报接口地址
  batchSize: number // 批量上报大小
  retryTimes: number // 重试次数
  retryDelay: number // 重试延迟（毫秒）
  enabled: boolean // 是否启用
}

/**
 * 错误缓存配置
 */
export interface ErrorCacheConfig {
  duration: number // 缓存持续时间（毫秒）
  maxSize: number // 最大缓存条目数
  cleanupInterval: number // 清理间隔（毫秒）
}

/**
 * Vue 错误处理器参数
 */
export interface VueErrorHandlerParams {
  err: unknown
  instance: import('vue').ComponentPublicInstance | null
  info: string
}
