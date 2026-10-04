/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\tests\route-match.test.ts
 * @Description: 用真实 Vue Router 验证动态注册后不沿用旧 404 或旧公司匹配记录
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { expect, test } from 'bun:test'
import { createMemoryHistory, createRouter } from 'vue-router'
import { hasRouteMatchChanged } from '../src/router/d_routeMatch'

/** 使用实际 catch-all 记录复现导航解析先于 addRoute 的窗口。 */
const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', name: 'NotFound', component: {} }],
  })

test('首页先匹配 404，守卫执行时首页已注册，仍须重新匹配而无需刷新', async () => {
  const router = createTestRouter()
  const matched: unknown[] = []
  router.beforeEach(to => {
    matched.push(to.name)
    if (!router.hasRoute('home'))
      router.addRoute({ path: '/home', name: 'home', component: {} })
    if (hasRouteMatchChanged(to, router.resolve(to.fullPath)))
      return { path: to.path, query: to.query, hash: to.hash, replace: true }
  })
  await router.push('/home?from=login#workspace')
  expect(matched).toEqual(['NotFound', 'home'])
  expect(router.currentRoute.value.name).toBe('home')
  expect(router.currentRoute.value.fullPath).toBe('/home?from=login#workspace')
})

test('公司切换后同名同路径记录替换，也不能继续使用原公司的匹配对象', () => {
  const router = createTestRouter()
  router.addRoute({ path: '/home', name: 'home', component: {} })
  const oldMatch = router.resolve('/home')
  router.removeRoute('home')
  router.addRoute({ path: '/home', name: 'home', component: {} })
  const newMatch = router.resolve('/home')
  expect(oldMatch.name).toBe(newMatch.name)
  expect(hasRouteMatchChanged(oldMatch, newMatch)).toBe(true)
  expect(hasRouteMatchChanged(newMatch, router.resolve('/home'))).toBe(false)
})

test('真实不存在的页面保留 404，匹配不变时不会产生重定向循环', async () => {
  const router = createTestRouter()
  let navigations = 0
  router.beforeEach(to => {
    navigations += 1
    if (hasRouteMatchChanged(to, router.resolve(to.fullPath)))
      return { path: to.path, query: to.query, hash: to.hash, replace: true }
  })
  await router.push('/really-missing')
  expect(router.currentRoute.value.name).toBe('NotFound')
  expect(navigations).toBe(1)
})
