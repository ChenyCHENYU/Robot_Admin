import router from './index'
import type { RouteRecordRaw } from 'vue-router'
import { s_permissionStore } from '@/stores/permission'
import { message as messageApi } from '@/plugins/discrete'
import { toRouteRecordPath } from './routePath'

export interface RouteMeta extends Record<string, unknown> {
  title?: string
  icon?: string
  hidden?: boolean
  affix?: boolean
  keepAlive?: boolean
  full?: boolean
  link?: string
}

export interface DynamicRoute {
  path: string
  name?: string
  component?: string
  redirect?: string
  meta?: RouteMeta
  children?: DynamicRoute[]
}

// 预定义组件（使用对象字面量）
const COMPONENTS = {
  layout: () => import('@/components/global/C_Layout/index.vue'),
  '404': () => import('@/views/error-page/404.vue'),
} as const

// 所有动态页面统一懒加载；登录页无需预取首页的 3D、图表等重依赖。
const LAZY_MODULES = import.meta.glob('@/views/**/*.vue')
let dynamicRouteRemovers: Array<() => void> = []

/**
 * 路径规范化处理
 */
const normalizePath = (path: string, isChild: boolean): string => {
  if (import.meta.env.DEV && isChild && path.startsWith('/')) {
    console.warn(
      `[路由警告] 子路由path "${path}" 已包含前导/，请确认数据源是否需要修改`
    )
  }
  return toRouteRecordPath(path, isChild)
}

/**
 * 组件解析 - 最优化版本
 */
const resolveComponent = (path?: string) => {
  if (!path) return undefined

  // 检查预定义组件
  if (path in COMPONENTS) {
    return COMPONENTS[path as keyof typeof COMPONENTS]
  }

  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const viewPath = `/src/views${normalizedPath}.vue`

    const module = LAZY_MODULES[viewPath]

    if (module) {
      return module
    }

    console.warn(`[动态路由] 组件不存在: ${viewPath}`)
    return COMPONENTS['404']
  } catch (error) {
    console.error('[动态路由] 组件解析失败:', error)
    return COMPONENTS['404']
  }
}

/**
 * 路由处理中间件
 */
const processRoute = (route: DynamicRoute, isChild = false): RouteRecordRaw => {
  return {
    ...route,
    path: normalizePath(route.path, isChild),
    component: resolveComponent(route.component),
    children: route.children?.map(child => processRoute(child, true)),
    meta: {
      ...route.meta,
      isLayout: route.component === 'layout',
    },
  } as RouteRecordRaw
}

/**
 * 清理现有路由
 */
export const clearExistingRoutes = (): void => {
  for (const removeRoute of dynamicRouteRemovers.reverse()) removeRoute()
  dynamicRouteRemovers = []
}

/**
 * 统一错误处理
 */
const handleRouteError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : '路由初始化失败'
  console.error('[动态路由] 初始化失败:', error)
  messageApi.error(message)
  return message
}

/**
 * 初始化动态路由
 */
export const initDynamicRouter = async (): Promise<boolean> => {
  try {
    const permissionStore = s_permissionStore()
    const {
      code,
      data: routes,
      msg,
      message,
    } = await permissionStore.getAuthMenuList()

    if (![0, 200, '0', '200'].includes(code) || !Array.isArray(routes)) {
      throw new Error(msg || message || '无效的路由数据格式')
    }

    clearExistingRoutes()

    dynamicRouteRemovers = routes
      .map(route => processRoute(route as DynamicRoute))
      .map(route => router.addRoute(route))

    await permissionStore.initializeAuxiliaryPermissions()

    if (import.meta.env.DEV) {
      console.debug('[动态路由] 初始化完成:', router.getRoutes())
    }

    return true
  } catch (error) {
    clearExistingRoutes()
    s_permissionStore().resetPermissions()
    handleRouteError(error)
    return false
  }
}

// 开发环境调试工具
if (import.meta.env.DEV)
  router.afterEach(to => console.debug('[动态路由] 导航至:', to.path))
