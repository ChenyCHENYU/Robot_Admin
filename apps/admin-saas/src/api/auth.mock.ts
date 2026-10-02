/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\api\auth.mock.ts
 * @Description: 可测试的认证 Mock 实现，未来可通过环境变量无缝切换真实后端
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from './auth.contract'

const MOCK_EXPIRES_IN = 2 * 60 * 60
const MOCK_DELAY_MS = 180

/** 创建无敏感信息的 Mock Token */
const createMockToken = (prefix: string): string => {
  const id =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  return `${prefix}.${id}`
}

/** 构造登录 Mock 响应，保持与未来后端契约一致 */
export const createMockLoginResponse = (
  request: LoginRequest
): LoginResponse => {
  const username = request.username?.trim()
  if (!username || !request.password) {
    throw new Error('请输入用户名和密码')
  }

  return {
    code: '0',
    data: {
      token: createMockToken('mock-access'),
      refreshToken: createMockToken('mock-refresh'),
      expiresIn: MOCK_EXPIRES_IN,
      user: {
        id: 'mock-user-1',
        username,
        displayName: username,
      },
    },
    msg: 'success',
  }
}

/** 构造刷新 Token Mock 响应 */
export const createMockRefreshResponse = (
  refreshToken: string
): RefreshTokenResponse => {
  if (!refreshToken.startsWith('mock-refresh.')) {
    throw new Error('Mock refresh token 无效或已过期')
  }

  return {
    code: '0',
    data: {
      token: createMockToken('mock-access'),
      refreshToken: createMockToken('mock-refresh'),
      expiresIn: MOCK_EXPIRES_IN,
    },
    msg: 'success',
  }
}

/** 模拟真实网络边界，避免业务层依赖同步返回行为 */
const withMockLatency = async <T>(factory: () => T): Promise<T> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS))
  return factory()
}

/** Mock 登录 API */
export const loginMockApi = (request: LoginRequest): Promise<LoginResponse> =>
  withMockLatency(() => createMockLoginResponse(request))

/** Mock Token 刷新 API */
export const refreshTokenMockApi = (
  refreshToken: string
): Promise<RefreshTokenResponse> =>
  withMockLatency(() => createMockRefreshResponse(refreshToken))
