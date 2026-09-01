/*
 * @Description: 全局错误处理核心逻辑
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type {
  ErrorContext,
  ErrorHandlerOptions,
  ErrorSource,
  StandardError,
} from '@/types/modules/global-errors'
import { createDiscreteApi } from 'naive-ui/es'
import { reportErrorToServer } from './reporter'

// 独立的 message 实例（避免循环依赖）
const { message } = createDiscreteApi(['message'])

// 错误去重：记录最近的错误，避免短时间内重复提示
const errorCache = new Map<string, number>()
const ERROR_CACHE_DURATION = 3000 // 3秒内相同错误只提示一次
const MAX_CACHE_SIZE = 100 // 最大缓存条目数，防止内存泄漏
const CLEANUP_INTERVAL = 10000 // 优化：清理间隔改为10秒，减少性能影响

// 定期清理过期缓存的定时器
let cleanupTimer: number | null = null
let lastCleanupTime = 0 // 记录上次清理时间

// 递归防护：防止错误处理本身出错导致无限循环
let isHandlingError = false

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<ErrorHandlerOptions> = {
  showMessage: true,
  logToConsole: true,
  reportToServer: false,
  severity: 'medium',
  customMessage: '',
  silent: false,
}

/**
 * 错误提示文案映射
 */
const ERROR_MESSAGES: Record<ErrorSource, (context: ErrorContext) => string> = {
  vue: context =>
    context.componentName
      ? `组件 ${context.componentName} 发生错误`
      : '页面渲染出错，请刷新重试',
  promise: () => '操作失败，请稍后重试',
  resource: () => '资源加载失败，请检查网络',
  script: () => '脚本加载失败，请刷新页面',
  network: () => '网络请求失败，请检查网络连接',
  unknown: () => '系统发生错误，请刷新页面',
}

/**
 * 生成错误唯一标识（用于去重）
 */
const generateErrorKey = (context: ErrorContext): string => {
  return `${context.source}:${context.message}:${context.componentName || ''}`
}

/**
 * 清理过期的错误缓存（防止内存泄漏）
 */
const cleanupExpiredCache = (): void => {
  const now = Date.now()

  // 优化：避免频繁清理，如果距离上次清理时间太短则跳过
  if (now - lastCleanupTime < CLEANUP_INTERVAL / 2) {
    return
  }

  lastCleanupTime = now
  const expiredKeys: string[] = []

  errorCache.forEach((time, key) => {
    if (now - time > ERROR_CACHE_DURATION) {
      expiredKeys.push(key)
    }
  })

  expiredKeys.forEach(key => errorCache.delete(key))

  // 如果缓存仍然过大，删除最旧的条目
  if (errorCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(errorCache.entries())
    // 按时间排序，删除最旧的条目
    entries.sort((a, b) => a[1] - b[1])
    const toDelete = entries.slice(0, errorCache.size - MAX_CACHE_SIZE)
    toDelete.forEach(([key]) => errorCache.delete(key))
  }
}

/**
 * 启动定期清理定时器
 */
const startCleanupTimer = (): void => {
  if (cleanupTimer) return

  // 优化：使用更长的清理间隔，减少性能影响
  cleanupTimer = window.setInterval(() => {
    cleanupExpiredCache()
  }, CLEANUP_INTERVAL)
}

/**
 * 停止清理定时器（用于应用卸载时）
 */
export const stopCleanupTimer = (): void => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }
}

/**
 * 检查错误是否重复
 */
const isDuplicateError = (context: ErrorContext): boolean => {
  const key = generateErrorKey(context)
  const lastTime = errorCache.get(key)
  const now = Date.now()

  if (lastTime && now - lastTime < ERROR_CACHE_DURATION) {
    return true
  }

  errorCache.set(key, now)

  // 启动清理定时器（首次使用时）
  if (!cleanupTimer) {
    startCleanupTimer()
  }

  // 如果缓存过大，立即清理
  if (errorCache.size > MAX_CACHE_SIZE) {
    cleanupExpiredCache()
  }

  return false
}

/**
 * 安全地获取字符串值
 */
const safeString = (value: unknown, defaultValue: string = ''): string => {
  if (typeof value === 'string') {
    return value.trim()
  }
  return String(value || defaultValue)
}

/**
 * 安全地获取数字值
 */
const safeNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && isFinite(value)) {
    return value
  }
  return undefined
}

/**
 * 安全地获取URL
 */
const safeUrl = (url?: unknown): string => {
  if (url && typeof url === 'string') {
    return url
  }
  try {
    return window.location.href
  } catch {
    return 'unknown'
  }
}

/**
 * 从对象类型错误中提取基础信息
 */
const extractBasicInfo = (error: StandardError) => {
  return {
    message: safeString(error?.message, String(error)),
    stack: error?.stack,
    handled: Boolean(error?.handled),
  }
}

/**
 * 从对象类型错误中提取位置信息
 */
const extractLocationInfo = (
  error: StandardError,
  additionalInfo: Record<string, unknown>
) => {
  return {
    url: error?.url || additionalInfo?.url,
    line: safeNumber(error?.line) || safeNumber(additionalInfo?.line),
    column: safeNumber(error?.column) || safeNumber(additionalInfo?.column),
  }
}

/**
 * 从对象类型错误中提取信息
 */
const extractObjectErrorInfo = (
  error: StandardError,
  additionalInfo: Record<string, unknown>
) => {
  const basicInfo = extractBasicInfo(error)
  const locationInfo = extractLocationInfo(error, additionalInfo)

  return {
    ...basicInfo,
    ...locationInfo,
  }
}

/**
 * 从基础类型错误中提取信息
 */
