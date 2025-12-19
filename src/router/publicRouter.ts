/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 22:11:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-28 11:18:25
 * @FilePath: \Robot_Admin\src\router\publicRouter.ts
 * @Description: 静态路由表
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('_views/login/index.vue'),
    meta: {
      title: '登录',
      icon: '',
      hidden: true,
      full: false,
      affix: false,
      keepAlive: false,
    },
  },
  {
    path: '/portal',
    name: 'portal',
    component: () => import('_views/portal/index.vue'),
    meta: {
      title: '系统门户',
      icon: 'i-ri:dashboard-line',
      hidden: true,
      full: true, // 全屏显示，不需要 Layout
      affix: false,
      keepAlive: true,
    },
  },
  {
    path: '/micro-app/:id',
    name: 'micro-app',
    component: () => import('_views/micro-app/index.vue'),
    meta: {
      title: '微应用',
      icon: 'i-ri:window-line',
      hidden: true,
      full: true, // 全屏显示
      affix: false,
      keepAlive: false,
    },
  },
  {
    path: '/401',
    name: '401',
    component: () => import('_views/error-page/401.vue'),
    meta: {
      title: '无权限',
      icon: '',
      hidden: true,
      full: false,
      affix: false,
      keepAlive: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('_views/error-page/404.vue'),
    meta: {
      title: '404',
      icon: '',
      hidden: true,
      full: false,
      affix: false,
      keepAlive: false,
    },
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('_views/error-page/blank.vue'),
    meta: {
      title: '空白',
      icon: '',
      hidden: true,
      full: false,
      affix: false,
      keepAlive: false,
    },
  },
]

const routes = [...publicRoutes]

export default routes
