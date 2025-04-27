/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 17:03:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 20:51:36
 * @FilePath: \Robot_Admin\src\router\dynamicRoutes.ts
 * @Description: 静态路由表
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import router from './index'
import { parseRoutes } from '@/utils/parseRoutes'
import { s_permissionStore } from '@/store/permission'

/**
 *? 初始化动态路由
 *? 1. 从后端获取菜单权限
 *? 2. 解析菜单权限为 vue-router 可用的路由格式
 *? 3. 添加到路由表中
 */

export async function initDynamicRouter() {
  // 获取 notification 实例
  // 使用依赖注入获取通知组件实例，用于非组件环境下的提示
  const notification = inject('notification') as {
    create: (options: {
      title: string
      content: string
      type: string
      duration: number
    }) => void
  }

  // 防御性检查确保通知实例存在
  if (!notification) {
    throw new Error('notification 未注入，请检查 main.ts')
  }

  try {
    // 初始化权限存储
    const permissionStore = s_permissionStore()

    // 检查菜单权限是否为空
    if (!permissionStore.authMenuListGet.length) {
      // ...existing code...
      return Promise.reject('No permission')
    }

    // 解析后端菜单为路由
    const menuListWithPaths = permissionStore.authMenuListGet.map(item => ({
      ...item,
      path:
        'path' in item && typeof item.path === 'string' && item.path.trim()
          ? item.path
          : `/${item.id}`,
    }))
    const dynamicRoutes = parseRoutes(menuListWithPaths)

    // 动态添加到主容器（如 C_Container）下
    dynamicRoutes.forEach(route => {
      if (route.meta?.full) {
        router.addRoute(route)
      } else {
        router.addRoute('C_Container', route)
      }
    })

    // 并行获取菜单权限和按钮权限
    await permissionStore.getAuthMenuList()
    await permissionStore.getAuthButtonList()

    // 检查菜单权限是否为空
    if (!permissionStore.authMenuListGet.length) {
      // 显示无权限警告通知
      notification.create({
        title: '无权访问',
        content: '当前账号无任何菜单权限，请联系系统管理员！',
        type: 'warning',
        duration: 3000,
      })

      // 跳转登录页并返回拒绝的 Promise
      router.replace('/login')
      return Promise.reject('No permission')
    }
  } catch (error) {
    // 处理异常情况：跳转登录页并传递错误
    router.replace('/login')
    return Promise.reject(error)
  }
}
