import { defineStore } from 'pinia'

interface UserInfo {
  id?: string
  username?: string
  nickname?: string
  avatar?: string
  email?: string
}

interface Theme {
  mode: 'light' | 'dark'
  isDark: boolean
}

interface AppState {
  token: string
  userInfo: UserInfo
  theme: Theme
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    token: '',
    userInfo: {},
    theme: {
      mode: 'light',
      isDark: false,
    },
  }),

  actions: {
    /**
     * 设置token
     */
    setToken(token: string) {
      this.token = token
    },

    /**
     * 设置用户信息
     */
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },

    /**
     * 设置主题
     */
    setTheme(theme: Partial<Theme>) {
      this.theme = {
        ...this.theme,
        ...theme,
      }
    },

    /**
     * 清除认证信息
     */
    clearAuth() {
      this.token = ''
      this.userInfo = {}
    },
  },
})
