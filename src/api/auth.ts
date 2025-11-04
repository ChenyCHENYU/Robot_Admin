import { postData } from '@/axios/request'
import DynamicRouter from '@/assets/data/dynamicRouter.json'
import {
  postAuthLogin,
  type PostAuthLoginData,
  type PostAuthLoginResponse,
} from './generated'

export type LoginResponse = PostAuthLoginResponse

/**
 * * @description: 用户登录接口 (旧版本 - 保留用于对比)
 * ? @param {NonNullable<PostAuthLoginData['body']>} data 登录表单数据，包含用户名和密码
 * ! @return {Promise<PostAuthLoginResponse>} 登录响应数据，包含用户信息和token
 */
export const loginApi_OLD = (data: NonNullable<PostAuthLoginData['body']>) =>
  postData<PostAuthLoginResponse>('/auth/login', data)

/**
 * * @description: 用户登录接口 (🆕 SDK 版本 - 保持旧接口兼容)
 * ? @param {object} data 登录表单数据，包含用户名和密码
 * ! @return {Promise<PostAuthLoginResponse>} 登录响应数据，包含用户信息和token
 */
export const loginApi = async (data: {
  username: string
  password: string
}) => {
  const { data: result, error } = await postAuthLogin({
    body: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 如果有错误，抛出异常保持旧版行为
  if (error) {
    throw error
  }

  // 返回数据，保持旧版接口兼容
  return result
}

/**
 * * @description: 获取用户菜单权限列表
 * ! @return {any} 动态菜单路由配置数据
 */
export const getAuthMenuListApi = () => DynamicRouter
