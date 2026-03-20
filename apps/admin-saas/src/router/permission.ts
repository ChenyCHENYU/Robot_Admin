/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-11 01:02:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-10
 * @FilePath: \Robot_Admin\src\router\permission.ts
 * @Description: 路由权限控制 — 认证 + 动态路由 + 路由鉴权
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import router from '@/router'
import { s_userStore } from '@/stores/user'
import { initDynamicRouter, type DynamicRoute } from '@/router/dynamicRouter'
import { s_permissionStore } from '@/stores/permission'
import { message } from '@/plugins/discrete'
import { setupNProgress } from '@/plugins/nprogress'
import type { RouteLocationNormalized } from 'vue-router'
const nprogress = setupNProgress()
const WHITE_LIST = ['/login', '/404', '/401']
const LOGIN_PATH = '/login'
const DEFAULT_TITLE = 'Robot Admin'

// 防止重复初始化
let isInitializing = false

// 扩展 RouteMeta 类型
interface ExtendedRouteMeta {
  title?: string
  [key: string]: any
}

/**
 * * @description: 统一错误处理
 */
const handleRouteError = (error: unknown, customMsg?: string): string => {
  nprogress.done()
  console.error('路由异常:', error)
  message.error(customMsg || '系统异常，请重新登录')
  s_userStore().$reset()
  return LOGIN_PATH
}

/**
 * * @description: 设置页面标题
 */
const setPageTitle = (title?: string): void => {
  document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
}

/**
 * * @description: 初始化动态路由
 */
const handleDynamicRouterInit = async (fullPath: string): Promise<string> => {
  if (isInitializing) {
    return fullPath
  }

  isInitializing = true

  try {
    const success = await initDynamicRouter()

    if (!success) {
      throw new Error('动态路由初始化失败')
    }

    const { authMenuList } = s_permissionStore()
    if (!authMenuList.length) {
      throw new Error('菜单数据为空')
    }

    if (import.meta.env.DEV) {
      console.log('✅ 动态路由初始化成功')
    }
    return fullPath
  } catch (error) {
    return handleRouteError(error, '动态路由加载失败')
  } finally {
    isInitializing = false
  }
}

/**
 * * @description: 检查是否需要初始化动态路由
 */
const shouldInitDynamicRouter = (
  authMenuList: DynamicRoute[],
  isInitializing: boolean
): boolean => {
  return !authMenuList.length && !isInitializing
}

/**
 * * @description: 处理未登录场景
 */
const handleUnauthenticated = (
  to: RouteLocationNormalized,
  meta: ExtendedRouteMeta
): string | boolean => {
  if (WHITE_LIST.includes(to.path) || to.path.startsWith('/preview')) {
    setPageTitle(meta.title)
    return true
  }
  return LOGIN_PATH
}

/**
 * * @description: 处理已登录访问登录页
 */
const handleLoginPageRedirect = (): string => {
  return '/home'
}

/**
 * * @description: 校验路由访问权限
 * ? @param {RouteLocationNormalized} to 目标路由
 * ! @return {boolean} 是否允许访问
 */
const checkRoutePermission = (to: RouteLocationNormalized): boolean => {
  // 白名单和预览路由不校验
  if (WHITE_LIST.includes(to.path) || to.path.startsWith('/preview')) {
    return true
  }
  // 首页/错误页始终放行
  if (['/home', '/404', '/401'].includes(to.path)) {
    return true
  }
  const permissionStore = s_permissionStore()
  return permissionStore.hasRoutePermission(to.path)
}

// 核心路由守卫
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<string | boolean> => {
    nprogress.start()

    try {
      const userStore = s_userStore()
      const { token } = userStore
      const { authMenuList } = s_permissionStore()
      const meta = to.meta as ExtendedRouteMeta

      // 0. 预览路由直接放行
      if (to.path.startsWith('/preview')) {
        setPageTitle(meta.title)
        return true
      }

      // 1. 未登录处理
      if (!token) {
        return handleUnauthenticated(to, meta)
      }

      // 2. 已登录但访问登录页
      if (to.path === LOGIN_PATH) {
        return handleLoginPageRedirect()
      }

      // 3. 动态路由初始化
      if (shouldInitDynamicRouter(authMenuList, isInitializing)) {
        const result = await handleDynamicRouterInit(to.fullPath)

        if (result !== to.fullPath) {
          return result
        }

        return to.fullPath
      }

      // 4. 路由权限校验（动态路由已初始化后生效）
      if (!checkRoutePermission(to)) {
        message.error('您无权访问该页面')
        return '/401'
      }

      // 5. 跳过相同路由的重复检查
      if (to.path === from.path && to.fullPath === from.fullPath) {
        nprogress.done()
        return false
      }

      setPageTitle(meta.title)
      return true
    } catch (error) {
      return handleRouteError(error)
    } finally {
      nprogress.done()
    }
  }
)

// 简化的错误处理
router.onError((error: Error) => {
  nprogress.done()

  if (import.meta.env.DEV) {
    console.error('🔥 路由错误:', error)
  }

  if (error.message.includes('Loading chunk')) {
    window.location.reload()
    return
  }

  message.error('页面加载失败，请刷新重试')
})

// 后置钩子
router.afterEach((to, from, failure) => {
  if (import.meta.env.DEV && failure) {
    console.error('❌ 路由跳转失败:', failure.message)
  }
})
