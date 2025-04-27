/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-27 17:03:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-27 19:48:50
 * @FilePath: \Robot_Admin\src\router\dynamicRoutes.ts
 * @Description: 静态路由表
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import router from './index'
import { parseRoutes } from '@/utils/parseRoutes'
import { useNotification } from 'naive-ui'
import { s_permissionStore } from '_store/permission'

const notification = useNotification()

export async function initDynamicRouter() {
  try {
    const permissionStore = s_permissionStore()
    await permissionStore.getAuthMenuList()
    await permissionStore.getAuthButtonList()

    if (!permissionStore.authMenuListGet.length) {
      notification.create({
        title: '无权访问',
        content: '当前账号无任何菜单权限，请联系系统管理员！',
        type: 'warning',
        duration: 3000,
      })
      router.replace('/login')
      return Promise.reject('No permission')
    }

    // 解析后端菜单为路由
    const dynamicRoutes = parseRoutes(permissionStore.authMenuListGet)

    // 添加到主容器（如 C_Container）下
    dynamicRoutes.forEach(route => {
      if (route.meta?.full) {
        router.addRoute(route)
      } else {
        router.addRoute('C_Container', route)
      }
    })
  } catch (error) {
    router.replace('/login')
    return Promise.reject(error)
  }
}
