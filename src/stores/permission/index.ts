/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 11:13:19
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-05-06 15:14:13
 * @FilePath: \Robot_Admin\src\stores\permission\index.ts
 * @Description: 权限相关 store
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { getAuthMenuListApi } from '@/api/auth'
import { getKeepAliveRouterName, getShowMenuList } from '@/utils/d_route'
import type { DynamicRoute } from '@/router/dynamicRouter'

export const s_permissionStore = defineStore('permission', {
  state: () => {
    return {
      authButtonList: {},
      // menuList 作为动态路由，不会做持久化存储
      authMenuList: [] as DynamicRoute[],
    }
  },
  getters: {
    // 按钮权限列表
    authButtonListGet: (state: any) => state.authButtonList,
    // 后端返回的菜单列表
    authMenuListGet: (state: any) => state.authMenuList,
    // 后端返回的菜单列表 ==> 左侧菜单栏渲染，需要去除 isHide == true
    showMenuListGet: (state: any) => getShowMenuList(state.authMenuList),
    // 需要缓存的菜单 name，用作页面 keepAlive
    keepAliveRouterGet: (state: any) =>
      getKeepAliveRouterName(state.authMenuList),
  },

  actions: {
    /**
     * @description:  获取按钮权限列表
     * @return {*} {Promise<void>} 返回一个 Promise，resolve 时返回按钮权限列表
     * TODO: <待完成> 这一块后续根据实际业务场景，打开对应按钮权限接口处理逻辑
     */
    async getAuthButtonList() {
      // 这一块后续根据实际业务场景，打开对应按钮权限接口处理
      // const { data } = await getAuthButtonListApi()
      // this.authButtonList = data
    },

    /**
     * @description:  获取菜单列表
     * @return {*} {Promise<void>
     */
    async getAuthMenuList() {
      try {
        const res = await getAuthMenuListApi()
        this.authMenuList = res.data
        return res // 确保返回完整响应
      } catch (error) {
        console.error('获取菜单失败:', error)
        throw error
      }
    },
  },
})
