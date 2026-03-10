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
import { createRequestCore, onReLoginSuccess } from '@robot-admin/request-core'
import { s_userStore } from '@/stores/user'
import { s_reLoginStore } from '@/stores/reLogin'
import { message } from '@/plugins/discrete'
const { VITE_API_BASE } = import.meta.env

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
      request: config => {
        const userStore = s_userStore()
        const { token } = userStore

        // 注入 token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
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
          const reLoginStore = s_reLoginStore()
          const userStore = s_userStore()

          // 显示重新登录弹窗
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
