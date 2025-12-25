import type { App } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard/index.vue'),
    meta: {
      title: '物流仪表盘',
      icon: 'ri:dashboard-line',
    },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/orders/index.vue'),
    meta: {
      title: '订单管理',
      icon: 'ri:file-list-line',
    },
  },
  {
    path: '/warehouse',
    name: 'Warehouse',
    component: () => import('../views/warehouse/index.vue'),
    meta: {
      title: '仓库管理',
      icon: 'ri:building-line',
    },
  },
  {
    path: '/vehicles',
    name: 'Vehicles',
    component: () => import('../views/vehicles/index.vue'),
    meta: {
      title: '车辆调度',
      icon: 'ri:truck-line',
    },
  },
]

/**
 * 设置路由
 * @param app Vue应用实例
 */
export function setupRouter(app: App) {
  const router = createRouter({
    history: createWebHistory('/'),
    routes,
  })

  app.use(router)

  return router
}
