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
import { joinRoutePath } from '@/router/routePath'

/**
 * @description: 使用递归，过滤需要显示的菜单
 * @param {MenuItem} menuList 所有菜单列表
 * @return {*} {MenuItem[]} 过滤后的菜单列表
 */
export const getShowMenuList = (
  menus: DynamicRoute[],
  parentPath = ''
): MenuOptions[] => {
  return menus
    .filter(menu => menu.meta?.hidden !== true)
    .flatMap(menu => {
      const menuPath = joinRoutePath(parentPath, menu.path)
      // 处理单子菜单情况
      if (menu.children?.length === 1) {
        const [child] = menu.children
        const childPath = joinRoutePath(menuPath, child.path)
        return {
          ...child,
          path: childPath,
          key: childPath,
          name: child.name || menu.name || '',
          meta: { ...menu.meta, ...child.meta }, // 合并meta
          children: child.children?.length
            ? getShowMenuList(child.children, childPath)
            : [],
        }
      }

      // 常规处理
      return {
        ...menu,
        path: menuPath,
        key: menuPath,
        name: menu.name || '',
        children: menu.children?.length
          ? getShowMenuList(menu.children, menuPath)
          : [],
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
