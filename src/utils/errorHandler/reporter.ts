/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\utils\errorHandler\reporter.ts
 * @Description: 客户端错误脱敏与同源上报
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  ErrorContext,
  ErrorSeverity,
  ErrorSource,
} from '@/types/modules/global-errors'

const MAX_MESSAGE_LENGTH = 200
const MAX_STACK_LENGTH = 2_000

export interface ErrorReportPayload {
  source: ErrorSource
  severity: ErrorSeverity
  message: string
  stack?: string
  url: string
  timestamp: number
  componentName?: string
}

/** 对可能含凭据和个人信息的文本做基础脱敏。 */
export const sanitizeSensitiveText = (value: string): string =>
  value
    .replace(/password["\s]*[:=]["\s]*[^"\s]+/gi, 'password:***')
    .replace(/token["\s]*[:=]["\s]*[^"\s]+/gi, 'token:***')
    .replace(/api[_-]?key["\s]*[:=]["\s]*[^"\s]+/gi, 'api_key:***')
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      '***@***.***'
    )
    .replace(/\b1[3-9]\d{9}\b/g, '***********')
    .replace(/\b\d{17}[\dXx]\b/g, '******************')

const truncate = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value

const sanitizeUrl = (value: string): string => {
  if (typeof window === 'undefined') return 'unknown'
  try {
    const url = new URL(value, window.location.origin)
    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return 'unknown'
  }
}

/** 创建不包含查询参数、认证信息和业务附加数据的错误上报载荷。 */
export const createErrorReportPayload = (
  context: ErrorContext
): ErrorReportPayload => ({
  source: context.source,
  severity: context.severity ?? 'medium',
  message: truncate(
    sanitizeSensitiveText(context.message || '发生未知错误'),
    MAX_MESSAGE_LENGTH
  ),
  stack: context.stack
    ? truncate(sanitizeSensitiveText(context.stack), MAX_STACK_LENGTH)
    : undefined,
  url: sanitizeUrl(context.url),
  timestamp: context.timestamp,
  componentName: context.componentName,
})

/**
 * @description 使用 Beacon 或 keepalive fetch 将脱敏错误发送到同源接口。
 * @param context 错误上下文
 * @returns 上报是否被浏览器接受
 */
export const reportErrorToServer = async (
  context: ErrorContext
): Promise<boolean> => {
  const endpoint = import.meta.env.VITE_ERROR_REPORT_ENDPOINT?.trim()
  if (
    !endpoint ||
    !endpoint.startsWith('/') ||
    endpoint.startsWith('//') ||
    typeof window === 'undefined' ||
    typeof navigator === 'undefined'
  ) {
    return false
  }

  const body = JSON.stringify(createErrorReportPayload(context))
  if (typeof navigator.sendBeacon === 'function') {
    const accepted = navigator.sendBeacon(
      endpoint,
      new Blob([body], { type: 'application/json' })
    )
    if (accepted) return true
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      credentials: 'same-origin',
      keepalive: true,
    })
    return response.ok
  } catch {
    return false
  }
}
