/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 16:56:16
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 20:13:24
 * @FilePath: \Robot_Admin\src\utils\parseRoutes.ts
 * @Description: 解析动态路由数据为 vue-router 可用的格式
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { RouteRecordRaw } from 'vue-router'

// 动态导入 views 下所有 vue 文件
const modules = import.meta.glob('@/views/**/*.vue')

/**
 *? 递归解析后端菜单 JSON 为 RouteRecordRaw[]
 */
interface MenuItem {
  path: string
  name: string
  meta?: Record<string, unknown>
  component?: string
  redirect?: string
  children?: MenuItem[]
}

export function parseRoutes(menuList: MenuItem[]): RouteRecordRaw[] {
  return menuList.map(item => {
    const route = {
      path: item.path,
      name: item.name,
      meta: item.meta || {},
    } as RouteRecordRaw
    // 如果存在，有条件的添加重定向
    if (item.redirect) {
      route.redirect = item.redirect
    }
    // 动态 component 绑定
    if (item.component) {
      route.component = modules['/src/views' + item.component + '.vue']
    }
    // 重定向
    if (item.redirect) {
      route.redirect = item.redirect
    }
    // 递归 children
    if (item.children && item.children.length) {
      route.children = parseRoutes(item.children)
    }
    return route
  })
}
