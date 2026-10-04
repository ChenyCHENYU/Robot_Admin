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
import {
  clearExistingRoutes,
  initDynamicRouter,
  isDynamicRouterReady,
} from '@/router/dynamicRouter'
import { hasRouteMatchChanged } from './d_routeMatch'
import { s_permissionStore } from '@/stores/permission'
import { getAuthMode } from '@/api/auth'
import { getMockAuthContexts } from '@/api/auth.mock-directory'
import { preloadAuthenticatedShell } from '@/router/authenticatedShell'
import { message } from '@/plugins/discrete'
import { setupNProgress } from '@/plugins/nprogress'
import { claimChunkRecovery, clearChunkRecovery } from './chunkRecovery'
import type {
  NavigationGuardReturn,
  RouteLocationNormalized,
  RouteMeta,
} from 'vue-router'
const nprogress = setupNProgress()
const WHITE_LIST = ['/login', '/404', '/401']
const LOGIN_PATH = '/login'
const DEFAULT_TITLE = 'Robot Admin'
const ROUTE_MODULE_LOAD_ERROR_RE =
  /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i

const getRecoveryStorage = (): Storage | undefined => {
  try {
    return window.sessionStorage
  } catch {
    return undefined
  }
}

let chunkRecoveryStarted = false

const handleChunkLoadFailure = (): void => {
  if (chunkRecoveryStarted) return

  if (
    import.meta.env.PROD &&
    navigator.onLine !== false &&
    claimChunkRecovery(getRecoveryStorage(), window.location.href)
  ) {
    chunkRecoveryStarted = true
    window.location.reload()
    return
  }

  message.error('页面模块加载失败，请检查网络后手动刷新重试')
}

/**
 * * @description: 统一错误处理
 */
const handleRouteError = (error: unknown, customMsg?: string): string => {
  nprogress.done()
  console.error('路由异常:', error)
  message.error(customMsg || '系统异常，请重新登录')
  s_userStore().clearSession()
  clearExistingRoutes()
  return LOGIN_PATH
}

/**
 * * @description: 设置页面标题
 */
const setPageTitle = (title?: string): void => {
  document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
}

/** 从开放的 RouteMeta 中安全读取标题 */
const getMetaTitle = (meta: RouteMeta): string | undefined =>
  typeof meta.title === 'string' ? meta.title : undefined

/**
 * * @description: 初始化动态路由
 */
const handleDynamicRouterInit = async (
  fullPath: string
): Promise<string | false> => {
  const tokenAtStart = s_userStore().token
  try {
    const [success] = await Promise.all([
      initDynamicRouter(),
      preloadAuthenticatedShell(),
    ])

    if (tokenAtStart !== s_userStore().token) return false

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
    if (tokenAtStart !== s_userStore().token) return false
    return handleRouteError(error, '动态路由加载失败')
  }
}

/**
 * * @description: 处理未登录场景
 */
const handleUnauthenticated = (
  to: RouteLocationNormalized,
  meta: RouteMeta
): string | boolean => {
  if (WHITE_LIST.includes(to.path) || to.path.startsWith('/preview')) {
    setPageTitle(getMetaTitle(meta))
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

/** 旧公司 ID、撤销的成员关系或过期的角色不得继承上一公司权限。 */
const handleMissingMockContext = (
  to: RouteLocationNormalized
): NavigationGuardReturn | undefined => {
  const userStore = s_userStore()
  if (getAuthMode() !== 'mock') return undefined
  const active = userStore.activeContext
  const authorized = getMockAuthContexts(
    userStore.userInfo.username || ''
  ).find(context => context.id === active?.id)
  if (
    active &&
    authorized &&
    active.isPrimary === authorized.isPrimary &&
    active.roles.map(role => role.id).join('|') ===
      authorized.roles.map(role => role.id).join('|')
  )
    return undefined
  userStore.clearSession()
  clearExistingRoutes()
  return to.path === LOGIN_PATH ? true : LOGIN_PATH
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

/** 路由就绪后校验权限；匹配记录被替换时保留地址参数并重新解析一次。 */
const handleAuthorizedRoute = (
  to: RouteLocationNormalized
): NavigationGuardReturn => {
  if (!checkRoutePermission(to)) {
    message.error('您无权访问该页面')
    return '/401'
  }
  // beforeEach 前已解析 matched，注册完成前发起的导航可能仍携带 NotFound。
  if (hasRouteMatchChanged(to, router.resolve(to.fullPath))) {
    return { path: to.path, query: to.query, hash: to.hash, replace: true }
  }
  setPageTitle(getMetaTitle(to.meta))
  return true
}

// 核心路由守卫
router.beforeEach(
  async (to: RouteLocationNormalized): Promise<NavigationGuardReturn> => {
    nprogress.start()

    try {
      const userStore = s_userStore()
      const { token } = userStore
      const { meta } = to

      // 0. 预览路由直接放行
      if (to.path.startsWith('/preview')) {
        setPageTitle(getMetaTitle(meta))
        return true
      }

      // 1. 未登录处理
      if (!token) {
        return handleUnauthenticated(to, meta)
      }

      // 演示多租户必须先激活公司；历史无上下文会话不可继承管理员菜单。
      const missingMockContext = handleMissingMockContext(to)
      if (missingMockContext !== undefined) return missingMockContext

      // 2. 已登录但访问登录页
      if (to.path === LOGIN_PATH) {
        return handleLoginPageRedirect()
      }

      // 3. 动态路由初始化
      if (!isDynamicRouterReady()) {
        const result = await handleDynamicRouterInit(to.fullPath)

        if (result === false) return false

        if (result !== to.fullPath) {
          return result
        }

        return to.fullPath
      }

      // 4. 权限校验和匹配快照检查使用已完成注册的当前会话路由。
      return handleAuthorizedRoute(to)
    } catch (error) {
      return handleRouteError(error)
    }
  }
)

// 简化的错误处理
router.onError((error: Error) => {
  nprogress.done()

  if (import.meta.env.DEV) {
    console.error('🔥 路由错误:', error)
  }

  if (ROUTE_MODULE_LOAD_ERROR_RE.test(error.message)) {
    handleChunkLoadFailure()
    return
  }

  message.error('页面加载失败，请刷新重试')
})

window.addEventListener('vite:preloadError', event => {
  event.preventDefault()
  handleChunkLoadFailure()
})

// 后置钩子
router.afterEach((_to, _from, failure) => {
  // afterEach 在异步路由组件解析完成后触发，进度条覆盖真实页面加载周期
  nprogress.done()
  if (!failure && !chunkRecoveryStarted) {
    clearChunkRecovery(getRecoveryStorage())
  }

  const expectedNavigationInterruption =
    failure &&
    /Avoided redundant navigation|Navigation cancelled/i.test(failure.message)

  if (import.meta.env.DEV && failure && !expectedNavigationInterruption) {
    console.error('❌ 路由跳转失败:', failure.message)
  }
})
