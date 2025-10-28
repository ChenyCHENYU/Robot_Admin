/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 11:43:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-05 16:21:49
 * @FilePath: \Robot_Admin\src\axios\request.ts
 * @Description: axios 二次封装
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import axios, { type AxiosRequestConfig } from 'axios'
import { s_userStore } from '@/stores/user'
import { s_reLoginStore } from '@/stores/reLogin'
import { d_refreshTokenExpire, d_isCheckTimeout } from '@/utils/d_auth'
import { createDiscreteApi } from 'naive-ui/es'

const { VITE_API_BASE } = import.meta.env
const { message } = createDiscreteApi(['message'])

// 共享的重新登录 Promise，避免多次弹窗
let reLoginPromise: Promise<void> | null = null
let reLoginResolve: (() => void) | null = null
let reLoginReject: ((reason?: any) => void) | null = null

// 处理 token 过期 - 返回共享的 Promise
const handleTokenExpire = () => {
  if (!reLoginPromise) {
    const { userInfo } = s_userStore()
    const reLoginStore = s_reLoginStore()
    reLoginStore.show(userInfo?.username || '')

    // 创建共享的 Promise，在登录成功/失败后自动清除
    reLoginPromise = new Promise<void>((resolve, reject) => {
      reLoginResolve = resolve
      reLoginReject = reject
    }).finally(() => {
      reLoginPromise = null
      reLoginResolve = null
      reLoginReject = null
    })
  }
  return reLoginPromise
}

// 重新登录成功后的回调
export const onReLoginSuccess = () => {
  if (reLoginResolve) {
    reLoginResolve()
  }
}

// 重新登录取消后的回调
export const onReLoginCancel = () => {
  if (reLoginReject) {
    reLoginReject(new Error('重新登录已取消'))
  }
}

const service = axios.create({
  baseURL: VITE_API_BASE || '',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const { token } = s_userStore()
    if (token) {
      // 先检查是否已过期
      if (d_isCheckTimeout()) {
        // 等待重新登录完成后继续请求
        return new Promise((resolve, reject) => {
          handleTokenExpire()
            .then(() => {
              // 重新登录成功，更新 token 后继续请求
              const { token: newToken } = s_userStore()
              if (newToken && config.headers) {
                config.headers.Authorization = `Bearer ${newToken}`
              }
              resolve(config)
            })
            .catch(reject)
        })
      }
      // 未过期则续期
      d_refreshTokenExpire()
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    if (response.status === 200) return response
    message.error('调用接口失败')
    return Promise.reject(new Error(response.statusText || '接口请求失败'))
  },
  error => {
    // 处理 401 认证失败（后端 token 失效）
    if (error?.response?.status === 401) {
      // 等待重新登录
      return handleTokenExpire().then(() => {
        // 重新登录成功，重试请求
        const { token } = s_userStore()
        if (token && error.config?.headers) {
          error.config.headers.Authorization = `Bearer ${token}`
        }
        return service(error.config)
      })
    }

    message.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service

// ================= 优化后的快捷请求方式 =================

/**
 * GET 请求
 * @param url 请求地址
 * @param config 请求配置（可选），包含 params、headers 等
 */
export const getData = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await service.get(url, config)
  return res.data
}

/**
 * POST 请求
 * @param url 请求地址
 * @param data 请求体数据（可选）
 * @param config 请求配置（可选）
 */
export const postData = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await service.post(url, data, config)
  return res.data
}

/**
 * PUT 请求
 * @param url 请求地址
 * @param data 请求体数据（可选）
 * @param config 请求配置（可选）
 */
export const putData = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await service.put(url, data, config)
  return res.data
}

/**
 * DELETE 请求
 * @param url 请求地址
 * @param config 请求配置（可选）
 */
export const deleteData = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const res = await service.delete(url, config)
  return res.data
}

// ================= 使用示例 =================

// 1. 简单 GET 请求
// getData('/users')

// 2. 带参数的 GET 请求（推荐方式 - axios 会自动处理参数）
// getData('/users', { params: { page: 1, pageSize: 10 } })

// 3. 带请求头的 GET 请求
// getData('/users', {
//   params: { page: 1 },
//   headers: { 'X-Custom-Header': 'value' }
// })

// 4. POST 请求
// postData('/users', { name: '张三' })

// 5. POST 请求带额外配置
// postData('/users', { name: '张三' }, {
//   headers: { 'X-Custom-Header': 'value' }
// })
