/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-28 15:55:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-03 08:42:40
 * @FilePath: \Robot_Admin\src\utils\d_route.ts
 * @Description: 路由相关工具函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { DynamicRoute } from '@/router/dynamicRouter'
import type { MenuOptions } from '@/types/modules/menu'

/**
 * @description: 使用递归，过滤需要显示的菜单
 * @param {MenuItem} menuList 所有菜单列表
 * @return {*} {MenuItem[]} 过滤后的菜单列表
 */
export const getShowMenuList = (menus: DynamicRoute[]): MenuOptions[] => {
  return menus
    .filter(menu => menu.meta?.hidden !== true)
    .flatMap(menu => {
      // 处理单子菜单情况
      if (menu.children?.length === 1) {
        const [child] = menu.children
        return {
          ...child,
          key: child.path,
          name: child.name || menu.name || '',
          meta: { ...menu.meta, ...child.meta }, // 合并meta
          children: child.children?.length
            ? getShowMenuList(child.children)
            : [],
        }
      }

      // 常规处理
      return {
        ...menu,
        key: menu.path,
        name: menu.name || '',
        children: menu.children?.length ? getShowMenuList(menu.children) : [],
      }
    })
    .filter(menu => {
      // 最终确保有效菜单项
      if (!menu.name) {
        console.warn(`路由 ${menu.path} 缺少 name 属性，已过滤`)
        return false
      }
      return true
    })
}

/**
 * @description: 格式化时间戳为可读字符串
 * @param {number} timestamp - Unix 时间戳（毫秒）
 * @return {string} 格式化后的时间字符串，格式：YYYY-MM-DD HH:mm:ss
 */
export function formatTime(timestamp: number): string {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 优化后的缓存路由名称函数
export const getKeepAliveRouterName = (menuList: MenuOptions[]): string[] => {
  const result: string[] = []

  const processor = (items: MenuOptions[]) => {
    items.forEach(item => {
      if (item.meta?.keepAlive && item.name) result.push(item.name)
      if (item.children?.length) processor(item.children)
    })
  }

  processor(menuList)
  return result
}
