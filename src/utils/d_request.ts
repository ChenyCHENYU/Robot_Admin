/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-31
 * @FilePath: \Robot_Admin\src\utils\d_request.ts
 * @Description: 请求响应契约与错误信息解析工具
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export const BUSINESS_SUCCESS_CODES = [200, 0, '200', '0'] as const

interface AuthSessionCredentials {
  token: string
  refreshToken: string
}

/** 异步刷新完成时只允许更新发起它的同一会话。 */
export const isSameAuthSession = (
  current: AuthSessionCredentials,
  started: AuthSessionCredentials
): boolean =>
  current.token === started.token &&
  current.refreshToken === started.refreshToken

/** 只对仍属于当前会话的 401 尝试续期，避免旧请求跨账号重试。 */
export const shouldRecoverUnauthorized = (
  status: number | undefined,
  authorization: unknown,
  currentToken: string
): boolean =>
  status === 401 &&
  currentToken.length > 0 &&
  authorization === `Bearer ${currentToken}`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** 诊断数字接受限定整数，拒绝字符串、无限值和任意错误内容。 */
const boundedDiagnosticInteger = (
  value: unknown,
  minimum: number,
  maximum: number
): number | undefined =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= minimum &&
  value <= maximum
    ? value
    : undefined

/** 拒绝任意文字进入追踪字段，只接受服务端约定的UUID或32位十六进制值。 */
const safeDiagnosticTraceValue = (value: unknown): string | undefined =>
  typeof value === 'string' &&
  /^(?:[\da-f]{32}|[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12})$/i.test(value)
    ? value
    : undefined

/** 认证头和任意错误文字不进入追踪字段。 */
const safeDiagnosticTrace = (headers: unknown): string | undefined => {
  if (!isRecord(headers)) return undefined
  return safeDiagnosticTraceValue(
    headers['x-trace-id'] ?? headers['X-Trace-Id']
  )
}

/** 请求诊断只保留状态、有限业务码和追踪ID，不传播Axios配置、报文或认证头。 */
export const getSafeRequestDiagnostic = (
  error: unknown
): { status?: number; code?: number; traceId?: string } => {
  if (!isRecord(error)) return {}
  const response = isRecord(error.response) ? error.response : error
  const data = isRecord(response.data) ? response.data : {}
  const result: { status?: number; code?: number; traceId?: string } = {}
  const status = boundedDiagnosticInteger(response.status, 100, 599)
  const code = boundedDiagnosticInteger(data.code ?? response.code, 0, 999999)
  const traceId =
    safeDiagnosticTrace(response.headers) ??
    safeDiagnosticTraceValue(response.traceId)
  if (status !== undefined) result.status = status
  if (code !== undefined) result.code = code
  if (traceId !== undefined) result.traceId = traceId
  return result
}

/**
 * @description 解析业务响应；无业务码或成功业务码均不返回错误。
 * @param payload 响应数据
 * @returns 业务错误信息
 */
export const getBusinessErrorMessage = (
  payload: unknown
): string | undefined => {
  if (
    !isRecord(payload) ||
    !Object.prototype.hasOwnProperty.call(payload, 'code')
  ) {
    return undefined
  }
  if (
    BUSINESS_SUCCESS_CODES.includes(
      payload.code as (typeof BUSINESS_SUCCESS_CODES)[number]
    )
  ) {
    return undefined
  }

  const apiMessage = payload.message ?? payload.msg
  return typeof apiMessage === 'string' && apiMessage.trim()
    ? apiMessage
    : '请求失败'
}

/**
 * @description 从未知异常中安全提取 message/msg，避免拦截器依赖不安全类型。
 * @param error 未知请求异常
 * @returns 可展示的错误信息
 */
export const getRequestErrorMessage = (error: unknown): string => {
  if (!isRecord(error)) return '请求失败'
  const { response } = error
  if (isRecord(response) && isRecord(response.data)) {
    const apiMessage = response.data.message ?? response.data.msg
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage
  }
  return typeof error.message === 'string' && error.message.trim()
    ? error.message
    : '请求失败'
}
