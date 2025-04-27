/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 20:19:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 20:49:06
 * @FilePath: \Robot_Admin\src\store\permission\index.ts
 * @Description: 权限管理模块
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import { getAuthMenuListApi } from '@/api/sys'
import { getAllBreadcrumbList } from '@/utils/d_breadcrumb'
import { getKeepAliveRouterName, getShowMenuList } from '@/utils/d_route'

export const s_permissionStore = defineStore('permission', {
  state: () => {
    return {
      authButtonList: {},
      // menuList 作为动态路由，不会做持久化存储
      authMenuList: [] as Array<{ id: string; name: string; isHide: boolean }>,
    }
  },

  getters: {
    // 按钮权限列表
    authButtonListGet: state => state.authButtonList,
    // 后端返回的菜单列表
    authMenuListGet: state => state.authMenuList,
    // 后端返回的菜单列表 ==> 左侧菜单栏渲染，需要去除 isHide == true
    showMenuListGet: state => getShowMenuList(state.authMenuList),
    // 需要缓存的菜单 name，用作页面 keepAlive
    keepAliveRouterGet: state => getKeepAliveRouterName(state.authMenuList),
    // 面包屑导航列表
    breadcrumbListGet: state => getAllBreadcrumbList(state.authMenuList),
  },

  actions: {
    // getAuthButtonList
    async getAuthButtonList() {
      // 这一块后续根据实际业务场景，打开对应按钮权限接口处理
      // const { data } = await getAuthButtonListApi()
      // this.authButtonList = data
    },
    // getAuthMenuList
    async getAuthMenuList() {
      const { data } = await getAuthMenuListApi()
      this.authMenuList = data as Array<{
        id: string
        name: string
        isHide: boolean
      }>
    },
  },
})
