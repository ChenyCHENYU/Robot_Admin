/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-29 11:13:19
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-10
 * @FilePath: \Robot_Admin\src\stores\permission\index.ts
 * @Description: 权限 Store — RBAC 路由权限 + 按钮权限 + 数据权限
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  getAuthMenuListApi,
  getAuthMode,
  type AuthMenuResponse,
} from '@/api/auth'
import {
  getAuthButtonListApi,
  getDataPermissionApi,
} from '@/api/permission-manage'
import { getKeepAliveRouterName, getShowMenuList } from '@/utils/d_route'
import { collectRoutePaths } from '@/router/routePath'
import type { DynamicRoute } from '@/router/dynamicRouter'
import type {
  ButtonPermissionMap,
  DataPermission,
} from '@/types/modules/permission'

export const s_permissionStore = defineStore('permission', {
  state: () => {
    return {
      /** 按钮权限映射表（key=路由path，value=权限编码数组） */
      authButtonList: {} as ButtonPermissionMap,
      /** 动态菜单路由列表（不持久化） */
      authMenuList: [] as DynamicRoute[],
      /** 数据权限规则列表 */
      dataPermissions: [] as DataPermission[],
      /** 已展平的全部合法路由 path 列表（用于路由鉴权） */
      flatRoutePaths: [] as string[],
    }
  },
  getters: {
    /** 按钮权限映射 */
    authButtonListGet: state => state.authButtonList,
    /** 原始菜单列表 */
    authMenuListGet: state => state.authMenuList,
    /** 过滤后的显示菜单（hidden !== true） */
    showMenuListGet: state => getShowMenuList(state.authMenuList),
    /** 需缓存的路由 name 列表 */
    keepAliveRouterGet: state => getKeepAliveRouterName(state.authMenuList),
    /** 数据权限规则 */
    dataPermissionsGet: state => state.dataPermissions,
  },

  actions: {
    /**
     * * @description: 获取按钮权限列表
     * ! @return {Promise<void>}
     */
    async getAuthButtonList() {
      if (getAuthMode() === 'mock') {
        this.authButtonList = {}
        return
      }
      try {
        const { data } = await getAuthButtonListApi()
        this.authButtonList = data ?? {}
      } catch (error) {
        console.error('获取按钮权限失败:', error)
        this.authButtonList = {}
      }
    },

    /**
     * * @description: 获取菜单列表并构建路由 path 集合
     * ! @return {Promise<AuthMenuResponse>} 菜单列表响应
     */
    async getAuthMenuList(): Promise<AuthMenuResponse> {
      try {
        const res = await getAuthMenuListApi()
        this.authMenuList = res.data
        // 构建合法路由路径列表
        this.flatRoutePaths = collectRoutePaths(res.data)
        return res
      } catch (error) {
        console.error('获取菜单失败:', error)
        throw error
      }
    },

    /** 获取当前用户的数据权限 */
    async getDataPermissions(): Promise<void> {
      if (getAuthMode() === 'mock') {
        this.dataPermissions = []
        return
      }
      try {
        const { data } = await getDataPermissionApi()
        this.dataPermissions = data ?? []
      } catch (error) {
        console.error('获取数据权限失败:', error)
        this.dataPermissions = []
      }
    },

    /** 菜单建立后并行初始化按钮和数据权限；辅助权限失败不破坏主导航 */
    async initializeAuxiliaryPermissions(): Promise<void> {
      await Promise.all([this.getAuthButtonList(), this.getDataPermissions()])
    },

    /** 清除当前账号的全部权限快照 */
    resetPermissions(): void {
      this.authButtonList = {}
      this.authMenuList = []
      this.dataPermissions = []
      this.flatRoutePaths = []
    },

    /**
     * * @description: 校验当前路由是否在权限范围内
     * ? @param {string} path 目标路由路径
     * ! @return {boolean} 是否有访问权限
     */
    hasRoutePermission(path: string): boolean {
      // 空列表表示尚未初始化，放行（由守卫初始化逻辑处理）
      if (this.flatRoutePaths.length === 0) return true
      return this.flatRoutePaths.includes(path)
    },

    /**
     * * @description: 校验按钮权限
     * ? @param {string} routePath 当前路由路径
     * ? @param {string} code 权限编码（如 user:manage:delete）
     * ! @return {boolean} 是否有该按钮权限
     */
    hasButtonPermission(routePath: string, code: string): boolean {
      const buttons = this.authButtonList[routePath]
      if (!buttons) return false
      return buttons.includes(code)
    },

    /**
     * * @description: 获取指定模块的数据权限
     * ? @param {string} module 模块标识
     * ! @return {DataPermission | undefined}
     */
    getDataPermission(module: string): DataPermission | undefined {
      return this.dataPermissions.find(dp => dp.module === module)
    },
  },
})
