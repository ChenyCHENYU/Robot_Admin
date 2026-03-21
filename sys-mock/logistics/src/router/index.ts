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
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/403/index.vue'),
    meta: {
      title: '无权限',
      hidden: true,
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

  // 权限路由守卫（可选）
  router.beforeEach((to, from, next) => {
    // 微前端环境下，可从主应用获取权限信息
    if (window.__MICRO_APP_ENVIRONMENT__) {
      const mainAppData = window.microApp?.getData() || {}
      const permissions = mainAppData.permissions || []

      // 如果路由需要权限验证
      if (
        to.meta.permission &&
        !permissions.includes(to.meta.permission as string)
      ) {
        console.warn(`[物流系统] 无权限访问: ${to.path}`)
        next('/403')
        return
      }
    }

    next()
  })

  app.use(router)

  return router
}
