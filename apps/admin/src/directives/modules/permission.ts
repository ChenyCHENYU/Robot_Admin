/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 16:29:59
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 17:41:44
 * @FilePath: \Robot_Admin\src\directives\modules\permission.ts
 * @Description: 权限指令
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { Directive } from 'vue'

/**
 * * @description 权限检查配置选项接口
 */
export interface PermissionOptions {
  permissions?: string | string[]
  authData?: Record<string, any>
  mode?: 'AND' | 'OR'
  fallback?: 'hide' | 'disable' | 'show'
  onDenied?: (reason: string) => void
}

/**
 * * @description 扩展的HTML元素类型
 */
interface ElType extends HTMLElement {
  _originalDisplay?: string
  _originalDisabled?: boolean
}

/**
 * * @description 解析指令参数
 * ? @param value - 指令绑定值
 * ! @return 标准化的权限配置选项
 */
function parseOptions(
  value: string | string[] | PermissionOptions | undefined
): PermissionOptions {
  if (!value) return { fallback: 'hide' }
  if (typeof value === 'string') return { permissions: value, fallback: 'hide' }
  if (Array.isArray(value)) return { permissions: value, fallback: 'hide' }
  return { fallback: 'hide', ...value }
}

/**
 * * @description 检查通配符权限
 * ? @param permission - 权限名称
 * ? @param authData - 权限数据
 * ! @return 是否匹配
 */
function checkWildcard(
  permission: string,
  authData: Record<string, any>
): boolean {
  const keys = Object.keys(authData || {})
  for (const key of keys) {
    if (key.endsWith('*') && permission.startsWith(key.slice(0, -1))) {
      return !!authData[key]
    }
  }
  return false
}

/**
 * * @description 检查单个权限
 * ? @param permission - 权限名称
 * ? @param authData - 权限数据
 * ! @return 是否有权限
 */
function checkSinglePermission(
  permission: string,
  authData: Record<string, any>
): boolean {
  if (!authData || typeof authData !== 'object') return false
  return !!authData[permission] || checkWildcard(permission, authData)
}

/**
 * * @description 检查权限列表
 * ? @param permissions - 权限列表
 * ? @param authData - 权限数据
 * ? @param mode - 检查模式
 * ! @return 是否有权限
 */
function hasPermission(
  permissions: string | string[],
  authData: Record<string, any>,
  mode: 'AND' | 'OR' = 'OR'
): boolean {
  const permList = Array.isArray(permissions) ? permissions : [permissions]
  if (permList.length === 0) return true

  let matchCount = 0
  for (const perm of permList) {
    if (checkSinglePermission(perm, authData)) {
      matchCount++
    }
  }

  return mode === 'AND' ? matchCount === permList.length : matchCount > 0
}

/**
 * * @description 恢复元素原始状态
 * ? @param el - 目标DOM元素
 * ! @return void
 */
function restoreElement(el: ElType): void {
  if (el._originalDisplay !== undefined) {
    el.style.display = el._originalDisplay
    el._originalDisplay = undefined
  }

  if (el._originalDisabled !== undefined && 'disabled' in el) {
    ;(el as any).disabled = el._originalDisabled
    el._originalDisabled = undefined
  }

  el.style.opacity = ''
  el.style.pointerEvents = ''
}

/**
 * * @description 应用权限限制
 * ? @param el - 目标DOM元素
 * ? @param fallback - 降级策略
 * ! @return void
 */
function applyRestriction(el: ElType, fallback: string): void {
  if (fallback === 'hide') {
    if (el._originalDisplay === undefined) {
      el._originalDisplay = el.style.display || ''
    }
    el.style.display = 'none'
  } else if (fallback === 'disable') {
    if ('disabled' in el && el._originalDisabled === undefined) {
      el._originalDisabled = (el as any).disabled || false
      ;(el as any).disabled = true
    }
  } else if (fallback === 'show') {
    el.style.opacity = '0.5'
    el.style.pointerEvents = 'none'
  }
}

/**
 * * @description 应用权限检查结果
 * ? @param el - 目标DOM元素
 * ? @param options - 权限配置选项
 * ! @return void
 */
function applyPermission(el: ElType, options: PermissionOptions): void {
  const { permissions, authData, mode, fallback, onDenied } = options

  // 没有权限数据时默认拒绝
  if (!authData) {
    applyRestriction(el, fallback || 'hide')
    onDenied?.('权限数据未提供')
    return
  }

  // 没有权限要求时默认允许
  if (!permissions) {
    restoreElement(el)
    return
  }

  if (hasPermission(permissions, authData, mode)) {
    restoreElement(el)
  } else {
    applyRestriction(el, fallback || 'hide')
    onDenied?.('权限不足')
  }
}

/**
 * * @description Vue权限指令
 */
const permissionDirective: Directive<
  HTMLElement,
  string | string[] | PermissionOptions | undefined
> = {
  /**
   * * @description 指令挂载时的处理逻辑
   * ? @param el - 绑定指令的DOM元素
   * ? @param binding - 指令绑定对象
   * ! @return void
   */
  mounted(el: ElType, binding) {
    const options = parseOptions(binding.value)
    applyPermission(el, options)
  },

  /**
   * * @description 指令更新时的处理逻辑
   * ? @param el - 绑定指令的DOM元素
   * ? @param binding - 指令绑定对象
   * ! @return void
   */
  updated(el: ElType, binding) {
    const options = parseOptions(binding.value)
    applyPermission(el, options)
  },

  /**
   * * @description 指令卸载时的清理逻辑
   * ? @param el - 绑定指令的DOM元素
   * ! @return void
   */
  unmounted(el: ElType) {
    el._originalDisplay = undefined
    el._originalDisabled = undefined
  },
}

export default permissionDirective
