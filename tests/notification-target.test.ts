/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息业务路由必须同时满足注册与权限，拒绝内容驱动的外链跳转
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { describe, expect, it } from 'bun:test'
import { createMemoryHistory, createRouter } from 'vue-router'
import { resolveNotificationTarget } from '../src/utils/d_notificationTarget'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/approved', component: {} },
    { path: '/denied', component: {} },
    { path: '/login', component: {} },
    { path: '/:pathMatch(.*)*', component: {} },
  ],
})
const allowed = (path: string) => path === '/approved' || path === '/login'

describe('消息业务入口', () => {
  it('允许授权页面及其业务查询参数', () => {
    expect(
      resolveNotificationTarget('/approved?id=12', router, allowed)
    ).toEqual({ path: '/approved?id=12' })
  })
  it('拒绝未授权、已删除、登录、可执行协议和跨域页面', () => {
    for (const path of [
      '/denied',
      '/deleted',
      '/login',
      'javascript:alert(1)',
      'https://evil.invalid',
      '//evil.invalid',
      '/\\evil.invalid',
      '/approved\n',
    ]) {
      expect(resolveNotificationTarget(path, router, allowed)).toHaveProperty(
        'error'
      )
    }
  })
})
