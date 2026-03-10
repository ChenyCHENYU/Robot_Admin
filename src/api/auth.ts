import DynamicRouter from '@/assets/data/dynamicRouter.json'
import { postData } from '@robot-admin/request-core'
import type { PostAuthLoginResponse } from './generated'
import type { DynamicRoute } from '@/router/dynamicRouter'

export type LoginResponse = PostAuthLoginResponse

/** Token 刷新响应类型 */
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
 * * @description: 用户登录接口
 * ? @param {object} data 登录表单数据，包含用户名和密码
 * ! @return {Promise<PostAuthLoginResponse>} 登录响应数据，包含用户信息和token
 */
export const loginApi = (data: Record<string, any>) =>
  postData<PostAuthLoginResponse>('/auth/login', data)

/**
 * * @description: 刷新 Token 接口（双 Token 无感刷新）
 * ? @param {string} _refreshToken 刷新令牌
 * ! @return {Promise<RefreshTokenResponse>} 新的 token 和 refreshToken
 * TODO: 对接真实后端后替换为 postData<RefreshTokenResponse>('/auth/refresh-token', { refreshToken })
 */
export const refreshTokenApi = (_refreshToken: string): Promise<RefreshTokenResponse> => {
  // Mock 实现：模拟返回新 token，保持登录状态不中断
  return Promise.resolve({
    code: '0',
    data: {
      token: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresIn: 7200, // 2小时
    },
    msg: 'success',
  })
}

/**
 * * @description: 获取用户菜单权限列表
 * ! @return {any} 动态菜单路由配置数据
 */
export const getAuthMenuListApi = (): {
  code: string
  data: DynamicRoute[]
  msg: string
} => DynamicRouter as any
