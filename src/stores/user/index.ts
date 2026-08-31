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
  id?: string
  displayName?: string
  [key: string]: unknown
}

const USER_INFO_KEY = 'userInfo'
const AUTH_STORAGE_KEYS = [
  TOKEN,
  REFRESH_TOKEN,
  TOKEN_EXPIRES_IN,
  TIME_STAMP,
  USER_INFO_KEY,
] as const

/** 安全反序列化存储值 */
function parseStorageValue<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return raw as unknown as T
  }
}

/**
 * 读取会话凭据，并一次性迁移、删除历史 localStorage 中的认证信息。
 */
function readAuthStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const sessionValue = sessionStorage.getItem(key)
  const legacyValue = localStorage.getItem(key)
  if (sessionValue !== null) {
    if (legacyValue !== null) localStorage.removeItem(key)
    return parseStorageValue(sessionValue, fallback)
  }
  if (legacyValue === null) return fallback
  sessionStorage.setItem(key, legacyValue)
  localStorage.removeItem(key)
  return parseStorageValue(legacyValue, fallback)
}

/** 清除禁止持久化的密码字段 */
export function sanitizeUserInfo(userInfo: UserInfo): UserInfo {
  const sanitized = { ...userInfo }
  delete sanitized.password
  delete sanitized.confirmPassword
  return sanitized
}

/** 写入仅在当前浏览器标签页有效的认证会话 */
function writeAuthStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  if (value === '' || value === 0 || value === undefined) {
    sessionStorage.removeItem(key)
    return
  }
  sessionStorage.setItem(key, JSON.stringify(value))
}

/** 读取并立即覆盖清洗后的用户信息，确保迁移数据中不残留密码。 */
function readSanitizedUserInfo(): UserInfo {
  const sanitized = sanitizeUserInfo(
    readAuthStorage<UserInfo>(USER_INFO_KEY, {})
  )
  writeAuthStorage(USER_INFO_KEY, sanitized)
  return sanitized
}

export const s_userStore = defineStore('user', {
  state: () => ({
    token: readAuthStorage<string>(TOKEN, ''),
    refreshToken: readAuthStorage<string>(REFRESH_TOKEN, ''),
    tokenExpiresAt: readAuthStorage<number>(TOKEN_EXPIRES_IN, 0),
    userInfo: readSanitizedUserInfo(),
  }),

  getters: {
    hasUserInfo: state => Object.keys(state.userInfo).length > 0,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      writeAuthStorage(TOKEN, token)
    },

    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken
      writeAuthStorage(REFRESH_TOKEN, refreshToken)
    },

    setTokenExpiresAt(expiresIn: number) {
      const expiresAt = Date.now() + expiresIn * 1000
      this.tokenExpiresAt = expiresAt
      writeAuthStorage(TOKEN_EXPIRES_IN, expiresAt)
    },

    /** 判断 token 是否即将过期（提前 5 分钟） */
    isTokenExpiringSoon(): boolean {
      if (!this.tokenExpiresAt) return false
      return Date.now() > this.tokenExpiresAt - 5 * 60 * 1000
    },

    setUserInfo(userInfo: UserInfo) {
      const sanitized = sanitizeUserInfo(userInfo)
      this.userInfo = sanitized
      writeAuthStorage(USER_INFO_KEY, sanitized)
    },

    /** 同步清除内存、会话存储和历史本地存储中的认证数据 */
    clearSession() {
      this.token = ''
      this.refreshToken = ''
      this.tokenExpiresAt = 0
      this.userInfo = {}

      if (typeof window === 'undefined') return
      for (const key of AUTH_STORAGE_KEYS) {
        sessionStorage.removeItem(key)
        localStorage.removeItem(key)
      }
      localStorage.removeItem('__tags_view_list__')
    },

    async logout(isExpired = false) {
      try {
        // 1. 清除用户状态
        this.clearSession()

        // 2. 重置页面标题
        document.title = import.meta.env.VITE_APP_TITLE

        // 3. 清理动态路由和权限快照（保留主题、语言等用户偏好）
        const [{ clearExistingRoutes }, { s_permissionStore }] =
          await Promise.all([
            import('@/router/dynamicRouter'),
            import('@/stores/permission'),
          ])
        clearExistingRoutes()
        s_permissionStore().resetPermissions()

        // 4. 跳转登录页
        router.replace('/login')

        // 5. 根据退出原因显示不同提示
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
      this.setRefreshToken(refreshToken || '')
      if (expiresIn && expiresIn > 0) this.setTokenExpiresAt(expiresIn)
      else {
        this.tokenExpiresAt = 0
        writeAuthStorage(TOKEN_EXPIRES_IN, 0)
      }
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
