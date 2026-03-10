/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-10
 * @FilePath: \Robot_Admin\src\composables\usePermission.ts
 * @Description: 权限校验 composable — 按钮权限 + 数据权限辅助函数
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { s_permissionStore } from '@/stores/permission'
import type { DataPermission } from '@/types/modules/permission'

/**
 * * @description: 权限校验组合式函数
 * ! @return 权限校验方法集合
 */
export const usePermission = () => {
  const permissionStore = s_permissionStore()
  const route = useRoute()

  /**
   * * @description: 校验当前页面的按钮权限
   * ? @param {string} code 权限编码（如 user:manage:delete）
   * ! @return {boolean} 是否有权限
   */
  const hasButton = (code: string): boolean => {
    return permissionStore.hasButtonPermission(route.path, code)
  }

  /**
   * * @description: 校验多个按钮权限（AND 模式）
   * ? @param {string[]} codes 权限编码数组
   * ! @return {boolean} 是否全部拥有
   */
  const hasAllButtons = (codes: string[]): boolean => {
    return codes.every(code => hasButton(code))
  }

  /**
   * * @description: 校验多个按钮权限（OR 模式）
   * ? @param {string[]} codes 权限编码数组
   * ! @return {boolean} 是否拥有任一
   */
  const hasAnyButton = (codes: string[]): boolean => {
    return codes.some(code => hasButton(code))
  }

  /**
   * * @description: 获取当前模块的数据权限
   * ? @param {string} module 模块标识
   * ! @return {DataPermission | undefined}
   */
  const getDataScope = (module: string): DataPermission | undefined => {
    return permissionStore.getDataPermission(module)
  }

  return {
    // ─── Actions ───
    hasButton,
    hasAllButtons,
    hasAnyButton,
    getDataScope,
  }
}
