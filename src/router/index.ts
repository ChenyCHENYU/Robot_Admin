/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 14:39:43
 * @FilePath: \Robot_Admin\src\router\index.ts
 * @Description: 路由入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/login',
//       name: 'login',
//       component: () => import('_views/login/index.vue'),
//     },
//     {
//       path: '/demo/01-icon',
//       name: 'demo-icon',
//       component: () => import('_views/demo/01-icon/index.vue'),
//     },
//     {
//       path: '/',
//       name: 'home',
//       component: HomeView,
//     },
//     {
//       path: '/about',
//       name: 'about',
//       component: () => import('../views/AboutView.vue'),
//     },
//   ],
// })

// export default router

import { createRouter, createWebHistory } from 'vue-router'
import { publicRoutes } from './publicRoutes'

const router = createRouter({
  history: createWebHistory(),
  routes: publicRoutes,
})

export default router
