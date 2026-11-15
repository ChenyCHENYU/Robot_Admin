/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @FilePath: \Robot_Admin\src\views\login\captcha.ts
 * @Description: 复用组件库验证码契约，应用只负责服务端验签边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  CaptchaProvider,
  CaptchaVerifier,
  CaptchaVerificationResult,
} from '@robot-admin/naive-ui-components/C_Captcha'

const provider = import.meta.env.VITE_CAPTCHA_PROVIDER ?? 'puzzle-captcha'
const challengeUrl = import.meta.env.VITE_CAPTCHA_CHALLENGE_URL?.trim()
const verifyEndpoint = import.meta.env.VITE_CAPTCHA_VERIFY_ENDPOINT?.trim()

const verifyAltcha: CaptchaVerifier = async request => {
  if (!verifyEndpoint) {
    throw new Error('ALTCHA 服务端验签地址未配置')
  }

  const response = await fetch(verifyEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ payload: request.token }),
    credentials: 'same-origin',
    cache: 'no-store',
    signal: request.signal,
  })
  if (!response.ok) {
    throw new Error(`ALTCHA 服务端验签失败 (${response.status})`)
  }

  return parseVerificationResult(await response.json())
}

/** 服务端响应只保留协议中的有效字段，不将未知值断言为可信凭据。 */
function parseVerificationResult(result: unknown): CaptchaVerificationResult {
  if (
    !result ||
    typeof result !== 'object' ||
    !('valid' in result) ||
    typeof result.valid !== 'boolean'
  ) {
    throw new Error('ALTCHA 服务端验签响应格式无效')
  }
  return {
    valid: result.valid,
    ...('token' in result && typeof result.token === 'string'
      ? { token: result.token }
      : {}),
    ...('message' in result && typeof result.message === 'string'
      ? { message: result.message }
      : {}),
  }
}

export const LOGIN_CAPTCHA_PROVIDER: CaptchaProvider = provider
export const LOGIN_CAPTCHA_CHALLENGE_URL = challengeUrl
export const LOGIN_REQUIRE_CAPTCHA_SERVER_VERIFICATION = provider === 'altcha'
export const LOGIN_CAPTCHA_VERIFIER =
  provider === 'altcha' ? verifyAltcha : undefined
