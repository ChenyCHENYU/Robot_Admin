/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\api\auth.ts
 * @Description: 认证与动态菜单接口，支持 Mock 和远端模式切换
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import DynamicRouter from '@/assets/data/dynamicRouter.json'
import { getData, postData } from '@robot-admin/request-core'
import type { DynamicRoute } from '@/router/dynamicRouter'
import {
  resolveAuthMode,
  type LoginRequest,
  type LoginResponse,
  type RefreshTokenResponse,
} from './auth.contract'
import { loginMockApi, refreshTokenMockApi } from './auth.mock'

export type { LoginResponse, RefreshTokenResponse } from './auth.contract'

const AUTH_MODE = resolveAuthMode(
  import.meta.env.VITE_AUTH_MODE,
  import.meta.env.VITE_APP_ENV
)

/** 菜单接口响应契约 */
export interface AuthMenuResponse {
  code: string | number
  data: DynamicRoute[]
  msg?: string
  message?: string
}

/**
 * * @description: 用户登录接口
 * ? @param {object} data 登录表单数据，包含用户名和密码
 * ! @return {Promise<PostAuthLoginResponse>} 登录响应数据，包含用户信息和token
 */
export const loginApi = (data: LoginRequest): Promise<LoginResponse> =>
  AUTH_MODE === 'mock'
    ? loginMockApi(data)
    : postData<LoginResponse>('/auth/login', data)

/**
 * * @description: 刷新 Token 接口（双 Token 无感刷新）
 * ? @param {string} _refreshToken 刷新令牌
 * ! @return {Promise<RefreshTokenResponse>} 新的 token 和 refreshToken
 * TODO: 对接真实后端后替换为 postData<RefreshTokenResponse>('/auth/refresh-token', { refreshToken })
 */
export const refreshTokenApi = (
  refreshToken: string
): Promise<RefreshTokenResponse> =>
  AUTH_MODE === 'mock'
    ? refreshTokenMockApi(refreshToken)
    : postData<RefreshTokenResponse>('/auth/refresh-token', { refreshToken })

/** 当前认证模式，供诊断页和自动化测试读取 */
export const getAuthMode = (): typeof AUTH_MODE => AUTH_MODE

/**
 * * @description: 获取用户菜单权限列表
 * ! @return {any} 动态菜单路由配置数据
 */
export const getAuthMenuListApi = (): Promise<AuthMenuResponse> =>
  AUTH_MODE === 'mock'
    ? Promise.resolve(DynamicRouter as AuthMenuResponse)
    : getData<AuthMenuResponse>('/auth/menu-list')