const extractPrimitiveErrorInfo = (
  error: unknown,
  additionalInfo: Record<string, unknown>
) => {
  return {
    message: safeString(error, '未知错误'),
    stack: undefined,
    url: additionalInfo?.url,
    line: safeNumber(additionalInfo?.line),
    column: safeNumber(additionalInfo?.column),
    handled: false,
  }
}

/**
 * 从错误对象中提取信息
 */
const extractErrorInfo = (
  error: unknown,
  additionalInfo: Record<string, unknown>
) => {
  if (error && typeof error === 'object') {
    return extractObjectErrorInfo(error as StandardError, additionalInfo)
  }

  return extractPrimitiveErrorInfo(error, additionalInfo)
}

/**
 * 创建错误上下文
 */
export function createErrorContext(
  source: ErrorSource,
  error: unknown,
  componentName?: string,
  additionalInfo?: Record<string, unknown>
): ErrorContext {
  // 边界情况处理：确保所有参数都有有效值
  const safeSource = source || 'unknown'
  const safeComponentName = safeString(componentName) || undefined
  const safeAdditionalInfo =
    additionalInfo && typeof additionalInfo === 'object' ? additionalInfo : {}

  // 从错误对象中提取信息
  const { message, stack, url, line, column, handled } = extractErrorInfo(
    error,
    safeAdditionalInfo
  )

  // 边界情况处理：确保消息不为空
  const safeMessage = message || `${safeSource}错误：未知错误信息`

  return {
    source: safeSource,
    message: safeMessage.trim(),
    stack,
    timestamp: Date.now(),
    url: safeUrl(url),
    componentName: safeComponentName,
    line,
    column,
    handled,
    severity: 'medium', // 默认严重程度
    additionalInfo: safeAdditionalInfo,
  }
}

/**
 * 打印错误到控制台（仅开发环境）
 */
const logErrorToConsole = (context: ErrorContext): void => {
  if (!import.meta.env.DEV) return

  console.group?.(`[全局错误] ${context.source}`)
  console.error?.('错误信息:', context.message)
  console.error?.('错误堆栈:', context.stack)
  console.error?.('完整上下文:', context)
  console.groupEnd?.()
}

/**
 * 获取用户友好的错误提示
 */
const getUserFriendlyMessage = (context: ErrorContext): string => {
  const generator = ERROR_MESSAGES[context.source]
  return generator ? generator(context) : ERROR_MESSAGES.unknown(context)
}

/**
 * 显示错误提示（带防护）
 */
const showErrorMessage = (context: ErrorContext): void => {
  try {
    const userMessage = getUserFriendlyMessage(context)
    // 用户提示不需要脱敏，因为已经是友好提示
    message.error(userMessage, {
      duration: 3000,
      closable: true,
    })
  } catch (err) {
    // 如果 message 显示失败，降级到 console
    console.error('错误提示显示失败:', err)
  }
}

/**
 * 验证错误上下文
 */
const validateErrorContext = (context: ErrorContext): boolean => {
  if (!context || typeof context !== 'object') {
    console.error('[无效错误上下文] 提供的上下文不是有效对象:', context)
    return false
  }

  if (!context.message || typeof context.message !== 'string') {
    console.error('[无效错误消息] 错误消息无效:', context.message)
    return false
  }

  return true
}

/**
 * 安全化处理选项
 */
const sanitizeOptions = (
  options: ErrorHandlerOptions
): Required<ErrorHandlerOptions> => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  return {
    showMessage:
      typeof mergedOptions.showMessage === 'boolean'
        ? mergedOptions.showMessage
        : DEFAULT_OPTIONS.showMessage,
    logToConsole:
      typeof mergedOptions.logToConsole === 'boolean'
        ? mergedOptions.logToConsole
        : DEFAULT_OPTIONS.logToConsole,
    reportToServer:
      typeof mergedOptions.reportToServer === 'boolean'
        ? mergedOptions.reportToServer
        : DEFAULT_OPTIONS.reportToServer,
    severity: mergedOptions.severity || DEFAULT_OPTIONS.severity,
    customMessage: mergedOptions.customMessage || DEFAULT_OPTIONS.customMessage,
    silent:
      typeof mergedOptions.silent === 'boolean'
        ? mergedOptions.silent
        : DEFAULT_OPTIONS.silent,
  }
}

/**
 * 执行错误处理操作
 */
const executeErrorHandling = (
  context: ErrorContext,
  options: Required<ErrorHandlerOptions>
): void => {
  const { showMessage, logToConsole, reportToServer, silent } = options

  if (logToConsole) {
    logErrorToConsole(context)
  }

  if (showMessage && !silent) {
    showErrorMessage(context)
  }

  if (reportToServer && import.meta.env.PROD) {
    void reportErrorToServer(context)
  }
}

/**
 * 统一错误处理入口
 */
export function handleError(
  context: ErrorContext,
  options: ErrorHandlerOptions = {}
): void {
  // 边界情况处理：确保上下文有效
  if (!validateErrorContext(context)) {
    return
  }

  // 递归防护：防止错误处理本身出错
  if (isHandlingError) {
    console.error('[递归错误] 错误处理中又发生错误:', context.message)
    return
  }

  try {
    isHandlingError = true

    // 已标记处理过，直接跳过
    if (context.handled) return

    // 错误去重：短时间内相同错误只处理一次
    if (isDuplicateError(context)) {
      if (import.meta.env.DEV) {
        console.log('[重复错误] 已忽略:', context.message)
      }
      return
    }

    // 安全化处理选项
    const safeOptions = sanitizeOptions(options)

    // 执行错误处理操作
    executeErrorHandling(context, safeOptions)
  } catch (err) {
    // 最后的防护：错误处理本身出错
    console.error('[错误处理失败]:', err)
  } finally {
    isHandlingError = false
  }
}
