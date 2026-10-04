/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\api\auth.mock.ts
 * @Description: 可测试的认证 Mock 实现，未来可通过环境变量无缝切换真实后端
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  ActivateAuthContextRequest,
  AuthContext,
  LoginRequest,
  LoginResponse,
  LoginCompaniesResponse,
  RefreshTokenResponse,
} from './auth.contract'
import { getMockAuthContexts } from './auth.mock-directory'
export { getMockAuthContexts } from './auth.mock-directory'

const MOCK_EXPIRES_IN = 2 * 60 * 60
const MOCK_DELAY_MS = 180
const MOCK_TICKET_TTL_MS = 5 * 60 * 1000
const MAX_PENDING_TICKETS = 256
const pendingTickets = new Map<
  string,
  { username: string; expiresAt: number }
>()
const MOCK_REFRESH_TOKEN_RE = /^mock-refresh\.[a-z0-9-]+\.[^.]+$/

/** 创建无敏感信息的 Mock Token */
const createMockToken = (prefix: string, contextId = 'unscoped'): string => {
  const id =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  return `${prefix}.${contextId}.${id}`
}

/** 为选择页生成短时一次性凭据，避免将未选公司的令牌写入会话。 */
const createLoginTicket = (username: string): string => {
  const now = Date.now()
  for (const [key, ticket] of pendingTickets) {
    if (ticket.expiresAt <= now) pendingTickets.delete(key)
  }
  if (pendingTickets.size >= MAX_PENDING_TICKETS) {
    const oldest = pendingTickets.keys().next().value
    if (oldest) pendingTickets.delete(oldest)
  }
  const key = createMockToken('mock-ticket')
  pendingTickets.set(key, {
    username,
    expiresAt: now + MOCK_TICKET_TTL_MS,
  })
  return key
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
      token: '',
      refreshToken: '',
      expiresIn: 0,
      loginTicket: createLoginTicket(username),
      availableContexts: getMockAuthContexts(username),
      user: {
        id: `mock-user:${username.toLowerCase()}`,
        username,
        displayName: username,
      },
    },
    msg: 'success',
  }
}

/** 激活已授予的公司上下文，签发与该上下文绑定的演示会话。 */
export const activateMockAuthContext = (
  request: ActivateAuthContextRequest
): LoginResponse => {
  const pending = pendingTickets.get(request.loginTicket)
  if (!pending || pending.expiresAt <= Date.now()) {
    pendingTickets.delete(request.loginTicket)
    throw new Error('登录验证已过期，请重新登录')
  }
  const contexts = getMockAuthContexts(pending.username)
  const activeContext = contexts.find(item => item.id === request.contextId)
  if (!activeContext) throw new Error('无权进入所选公司')
  pendingTickets.delete(request.loginTicket)
  return createMockContextSession(pending.username, activeContext, contexts)
}

/** 切换公司只接受当前账号已获授权的上下文。 */
export const switchMockAuthContext = (
  username: string,
  refreshToken: string,
  contextId: string
): LoginResponse => {
  if (!MOCK_REFRESH_TOKEN_RE.test(refreshToken)) {
    throw new Error('当前会话无效，请重新登录')
  }
  const contexts = getMockAuthContexts(username)
  const previousContextId = refreshToken.split('.')[1]
  if (!contexts.some(item => item.id === previousContextId)) {
    throw new Error('当前会话所属公司已失效，请重新登录')
  }
  const activeContext = contexts.find(item => item.id === contextId)
  if (!activeContext) throw new Error('无权进入所选公司')
  return createMockContextSession(username, activeContext, contexts)
}

/** 构建一个已选上下文的完整会话。 */
const createMockContextSession = (
  username: string,
  activeContext: AuthContext,
  availableContexts: AuthContext[]
): LoginResponse => ({
  code: '0',
  data: {
    token: createMockToken('mock-access', activeContext.id),
    refreshToken: createMockToken('mock-refresh', activeContext.id),
    expiresIn: MOCK_EXPIRES_IN,
    user: {
      id: `mock-user:${username.toLowerCase()}`,
      username,
      displayName: username,
    },
    activeContext,
    availableContexts,
  },
  msg: 'success',
})

/** 演示菜单根据已激活的角色裁剪；真实路由权限由后端返回。 */
export const isMockRouteAllowed = (
  context: AuthContext | null,
  path: string
): boolean => {
  if (path === '/') return true
  if (!context) return false
  const roles = new Set(context.roles.map(role => role.id))
  if (roles.has('platform-admin')) return true
  if (roles.has('operations-manager')) return path !== '/sys-manage'
  return ['/dashboard', '/account', '/about'].includes(path)
}

/** 构造刷新 Token Mock 响应 */
export const createMockRefreshResponse = (
  refreshToken: string
): RefreshTokenResponse => {
  if (!MOCK_REFRESH_TOKEN_RE.test(refreshToken)) {
    throw new Error('Mock refresh token 无效或已过期')
  }

  return {
    code: '0',
    data: {
      token: createMockToken('mock-access', refreshToken.split('.')[1]),
      refreshToken: createMockToken('mock-refresh', refreshToken.split('.')[1]),
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

/** Mock 公司激活 API。 */
export const activateMockAuthContextApi = (
  request: ActivateAuthContextRequest
): Promise<LoginResponse> =>
  withMockLatency(() => activateMockAuthContext(request))

/** Mock 公司切换 API。 */
export const switchMockAuthContextApi = (
  username: string,
  refreshToken: string,
  contextId: string
): Promise<LoginResponse> =>
  withMockLatency(() =>
    switchMockAuthContext(username, refreshToken, contextId)
  )

/** Mock Token 刷新 API */
export const refreshTokenMockApi = (
  refreshToken: string
): Promise<RefreshTokenResponse> =>
  withMockLatency(() => createMockRefreshResponse(refreshToken))

/** 公司预查询只返回展示信息，权限与凭据在认证完成后授予。 */
export const getLoginCompaniesMockApi = (
  username: string
): Promise<LoginCompaniesResponse> =>
  withMockLatency(() => ({
    code: '0',
    data: {
      companies: getMockAuthContexts(username).map(
        ({ id, isPrimary, tenantName, companyName }) => ({
          id,
          isPrimary,
          tenantName,
          companyName,
        })
      ),
    },
    msg: 'success',
  }))
