/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\api\auth.contract.ts
 * @Description: 认证接口稳定契约，隔离 Mock 与真实后端传输实现
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { PostAuthLoginResponse } from './generated'
import type { DeploymentProfile } from '@/config/dataMode'

/** 认证运行模式 */
export type AuthMode = 'mock' | 'remote'

/** 登录表单最小契约 */
export interface LoginRequest {
  username?: string
  password?: string
  /** 用户在登录前选择的公司上下文；认证服务须再次校验成员关系。 */
  contextId?: string
  [key: string]: unknown
}

/** 一个可进入的企业工作上下文；角色只由认证服务授予，客户端不能自行提权。 */
export interface AuthContext {
  id: string
  /** 同一账号只能有一个主公司，登录前默认选中该公司。 */
  isPrimary: boolean
  tenantId: string
  tenantName: string
  companyId: string
  companyName: string
  roles: Array<{ id: string; name: string }>
}

/** 未登录时仅用于公司选择的展示信息，不携带角色或会话凭据。 */
export type LoginCompany = Pick<
  AuthContext,
  'id' | 'isPrimary' | 'tenantName' | 'companyName'
>

/** 登录前按账号查询已关联公司，未知或停用账号返回空清单。 */
export interface LoginCompaniesResponse {
  code: string | number
  data: { companies: LoginCompany[] }
  msg?: string
}

/** 认证服务必须明确标注唯一主公司，避免客户端猜测列表顺序。 */
export const getPrimaryAuthContext = (contexts: AuthContext[]): AuthContext => {
  const primary = contexts.filter(context => context.isPrimary === true)
  if (primary.length !== 1) {
    throw new Error(
      contexts.length
        ? '主公司配置异常，请联系企业管理员'
        : '当前账号未关联公司，请联系企业管理员'
    )
  }
  return primary[0]
}

/** 以认证后的授权清单验证选择；公司归属变化时不静默切换到其他公司。 */
export const resolveLoginAuthContext = (
  contexts: AuthContext[],
  selectedId?: string
): AuthContext => {
  const primary = getPrimaryAuthContext(contexts)
  if (!selectedId) return primary
  const selected = contexts.find(context => context.id === selectedId)
  if (!selected) throw new Error('所选公司已不可用，请重新选择公司')
  return selected
}

/** 身份验证完成后，服务端签发的短时上下文选择凭据。 */
export interface ActivateAuthContextRequest {
  loginTicket: string
  contextId: string
}

/** 登录数据契约 */
export type LoginData = PostAuthLoginResponse['data'] & {
  token: string
  refreshToken?: string
  expiresIn?: number
  loginTicket?: string
  availableContexts?: AuthContext[]
  activeContext?: AuthContext
  user?: {
    id: string
    username: string
    displayName: string
  }
}

/** 登录响应契约 */
export interface LoginResponse extends Omit<PostAuthLoginResponse, 'data'> {
  data: LoginData
}

/** Token 刷新响应契约 */
export interface RefreshTokenResponse {
  code: string | number
  data: {
    token: string
    refreshToken: string
    expiresIn: number
  }
  msg?: string
}

/**
 * @description 将环境变量收敛为受支持的认证模式；业务生产/预发缺省走远端并禁止 Mock。
 * @param mode 认证模式环境变量
 * @param appEnv 当前应用环境
 * @param deploymentProfile 部署用途，公开演示允许闭环 Mock
 * @returns 有效的认证模式
 */
export const resolveAuthMode = (
  mode?: string,
  appEnv?: string,
  deploymentProfile: DeploymentProfile = 'application'
): AuthMode => {
  const isRemoteEnvironment =
    (appEnv === 'production' || appEnv === 'staging') &&
    deploymentProfile !== 'demo'

  if (isRemoteEnvironment && mode === 'mock') {
    throw new Error(`${appEnv} 环境禁止使用 Mock 认证`)
  }
  if (mode === 'remote' || mode === 'mock') return mode
  return isRemoteEnvironment ? 'remote' : 'mock'
}
