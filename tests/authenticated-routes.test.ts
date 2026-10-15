/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-15
 * @Description: 认证基础页面、旧目录兼容及静态覆盖拒绝的真实VueRouter合同
 * Copyright (c) 2026 by CHENY, All Rights Reserved.
 */
import { expect, test } from 'bun:test'
import { createMemoryHistory, createRouter } from 'vue-router'
import {
  authenticatedRoutes,
  collectStaticRouteIdentities,
  isAuthenticatedAccountPath,
  withoutLegacyAccountMenus,
} from '../src/router/authenticatedRoutes'
import {
  getAuthorizedLandingPath,
  validateDynamicRouteIdentities,
} from '../src/router/d_routeIdentity'
import { publicRoutes } from '../src/router/publicRouter'

test('静态自助页真实匹配嵌套Layout，保留Navbar名称且不加入公共免登集合', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [...publicRoutes, ...authenticatedRoutes],
  })
  for (const [path, name] of [
    ['/account/profile', 'account-profile'],
    ['/account/security', 'account-security'],
    ['/account/activity-log', 'account-activity-log'],
  ]) {
    const route = router.resolve(path)
    expect(route.name).toBe(name)
    expect(route.matched).toHaveLength(2)
    expect(route.meta.keepAlive).toBe(false)
    expect(
      publicRoutes.some(record => record.name === name || record.path === path)
    ).toBe(false)
  }
  expect(isAuthenticatedAccountPath('/Account/Profile/')).toBe(true)
  expect(isAuthenticatedAccountPath('/account/profile/other')).toBe(false)
  expect(isAuthenticatedAccountPath('/sys-manage/permission-manage')).toBe(
    false
  )
  expect(getAuthorizedLandingPath([])).toBe('/401')
})
test('只适配完全匹配的旧自助页，输入快照不修改且错误组件/身份拒绝', () => {
  const legacy = [
    {
      path: '/account',
      name: 'account',
      component: 'layout',
      children: [
        {
          path: 'profile',
          name: 'account-profile',
          component: '/account/profile/index',
        },
        {
          path: 'security',
          name: 'robot-menu:legacy-security',
          component: 'account/security/index',
        },
        {
          path: 'activity-log',
          name: 'account-activity-log',
          component: '/account/activity-log/index',
        },
      ],
    },
  ]
  expect(withoutLegacyAccountMenus(legacy)).toEqual([])
  expect(legacy[0].children).toHaveLength(3)
  expect(() =>
    withoutLegacyAccountMenus([
      {
        path: '/account/profile',
        name: 'robot-menu:forged',
        component: '/sys-manage/user-manage/index',
      },
    ])
  ).toThrow('组件冲突')
  expect(() =>
    withoutLegacyAccountMenus([
      {
        path: '/account/profile',
        name: 'login',
        component: '/account/profile/index',
      },
    ])
  ).toThrow('身份')
})
test('静态父子身份均保留，动态移除不会删除自助页或授予业务权限', () => {
  const routes = [...publicRoutes, ...authenticatedRoutes]
  const reserved = collectStaticRouteIdentities(routes)
  const router = createRouter({ history: createMemoryHistory(), routes })
  const remove = router.addRoute({
    path: '/business',
    name: 'robot-menu:business',
    component: {},
  })
  expect(router.hasRoute('robot-menu:business')).toBe(true)
  remove()
  expect(router.hasRoute('robot-menu:business')).toBe(false)
  expect(router.resolve('/account/profile').name).toBe('account-profile')
  expect(() =>
    validateDynamicRouteIdentities(
      [{ path: '/other', name: 'account-security', component: '/home/index' }],
      reserved.names,
      reserved.paths
    )
  ).toThrow('身份')
  expect(() =>
    validateDynamicRouteIdentities(
      [
        {
          path: '/Account/Profile',
          name: 'robot-menu:override',
          component: '/home/index',
        },
      ],
      reserved.names,
      reserved.paths
    )
  ).toThrow('静态路由')
})
