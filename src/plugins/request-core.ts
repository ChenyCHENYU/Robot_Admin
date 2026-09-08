/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-08 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-09-08
 * @FilePath: \Robot_Admin\src\plugins\request-core.ts
 * @Description: Request Core 插件 - 统一请求、Token 刷新与 401 恢复
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import {
  createRequestClient,
  waitForReLogin,
} from '@robot-admin/request-core/axios'
import { createRequestPlugin } from '@robot-admin/request-core/vue'
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

const isAuthenticationRequest = (url?: string): boolean =>
  Boolean(url?.includes('/auth/login') || url?.includes('/auth/refresh-token'))

/** 应用唯一请求 Client；旧快捷方法通过 setAsDefault 平滑复用该实例。 */
export const request = createRequestClient({
  request: {
    baseURL: VITE_API_BASE || '',
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
  },
  setAsDefault: true,
  successCodes: [...BUSINESS_SUCCESS_CODES],
  auth: {
    getToken: () => s_userStore().token,
    shouldRefresh: () => {
      const userStore = s_userStore()
      return Boolean(
        userStore.token &&
        userStore.refreshToken &&
        userStore.isTokenExpiringSoon()
      )
    },
    refresh: async () => {
      const userStore = s_userStore()
      if (!userStore.refreshToken) return null

      const response = await refreshTokenApi(userStore.refreshToken)
      const { token, refreshToken, expiresIn } = response.data
      userStore.handleLoginSuccess(token, refreshToken, expiresIn)
      return token
    },
    reauthenticate: async () => {
      const userStore = s_userStore()
      const waiting = waitForReLogin(request.axios)
      s_reLoginStore().show(userStore.userInfo.username || '')
      await waiting

      if (!userStore.token) throw new Error('重新登录未返回有效 Token')
      return userStore.token
    },
    isAuthRequest: config => isAuthenticationRequest(config.url),
  },
  interceptors: {
    response: response => {
      const businessError = getBusinessErrorMessage(response.data)
      if (!businessError) return response

      message.error(businessError)
      return Promise.reject(new Error(businessError))
    },
    responseError: error => {
      if (!isAuthenticationRequest(error.config?.url)) {
        message.error(getRequestErrorMessage(error))
      }
      return Promise.reject(error)
    },
  },
})

/**
 * @description 安装统一请求核心、业务响应校验与认证恢复拦截器。
 * @param app Vue 应用实例
 * @returns void
 */
export function setupRequestCore(app: App): void {
  app.use(createRequestPlugin(request))
}
