/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\api\auth.contract.ts
 * @Description: 认证接口稳定契约，隔离 Mock 与真实后端传输实现
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { PostAuthLoginResponse } from './generated'

/** 认证运行模式 */
export type AuthMode = 'mock' | 'remote'

/** 登录表单最小契约 */
export interface LoginRequest {
  username?: string
  password?: string
  [key: string]: unknown
}

/** 登录数据契约 */
export type LoginData = PostAuthLoginResponse['data'] & {
  token: string
  refreshToken?: string
  expiresIn?: number
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
 * @description 将环境变量收敛为受支持的认证模式；生产/预发缺省走远端并禁止 Mock。
 * @param mode 认证模式环境变量
 * @param appEnv 当前应用环境
 * @returns 有效的认证模式
 */
export const resolveAuthMode = (mode?: string, appEnv?: string): AuthMode => {
  const isRemoteEnvironment = appEnv === 'production' || appEnv === 'staging'

  if (isRemoteEnvironment && mode === 'mock') {
    throw new Error(`${appEnv} 环境禁止使用 Mock 认证`)
  }
  if (mode === 'remote' || mode === 'mock') return mode
  return isRemoteEnvironment ? 'remote' : 'mock'
}
