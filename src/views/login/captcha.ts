type CaptchaProvider = 'puzzle-captcha' | 'altcha'

interface CaptchaVerificationRequest {
  token: string
  timestamp: number
  type: CaptchaProvider
  signal: AbortSignal
}

interface CaptchaVerificationResult {
  valid: boolean
  token?: string
  message?: string
}

const provider = import.meta.env.VITE_CAPTCHA_PROVIDER ?? 'puzzle-captcha'
const challengeUrl = import.meta.env.VITE_CAPTCHA_CHALLENGE_URL?.trim()
const verifyEndpoint = import.meta.env.VITE_CAPTCHA_VERIFY_ENDPOINT?.trim()

const verifyAltcha = async (
  request: CaptchaVerificationRequest
): Promise<CaptchaVerificationResult> => {
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

  const result: unknown = await response.json()
  if (
    !result ||
    typeof result !== 'object' ||
    !('valid' in result) ||
    typeof result.valid !== 'boolean'
  ) {
    throw new Error('ALTCHA 服务端验签响应格式无效')
  }
  return result as CaptchaVerificationResult
}

export const LOGIN_CAPTCHA_PROVIDER: CaptchaProvider = provider
export const LOGIN_CAPTCHA_CHALLENGE_URL = challengeUrl
export const LOGIN_REQUIRE_CAPTCHA_SERVER_VERIFICATION = provider === 'altcha'
export const LOGIN_CAPTCHA_VERIFIER =
  provider === 'altcha' ? verifyAltcha : undefined
