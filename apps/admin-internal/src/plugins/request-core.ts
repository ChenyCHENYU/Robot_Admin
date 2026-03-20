/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-08 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-08 00:14:05
 * @FilePath: \Robot_Admin\src\plugins\request-core.ts
 * @Description: Request Core 插件 - 统一请求核心库集成
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import type { InternalAxiosRequestConfig } from 'axios'
import { createRequestCore, onReLoginSuccess } from '@robot-admin/request-core'
import { s_userStore } from '@/stores/user'
import { s_reLoginStore } from '@/stores/reLogin'
import { refreshTokenApi } from '@/api/auth'
import { message } from '@/plugins/discrete'
const { VITE_API_BASE } = import.meta.env

/** Token 刷新状态管理（防止并发刷新） */
let isRefreshing = false
let pendingRequests: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

/**
 * * @description: 执行 Token 刷新（并发安全）
 * ! @return {Promise<string>} 新的 access token
 */
async function doRefreshToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({ resolve, reject })
    })
  }

  isRefreshing = true
  const userStore = s_userStore()

  try {
    const response = await refreshTokenApi(userStore.refreshToken)
    // response 可能是 RefreshTokenResponse（mock）或 axios response.data（真实接口）
    const tokenData = 'data' in response ? response.data : response
    const { token, refreshToken, expiresIn } = tokenData as {
      token: string
      refreshToken: string
      expiresIn: number
    }
    userStore.handleLoginSuccess(token, refreshToken, expiresIn)

    // 释放所有等待中的请求
    pendingRequests.forEach(({ resolve }) => resolve(token))
    return token
  } catch (error) {
    pendingRequests.forEach(({ reject }) =>
      reject(error instanceof Error ? error : new Error('刷新 Token 失败'))
    )
    throw error
  } finally {
    isRefreshing = false
    pendingRequests = []
  }
}

/**
 * 设置 Request Core 插件
 *
 * @description
 * 初始化统一请求核心库，配置 axios 拦截器和插件体系
 *
 * @param app Vue 应用实例
 */
export function setupRequestCore(app: App) {
  const requestCore = createRequestCore({
    // Axios 基础配置
    request: {
      baseURL: VITE_API_BASE || '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    },

    // 🎯 成功状态码配置（支持多种后端约定）
    // successCodes: [200, 0, '200', '0'],         // 默认值
    // successCodes: [1, '1', 'success'],          // 示例：自定义成功码
    // successCodes: [0],                          // 示例：仅支持数字 0

    // 🎯 字段别名配置（适配不同后端响应格式）
    // fieldAliases: {
    //   data: ['data', 'result', 'payload'],      // 数据层字段
    //   list: ['list', 'items', 'records'],       // 列表字段
    //   total: ['total', 'totalCount', 'count'],  // 总数字段
    // },

    // 拦截器配置
    interceptors: {
      // ==================== 请求拦截器 ====================
      request: async (config: InternalAxiosRequestConfig) => {
        const userStore = s_userStore()
        const { token } = userStore

        // Token 无感刷新：即将过期时自动换取新 token
        if (
          token &&
          userStore.refreshToken &&
          userStore.isTokenExpiringSoon() &&
          !config.url?.includes('/auth/refresh-token')
        ) {
          try {
            const newToken = await doRefreshToken()
            config.headers!.Authorization = `Bearer ${newToken}`
            return config
          } catch {
            // 刷新失败，继续使用旧 token，后端返回 401 时再走重新登录
          }
        }

        // 注入 token
        if (token) {
          config.headers!.Authorization = `Bearer ${token}`
        }

        return config
      },

      // ==================== 响应拦截器 ====================
      response: response => {
        const { code, message: msg } = response.data

        // 业务码判断（支持多种成功码格式）
        const isSuccess =
          code === 200 || code === 0 || code === '200' || code === '0'

        if (!isSuccess) {
          message.error(msg || '请求失败')
          return Promise.reject(new Error(msg || '请求失败'))
        }

        return response
      },

      // ==================== 响应错误拦截器 ====================
      responseError: async error => {
        // 处理 401 未授权
        if (error.response?.status === 401) {
          const userStore = s_userStore()

          // 尝试用 refresh_token 静默刷新
          if (
            userStore.refreshToken &&
            !error.config?.url?.includes('/auth/refresh-token')
          ) {
            try {
              const newToken = await doRefreshToken()
              // 用新 token 重发原始请求
              error.config!.headers!.Authorization = `Bearer ${newToken}`
              const { default: axios } = await import('axios')
              return axios(error.config!)
            } catch {
              // refresh token 也过期了，走重新登录流程
            }
          }

          // refresh token 不存在或刷新失败，显示重新登录弹窗
          const reLoginStore = s_reLoginStore()
          reLoginStore.show(userStore.userInfo?.username || '')

          // 等待用户重新登录
          try {
            await new Promise<void>((resolve, reject) => {
              // 监听重新登录成功
              const unwatch = watch(
                () => reLoginStore.visible,
                visible => {
                  if (!visible) {
                    unwatch()
                    const userStore = s_userStore()
                    if (userStore.token) {
                      // 通知 Request Core 重新登录成功
                      onReLoginSuccess()
                      resolve()
                    } else {
                      reject(new Error('重新登录失败'))
                    }
                  }
                }
              )
            })
          } catch (err) {
            message.error('重新登录失败，请重新登录')
            return Promise.reject(err)
          }
        }

        // 其他错误处理
        const errorMessage =
          error.response?.data?.message || error.message || '请求失败'
        message.error(errorMessage)

        return Promise.reject(error)
      },
    },
  })

  // 注册 Vue 插件（使用类型断言绕过 Vue 版本差异）
  ;(requestCore as any).install(app)
}
