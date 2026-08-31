/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-08 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-08-31
 * @FilePath: \Robot_Admin\src\plugins\request-core.ts
 * @Description: Request Core 插件 - 统一请求、Token 刷新与 401 恢复
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import {
  createRequestCore,
  getReLoginPromise,
  waitForReLogin,
} from '@robot-admin/request-core'
import { s_userStore } from '@/stores/user'
import { s_reLoginStore } from '@/stores/reLogin'
import { refreshTokenApi } from '@/api/auth'
import { message } from '@/plugins/discrete'
import {
  BUSINESS_SUCCESS_CODES,
  getBusinessErrorMessage,
  getRequestErrorMessage,
} from '@/utils/d_request'

const { VITE_API_BASE } = import.meta.env

let isRefreshing = false
let pendingRequests: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  __handling401?: boolean
  __reLoginRetried?: boolean
}

type RetryRequest = (config: RetriableRequestConfig) => Promise<AxiosResponse>

const toError = (error: unknown, fallback: string): Error =>
  error instanceof Error ? error : new Error(fallback)

const isAuthenticationRequest = (url?: string): boolean =>
  Boolean(url?.includes('/auth/login') || url?.includes('/auth/refresh-token'))

/**
 * @description 执行并发安全的 Token 刷新，所有等待请求共享同一次结果。
 * @returns 新 access token
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
    const { token, refreshToken, expiresIn } = response.data
    userStore.handleLoginSuccess(token, refreshToken, expiresIn)
    for (const pending of pendingRequests) pending.resolve(token)
    return token
  } catch (error) {
    const refreshError = toError(error, '刷新 Token 失败')
    for (const pending of pendingRequests) pending.reject(refreshError)
    throw refreshError
  } finally {
    isRefreshing = false
    pendingRequests = []
  }
}

/**
 * @description 等待用户完成重新登录；共享 Promise 防止多个 401 重复弹窗。
 * @returns 重新登录后的 access token
 */
async function waitForUserReLogin(): Promise<string> {
  const shouldOpenDialog = !getReLoginPromise()
  const waiting = waitForReLogin()
  const userStore = s_userStore()

  if (shouldOpenDialog) {
    s_reLoginStore().show(userStore.userInfo.username || '')
  }

  await waiting
  if (!userStore.token) throw new Error('重新登录未返回有效 Token')
  return userStore.token
}

const canRecoverUnauthorized = (
  error: AxiosError,
  config?: RetriableRequestConfig
): config is RetriableRequestConfig =>
  error.response?.status === 401 &&
  Boolean(config) &&
  !isAuthenticationRequest(config?.url)

const rejectRequestError = (
  error: AxiosError,
  config?: RetriableRequestConfig
): Promise<never> => {
  if (!isAuthenticationRequest(config?.url)) {
    message.error(getRequestErrorMessage(error))
  }
  return Promise.reject(error)
}

const recoverUnauthorized = async (
  config: RetriableRequestConfig,
  retry: RetryRequest
): Promise<AxiosResponse> => {
  const userStore = s_userStore()

  if (userStore.refreshToken && !config.__handling401) {
    try {
      config.__handling401 = true
      config.headers.Authorization = `Bearer ${await doRefreshToken()}`
      return retry(config)
    } catch {
      // refresh token 已失效，继续进入显式重新登录。
    }
  }

  try {
    config.__reLoginRetried = true
    config.headers.Authorization = `Bearer ${await waitForUserReLogin()}`
    return retry(config)
  } catch (reLoginError) {
    message.error('重新登录失败，请重新登录')
    return Promise.reject(reLoginError)
  }
}

/**
 * @description 安装统一请求核心、业务响应校验与认证恢复拦截器。
 * @param app Vue 应用实例
 * @returns void
 */
export function setupRequestCore(app: App): void {
  const requestCore = createRequestCore({
    request: {
      baseURL: VITE_API_BASE || '',
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    },
    successCodes: [...BUSINESS_SUCCESS_CODES],
    interceptors: {
      request: async (config: InternalAxiosRequestConfig) => {
        const userStore = s_userStore()
        const { token } = userStore

        if (
          token &&
          userStore.refreshToken &&
          userStore.isTokenExpiringSoon() &&
          !isAuthenticationRequest(config.url)
        ) {
          try {
            config.headers.Authorization = `Bearer ${await doRefreshToken()}`
            return config
          } catch {
            // 保留旧 Token，让服务端 401 进入统一重新登录流程。
          }
        }

        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
      },

      response: (response: AxiosResponse) => {
        const businessError = getBusinessErrorMessage(response.data)
        if (!businessError) return response

        message.error(businessError)
        return Promise.reject(new Error(businessError))
      },

      responseError: async (error: AxiosError) => {
        const originalConfig = error.config as
          | RetriableRequestConfig
          | undefined

        if (!canRecoverUnauthorized(error, originalConfig)) {
          return rejectRequestError(error, originalConfig)
        }

        if (originalConfig.__reLoginRetried) return Promise.reject(error)
        return recoverUnauthorized(originalConfig, config =>
          requestCore.axiosInstance.request(config)
        )
      },
    },
  })

  app.use(requestCore)
}
