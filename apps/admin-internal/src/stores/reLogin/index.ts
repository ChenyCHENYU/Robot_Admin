/*
 * @Description: 重新登录弹框状态管理
 * @Author: ChenYu
 * @Date: 2025-10-28
 */

import { defineStore } from 'pinia'

export const s_reLoginStore = defineStore('reLogin', {
  state: () => ({
    visible: false,
    username: '',
  }),

  actions: {
    show(username: string) {
      this.username = username
      this.visible = true
    },

    hide() {
      this.visible = false
    },
  },
})
