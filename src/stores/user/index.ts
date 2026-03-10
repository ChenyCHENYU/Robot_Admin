/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-23 15:09:59
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-10
 * @FilePath: \Robot_Admin\src\stores\user\index.ts
 * @Description: 用户状态管理 — 登录状态、用户信息、安全退出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { defineStore } from 'pinia'
import { TOKEN, TIME_STAMP, REFRESH_TOKEN, TOKEN_EXPIRES_IN } from '@/constant'
import router from '@/router'
import { d_setTimeStamp } from '@/utils/d_auth'
import { notification } from '@/plugins/discrete'

interface UserInfo {
  username?: string
  [key: string]: unknown
}

/** 安全读取 localStorage 并反序列化 */
function readStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return raw as unknown as T
  }
}

export const s_userStore = defineStore('user', {
  state: () => ({
    token: readStorage<string>(TOKEN, ''),
    refreshToken: readStorage<string>(REFRESH_TOKEN, ''),
    tokenExpiresAt: readStorage<number>(TOKEN_EXPIRES_IN, 0),
    userInfo: readStorage<UserInfo>('userInfo', {} as UserInfo),
  }),

  getters: {
    hasUserInfo: state => Object.keys(state.userInfo).length > 0,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem(TOKEN, JSON.stringify(token))
    },

    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken
      localStorage.setItem(REFRESH_TOKEN, JSON.stringify(refreshToken))
    },

    setTokenExpiresAt(expiresIn: number) {
      const expiresAt = Date.now() + expiresIn * 1000
      this.tokenExpiresAt = expiresAt
      localStorage.setItem(TOKEN_EXPIRES_IN, JSON.stringify(expiresAt))
    },

    /** 判断 token 是否即将过期（提前 5 分钟） */
    isTokenExpiringSoon(): boolean {
      if (!this.tokenExpiresAt) return false
      return Date.now() > this.tokenExpiresAt - 5 * 60 * 1000
    },

    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },

    async logout(isExpired = false) {
      try {
        // 1. 清除用户状态
        this.token = ''
        this.userInfo = {}

        // 2. 重置页面标题
        document.title = import.meta.env.VITE_APP_TITLE

        // 3. 只清除认证相关数据（保留用户配置如主题、语言等）
        localStorage.removeItem(TOKEN)
        localStorage.removeItem(REFRESH_TOKEN)
        localStorage.removeItem(TOKEN_EXPIRES_IN)
        localStorage.removeItem(TIME_STAMP)
        localStorage.removeItem('userInfo')
        localStorage.removeItem('__tags_view_list__')

        // 4. 清理动态路由
        const { clearExistingRoutes } = await import('@/router/dynamicRouter')
        clearExistingRoutes()

        // 5. 跳转登录页
        router.replace('/login')

        // 6. 根据退出原因显示不同提示
        if (isExpired) {
          notification.warning({
            content: '登录已过期，请重新登录',
            duration: 2500,
          })
        } else {
          notification.success({
            content: '已退出登录',
            duration: 2000,
          })
        }
      } catch (error) {
        console.error('退出登录失败:', error)
        router.replace('/login')
      }
    },

    handleLoginSuccess(
      token: string,
      refreshToken?: string,
      expiresIn?: number
    ) {
      this.setToken(token)
      if (refreshToken) this.setRefreshToken(refreshToken)
      if (expiresIn) this.setTokenExpiresAt(expiresIn)
      d_setTimeStamp()
    },

    handleLoginError(error: unknown) {
      notification.error({
        content: `登录失败: ${error instanceof Error ? error.message : String(error) || '检查错误'}`,
        duration: 3000,
      })
    },
  },
})
