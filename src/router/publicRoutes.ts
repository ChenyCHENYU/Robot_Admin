/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 17:04:55
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 17:07:35
 * @FilePath: \Robot_Admin\src\router\publicRouters.ts
 * @Description: 公开路由表
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { RouteRecordRaw } from 'vue-router'

/**
 * 公开路由表
 */
export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/C_Container',
    name: 'C_Container',
    component: () => import('@/components/global/C_Container/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true },
  },
  // {
  //   path: '/401',
  //   name: '401',
  //   component: () => import('@/views/error-page/401.vue'),
  //   meta: { hidden: true },
  // },
  // {
  //   path: '/404',
  //   name: '404',
  //   component: () => import('@/views/error-page/404.vue'),
  //   meta: { hidden: true },
  // },
  // // 404 catch-all，必须放最后
  // {
  //   path: '/:catchAll(.*)',
  //   name: 'not-found',
  //   component: () => import('@/views/iframe/blank.vue'),
  //   meta: { hidden: true },
  // },
]

export default publicRoutes
