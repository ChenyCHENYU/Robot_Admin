/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @FilePath: \Robot_Admin\tests\cloud-management-contract.test.ts
 * @Description: Cloud 配对的客户端版本、按人授角色、稳定路由和无首页负例
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { createMemoryHistory, createRouter } from 'vue-router'
import {
  getAuthorizedLandingPath,
  validateDynamicRouteIdentities,
} from '../src/router/d_routeIdentity'
import {
  toTemporaryRoleGrant,
  formatGrantDateTime,
} from '../src/api/d_governance'
import { requireRevision } from '../src/api/management-revision'
import { bindCachedRouteComponent } from '../src/utils/d_routeComponent'

test('实际 Vue Router 保留两条 index 页面，按资源撤权不移除另一条或静态页', async () => {
  const routes = [
    { path: '/a/index', name: 'robot-menu:a', component: '/home/index' },
    { path: '/b/index', name: 'robot-menu:b', component: '/home/index' },
  ]
  validateDynamicRouteIdentities(routes, new Set(['login']))
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/login', name: 'login', component: {} }],
  })
  const removeA = router.addRoute({ ...routes[0], component: {} })
  router.addRoute({ ...routes[1], component: {} })
  expect(router.resolve('/a/index').name).toBe('robot-menu:a')
  expect(router.resolve('/b/index').name).toBe('robot-menu:b')
  const loader = async () => ({ default: {} })
  const componentA = await bindCachedRouteComponent('robot-menu:a', loader)()
  const componentB = await bindCachedRouteComponent('robot-menu:b', loader)()
  expect(componentA.name).toBe('robot-menu:a')
  expect(componentB.name).toBe('robot-menu:b')
  expect(componentA).not.toBe(componentB)
  removeA()
  expect(router.hasRoute('robot-menu:a')).toBe(false)
  expect(router.hasRoute('robot-menu:b')).toBe(true)
  expect(router.hasRoute('login')).toBe(true)
})

test('静态身份、重复动态身份和有效路径碰撞在注册前拒绝', () => {
  expect(() =>
    validateDynamicRouteIdentities(
      [{ path: '/a', name: 'login', component: '/home/index' }],
      new Set(['login'])
    )
  ).toThrow()
  expect(() =>
    validateDynamicRouteIdentities([
      { path: '/a', name: 'same', component: '/home/index' },
      { path: '/b', name: 'same', component: '/home/index' },
    ])
  ).toThrow()
  expect(() =>
    validateDynamicRouteIdentities([
      { path: '/a/', name: 'a', component: '/home/index' },
      { path: '/a', name: 'b', component: '/home/index' },
    ])
  ).toThrow()
})

test('实际 Vue Router 默认忽略页面路径大小写，因此动态路径在注册前拒绝碰撞', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/Users', name: 'first-users', component: {} },
      { path: '/users', name: 'second-users', component: {} },
    ],
  })
  expect(router.resolve('/Users').name).toBe('first-users')
  expect(router.resolve('/users').name).toBe('first-users')
  expect(() =>
    validateDynamicRouteIdentities([
      { path: '/Users', name: 'robot-menu:upper', component: '/home/index' },
      { path: '/users', name: 'robot-menu:lower', component: '/home/index' },
    ])
  ).toThrow('菜单页面路径重复')
})

test('嵌套路由和保留静态路径规范化后判重，原始展示路径保持大小写', () => {
  const nested = [
    {
      path: '/System/',
      component: 'layout',
      children: [
        { path: 'Users/', name: 'robot-menu:nested', component: '/home/index' },
      ],
    },
  ]
  expect(() =>
    validateDynamicRouteIdentities([
      ...nested,
      {
        path: '/system/users',
        name: 'robot-menu:flat',
        component: '/home/index',
      },
    ])
  ).toThrow('菜单页面路径重复')
  expect(() =>
    validateDynamicRouteIdentities(
      nested,
      new Set(),
      new Set(['//sYsTeM/users/'])
    )
  ).toThrow('静态路由冲突')
  expect(() =>
    validateDynamicRouteIdentities([
      {
        path: '/Other',
        component: 'layout',
        children: [
          {
            path: '/SYSTEM/users',
            name: 'robot-menu:absolute',
            component: '/home/index',
          },
        ],
      },
      ...nested,
    ])
  ).toThrow('菜单页面路径重复')
  validateDynamicRouteIdentities(nested)
  expect(nested[0].path).toBe('/System/')
  expect(nested[0].children[0].path).toBe('Users/')
  expect(getAuthorizedLandingPath(nested)).toBe('/System/Users')
})

test('无首页角色合法进入授权页；无页面不会额外获得首页授权', () => {
  expect(() =>
    validateDynamicRouteIdentities([
      {
        path: '/',
        component: 'layout',
        children: [{ path: 'home', name: 'home', component: '/home/index' }],
      },
    ])
  ).not.toThrow()
  expect(
    getAuthorizedLandingPath([
      {
        path: '/reports',
        name: 'report',
        component: '/dashboard/analysis/index',
      },
    ])
  ).toBe('/reports')
  expect(getAuthorizedLandingPath([])).toBe('/401')
  expect(
    getAuthorizedLandingPath([
      { path: '/home', name: 'home', component: '/home/index' },
    ])
  ).toBe('/home')
})

test('按人成员授角色映射保留版本和未生效状态，不产生任意附加权限', () => {
  const record = {
    id: 'grant-1',
    userId: 'member-1',
    roleId: 'role-1',
    revision: 7,
    statusFlag: 1,
    effectFrom: '2030-01-01 10:00:00',
    effectTo: '2030-01-01 11:00:00',
    reason: '临时值班',
  }
  const grant = toTemporaryRoleGrant(record, Date.parse('2030-01-01T09:00:00Z'))
  expect(grant).toMatchObject({
    userId: 'member-1',
    roleId: 'role-1',
    revision: 7,
    status: 'pending',
    permissions: [],
  })
  expect(toTemporaryRoleGrant({ ...record, statusFlag: 0 }).status).toBe(
    'revoked'
  )
  expect(formatGrantDateTime(Date.parse('2030-01-01T02:30:00Z'))).toBe(
    '2030-01-01 02:30:00'
  )
})

test('客户端版本缺失、负值、小数均拒绝，不读取最新版本补齐', () => {
  for (const value of [undefined, -1, 1.5, NaN])
    expect(() => requireRevision(value)).toThrow()
  expect(requireRevision(0)).toBe(0)
})
