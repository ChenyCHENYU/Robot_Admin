/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-15
 * @Description: 登录者自助账户基础路由；独立于业务角色菜单且保留公开白名单边界
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import type { RouteRecordRaw } from 'vue-router'
import type { DynamicRoute } from './dynamicRouter'
import { joinRoutePath, normalizeAbsoluteRoutePath } from './routePath'

const SELF_PAGES = [
  {
    path: '/account/messages',
    name: 'account-messages',
    component: 'account/messages/index',
    title: '消息中心',
  },
  {
    path: '/account/profile',
    name: 'account-profile',
    component: 'account/profile/index',
    title: '个人中心',
  },
  {
    path: '/account/security',
    name: 'account-security',
    component: 'account/security/index',
    title: '安全设置',
  },
  {
    path: '/account/activity-log',
    name: 'account-activity-log',
    component: 'account/activity-log/index',
    title: '操作日志',
  },
] as const

/** 仅识别明确的自助路径；认证仍由导航守卫先校验有效会话。 */
export const isAuthenticatedAccountPath = (path: string): boolean =>
  SELF_PAGES.some(
    page => page.path === normalizeAbsoluteRoutePath(path).toLowerCase()
  )

/** 静态基础页不缓存个人数据，布局generation变化会销毁上一公司页面。 */
export const authenticatedRoutes: RouteRecordRaw[] = [
  {
    path: '/account',
    name: 'authenticated-account',
    redirect: '/account/profile',
    component: () => import('@/components/global/C_Layout/index.vue'),
    meta: { title: '账户中心', hidden: true, keepAlive: false, isLayout: true },
    children: [
      {
        path: 'messages',
        name: 'account-messages',
        component: () => import('@/views/account/messages/index.vue'),
        meta: {
          title: '消息中心',
          hidden: true,
          keepAlive: false,
          isLayout: false,
        },
      },
      {
        path: 'profile',
        name: 'account-profile',
        component: () => import('@/views/account/profile/index.vue'),
        meta: {
          title: '个人中心',
          hidden: true,
          keepAlive: false,
          isLayout: false,
        },
      },
      {
        path: 'security',
        name: 'account-security',
        component: () => import('@/views/account/security/index.vue'),
        meta: {
          title: '安全设置',
          hidden: true,
          keepAlive: false,
          isLayout: false,
        },
      },
      {
        path: 'activity-log',
        name: 'account-activity-log',
        component: () => import('@/views/account/activity-log/index.vue'),
        meta: {
          title: '操作日志',
          hidden: true,
          keepAlive: false,
          isLayout: false,
        },
      },
    ],
  },
]

/** 收集静态父子身份与路径，动态菜单不能覆盖公共页或认证基础页。 */
export const collectStaticRouteIdentities = (routes: RouteRecordRaw[]) => {
  const names = new Set<string>()
  const paths = new Set<string>()
  const walk = (nodes: RouteRecordRaw[], parent = '') => {
    for (const node of nodes) {
      const path = joinRoutePath(parent, node.path)
      if (typeof node.name === 'string') names.add(node.name)
      paths.add(path)
      if (node.children) walk(node.children, path)
    }
  }
  walk(routes)
  return { names, paths }
}

/** 完全匹配的旧自助节点才可去重；其他基础身份或组件覆盖不得吞掉。 */
const assertLegacySelfPage = (
  node: DynamicRoute,
  self: (typeof SELF_PAGES)[number]
) => {
  const component = node.component?.replace(/^\//, '')
  if (
    component !== self.component ||
    !(node.name === self.name || node.name?.startsWith('robot-menu:'))
  )
    throw new Error('账户基础路由与菜单身份或组件冲突')
}

/** 旧账户目录移除全部自助子页后没有业务内容，不再注册重复容器。 */
const isEmptyLegacyAccountGroup = (
  node: DynamicRoute,
  path: string,
  children?: DynamicRoute[]
) =>
  path.toLowerCase() === '/account' &&
  node.component === 'layout' &&
  Boolean(node.children?.length) &&
  !children?.length

/** 兼容旧菜单中完全匹配的自助页；其他账户路径/组件覆盖明确拒绝。 */
export const withoutLegacyAccountMenus = (
  routes: DynamicRoute[],
  parent = ''
): DynamicRoute[] =>
  routes.flatMap(node => {
    const path = joinRoutePath(parent, node.path)
    const self = SELF_PAGES.find(page => page.path === path.toLowerCase())
    if (self) {
      assertLegacySelfPage(node, self)
      return []
    }
    const children = node.children
      ? withoutLegacyAccountMenus(node.children, path)
      : undefined
    if (isEmptyLegacyAccountGroup(node, path, children)) return []
    return [{ ...node, ...(children ? { children } : {}) }]
  })
