/*
 * @Description: 请求侧通用逻辑插件（headers、token）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { s_userStore } from '@/stores/user'
import { d_refreshTokenExpire } from '@/utils/d_auth'

/**
 * 处理 token 过期的共享 Promise
 */
let reLoginPromise: Promise<void> | null = null
let reLoginResolve: (() => void) | null = null
let reLoginReject: ((reason?: any) => void) | null = null

/**
 * 创建重新登录 Promise
 */
export function createReLoginPromise(): Promise<void> {
  if (!reLoginPromise) {
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

/**
 * 获取重新登录 Promise
 */
export function getReLoginPromise(): Promise<void> | null {
  return reLoginPromise
}

/**
 * 重新登录成功
 */
export function resolveReLogin(): void {
  if (reLoginResolve) {
    reLoginResolve()
  }
}

/**
 * 重新登录失败或取消
 */
export function rejectReLogin(reason?: any): void {
  if (reLoginReject) {
    reLoginReject(reason)
  }
}

/**
 * 请求拦截器：处理 token 和通用 headers
 */
function onRequest(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> {
  const { token } = s_userStore()

  if (!token) {
    return config
  }

  // 如果正在重新登录，等待完成
  if (reLoginPromise) {
    return reLoginPromise.then(() => {
      const { token: newToken } = s_userStore()
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`
      }
      return config
    })
  }

  // 添加 token 到请求头并续期
  d_refreshTokenExpire()
  config.headers.Authorization = `Bearer ${token}`

  return config
}

/**
 * 请求错误处理
 */
function onRequestError(error: any): Promise<never> {
  return Promise.reject(error)
}

/**
 * 设置请求插件
 */
export function setupRequestPlugin(instance: AxiosInstance): void {
  instance.interceptors.request.use(onRequest, onRequestError)
}
