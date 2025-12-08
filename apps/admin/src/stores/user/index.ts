/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-23 15:09:59
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-30 16:29:36
 * @FilePath: \Robot_Admin\src\stores\user\index.ts
 * @Description: 用户状态管理 - 统一管理用户登录状态、信息和相关操作
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import { defineStore } from 'pinia'
import { TOKEN, TIME_STAMP } from '@/constant'
import { setItem, getItem, removeItem } from '@/hooks/useStorage'
import router from '@/router'
import { d_setTimeStamp } from '@/utils/d_auth'
import { createDiscreteApi } from 'naive-ui/es'
import { s_appStore } from '@/stores/app/index'
const { notification } = createDiscreteApi(['notification'])

interface UserInfo {
  username?: string
  password?: string // 临时存储，仅用于重新登录
  [key: string]: unknown
}

export const s_userStore = defineStore('user', {
  state: () => ({
    token: getItem<string>(TOKEN) ?? '',
    userInfo: getItem<UserInfo>('userInfo') ?? ({} as UserInfo),
  }),

  getters: {
    hasUserInfo: state => Object.keys(state.userInfo).length > 0,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      setItem(TOKEN, token)
    },

    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      setItem('userInfo', userInfo)
    },

    async logout(isExpired = false) {
      try {
        // 1. 清除用户状态
        this.token = ''
        this.userInfo = {}

        // 2. 重置页面标题
        document.title = import.meta.env.VITE_APP_TITLE

        // 3. 只清除认证相关数据（保留用户配置如主题、语言等）
        removeItem(TOKEN)
        removeItem(TIME_STAMP)
        removeItem('userInfo')
        s_appStore().$reset()

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

    handleLoginSuccess(token: string) {
      this.setToken(token)
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
