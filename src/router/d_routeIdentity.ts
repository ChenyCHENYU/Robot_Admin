/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @FilePath: \Robot_Admin\src\router\d_routeIdentity.ts
 * @Description: 动态菜单的全局身份校验与按实际授权选择落地页
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { DynamicRoute } from './dynamicRouter'
import { joinRoutePath } from './routePath'

/** 在注册前拒绝重复身份/页面路径，避免 Vue Router 静默移除已有页面。 */
export const validateDynamicRouteIdentities = (
  routes: DynamicRoute[],
  reservedNames: ReadonlySet<string> = new Set(),
  reservedPaths: ReadonlySet<string> = new Set()
): void => {
  const names = new Set(reservedNames)
  // 主路由采用 Vue Router 默认的大小写不敏感匹配；仅比较键折叠，保留显示路径。
  const paths = new Set(
    [...reservedPaths].map(path => joinRoutePath('', path).toLowerCase())
  )
  const walk = (nodes: DynamicRoute[], parent = ''): void => {
    for (const node of nodes) {
      const isContainer = node.component === 'layout' && !!node.children?.length
      if ((!node.name && !isContainer) || (node.name && names.has(node.name))) {
        throw new Error('菜单路由身份缺失或重复，请刷新并联系管理员')
      }
      if (node.name) names.add(node.name)
      const path = joinRoutePath(parent, node.path)
      if (node.component && node.component !== 'layout') {
        const identityPath = path.toLowerCase()
        if (paths.has(identityPath))
          throw new Error('菜单页面路径重复或与静态路由冲突')
        paths.add(identityPath)
      }
      if (node.children) walk(node.children, path)
    }
  }
  walk(routes)
}

/** 首页仅在获得授权时使用；无首页角色进入首个授权页面，无页面则进入无权限页。 */
export const getAuthorizedLandingPath = (routes: DynamicRoute[]): string => {
  const pages: Array<{ path: string; hidden: boolean }> = []
  const walk = (nodes: DynamicRoute[], parent = ''): void => {
    for (const node of nodes) {
      const path = joinRoutePath(parent, node.path)
      if (node.component && node.component !== 'layout') {
        pages.push({ path, hidden: node.meta?.hidden === true })
      }
      if (node.children) walk(node.children, path)
    }
  }
  walk(routes)
  return (
    pages.find(page => page.path === '/home')?.path ??
    pages.find(page => !page.hidden)?.path ??
    pages[0]?.path ??
    '/401'
  )
}
