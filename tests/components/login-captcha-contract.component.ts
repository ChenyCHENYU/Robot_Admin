/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @FilePath: \Robot_Admin\tests\components\login-captcha-contract.component.ts
 * @Description: 登录验签适配器沿用组件库输入类型并校验服务端可选字段
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { afterEach, expect, test, vi } from 'vitest'
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

test('验签保留 signal 和字符串凭据，畸形可选字段不会伪装成可信 token', async () => {
  vi.stubEnv('VITE_CAPTCHA_PROVIDER', 'altcha')
  vi.stubEnv('VITE_CAPTCHA_VERIFY_ENDPOINT', '/api/captcha/verify')
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      valid: true,
      token: 'trusted-token',
      message: 'Accepted',
    }),
  })
  vi.stubGlobal('fetch', fetch)
  vi.resetModules()
  const { LOGIN_CAPTCHA_VERIFIER } = await import('@/views/login/captcha')
  const controller = new AbortController()
  const request = {
    token: 'challenge-proof',
    timestamp: 1,
    type: 'altcha' as const,
    signal: controller.signal,
  }
  await expect(LOGIN_CAPTCHA_VERIFIER?.(request)).resolves.toEqual({
    valid: true,
    token: 'trusted-token',
    message: 'Accepted',
  })
  expect(fetch).toHaveBeenCalledWith(
    '/api/captcha/verify',
    expect.objectContaining({
      signal: controller.signal,
      body: JSON.stringify({ payload: 'challenge-proof' }),
    })
  )
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ valid: true, token: 12, message: false }),
  })
  await expect(LOGIN_CAPTCHA_VERIFIER?.(request)).resolves.toEqual({
    valid: true,
  })
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ valid: 'yes' }),
  })
  await expect(LOGIN_CAPTCHA_VERIFIER?.(request)).rejects.toThrow(
    '响应格式无效'
  )
})
