/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-31
 * @FilePath: \Robot_Admin\src\router\routePath.ts
 * @Description: 动态路由路径拼接、规范化与展平工具
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export interface RoutePathNode {
  path: string
  children?: RoutePathNode[]
}

/**
 * @description 将路径规范化为无重复斜杠的绝对路径。
 * @param path 原始路径
 * @returns 绝对路径
 */
export const normalizeAbsoluteRoutePath = (path: string): string => {
  const normalized = `/${path}`.replace(/\/{2,}/g, '/')
  return normalized.length > 1 ? normalized.replace(/\/$/, '') : normalized
}

/**
 * @description 基于父路径解析子路径；绝对子路径保持其绝对语义。
 * @param parentPath 父级绝对路径
 * @param path 当前路由路径
 * @returns 当前路由的完整绝对路径
 */
export const joinRoutePath = (parentPath: string, path: string): string =>
  path.startsWith('/')
    ? normalizeAbsoluteRoutePath(path)
    : normalizeAbsoluteRoutePath(`${parentPath}/${path}`)

/**
 * @description 生成 Vue Router 路由记录 path；相对子路由不得被提升为根路径。
 * @param path 原始路由 path
 * @param isChild 是否为子路由
 * @returns Vue Router 可用的 path
 */
export const toRouteRecordPath = (path: string, isChild: boolean): string => {
  if (!isChild || path.startsWith('/')) return normalizeAbsoluteRoutePath(path)
  return path.replace(/^\/+|\/+$/g, '')
}

/**
 * @description 递归收集完整路由路径，用于菜单与路由权限校验。
 * @param routes 路由树
 * @param parentPath 父级绝对路径
 * @returns 去重后的完整路径列表
 */
export const collectRoutePaths = (
  routes: RoutePathNode[],
  parentPath = ''
): string[] => {
  const paths = new Set<string>()

  const walk = (nodes: RoutePathNode[], parent: string): void => {
    for (const route of nodes) {
      const fullPath = joinRoutePath(parent, route.path)
      paths.add(fullPath)
      if (route.children?.length) walk(route.children, fullPath)
    }
  }

  walk(routes, parentPath)
  return [...paths]
}
