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
