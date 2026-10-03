/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-02
 * @FilePath: \Robot_Admin\src\utils\d_authSession.ts
 * @Description: 企业上下文会话提交边界，集中清理旧公司权限与路由
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { getAuthMode, type AuthContext, type LoginResponse } from '@/api/auth'
import { clearExistingRoutes } from '@/router/dynamicRouter'
import { s_userStore } from '@/stores/user'

/** 在写入前验证会话，避免切换失败时破坏旧公司状态。 */
const validateAuthSession = (
  response: LoginResponse,
  fallbackUsername: string
): {
  user: { username?: string }
  context?: AuthContext
  contexts: AuthContext[]
} => {
  const { token } = response.data
  const user =
    response.data.user ??
    (fallbackUsername ? { username: fallbackUsername } : null)
  const context = response.data.activeContext
  const contexts = response.data.availableContexts ?? []

  if (!token || !user) throw new Error('登录会话不完整，请重新登录')
  if (getAuthMode() === 'mock' && !context) {
    throw new Error('请先选择有权访问的公司')
  }
  if (context && !contexts.some(item => item.id === context.id)) {
    throw new Error('当前公司不在授权范围内')
  }
  return { user, context, contexts }
}

/** 验证完整会话并原子替换前端身份上下文；真实授权始终由服务端负责。 */
export const applyAuthSession = (
  response: LoginResponse,
  fallbackUsername = ''
): string => {
  const { token, refreshToken, expiresIn } = response.data
  const { user, context, contexts } = validateAuthSession(
    response,
    fallbackUsername
  )

  const userStore = s_userStore()
  userStore.clearSession()
  clearExistingRoutes()
  userStore.handleLoginSuccess(token, refreshToken, expiresIn)
  userStore.setUserInfo(user)
  if (context) userStore.setAuthContexts(contexts, context)
  return token
}
