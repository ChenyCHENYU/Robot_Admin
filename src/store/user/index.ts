/*
 * @Author: ChenYu
 * @Date: 2022-04-04 01:23:50
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 21:34:08
 * @FilePath: \Robot_Admin\src\store\user\index.ts
 * @Description: 用户仓库
 * Copyright (c) ${2022} by ChenYu/天智AgileTeam, All Rights Reserved.
 */

import { getUserInfo, login } from '@/api/sys'
import { TOKEN } from '@/constant'
import router from '@/router'
import { d_setTimeStamp } from '@/utils/d_auth'
import md5 from 'md5'
import { getItem, removeAllItem, setItem } from '_hooks/useStorage'
import { d_ElNotiy } from '_utils/d_tips'
import { s_appStore } from '../app/index'

/** TODO:
 *  1. 定义并导出容器
 *   参数1： 容器的 ID , 必须唯一， 将来 Pinia 会把所有的容器挂载到跟容器
 *   参数2： 选项对象
 *   返回值： 一个函数, 调用得到容器实例
 */

export const s_userStore = defineStore('user', {
  /**
   *  类似于组件的data, 用来存储全局状态
   *  1. 必须是函数，这样是为了在服务端渲染的时候避免交叉请求导致的数据状态渲染
   *  2. 必须是箭头函数, 这是为了更好的 TS 类型推导
   */
  state: () => {
    return {
      token: getItem(TOKEN) || '',
      userInfo: {},
    }
  },

  /**
   *  类似于组件的computed, 用来封装计算属性, 有缓存的功能
   */
  getters: {
    // 接受一个可选参数 state 即 当前ID为user的Store实例  也可以用this 拿到 上面的state的状态值

    hasUserInfo(): boolean {
      // FIXME: 逻辑不健壮，先这么滴吧，后续修改
      return JSON.stringify(this.userInfo) !== '{}'
    },
  },

  /**
   * 类似于组件的 methods 封装业务逻辑, 修改state
   * 通过 this  拿到上面 state的状态值
   */
  actions: {
    /**
     * @description: TODO: 登录
     * @param {*} userInfo 输入的账号密码
     * @return {*}
     */
    async getloginInfo(userInfo) {
      const { username, password } = userInfo
      try {
        const res = await login({ username, password: md5(password) })
        const { code } = res
        if (code === '0') {
          this.setToken(res.token)
          d_ElNotiy('登录成功')
          router.push('/home')
          // 保存登录时间
          d_setTimeStamp()
        }
      } catch {}
    },

    /**
     * @description: TODO: localStorage存储token
     */
    setToken(token: string) {
      this.token = token
      setItem(TOKEN, token)
    },

    /**
     * @description: TODO: 获取用户信息
     */
    async getUserInfo() {
      const res = await getUserInfo()
      const { code, data } = res
      if (code === '0') {
        this.userInfo = data
      }
    },

    /**
     * @description: TODO: 退出登录
     */
    logout() {
      const appStore = s_appStore()
      this.setToken('')
      this.$patch(state => (state.userInfo = {}))
      removeAllItem()
      appStore.tagsViewList = []
      // FIXME: 后续需要清理掉权限相关配置
      router.push('/login')
    },
  },
})
