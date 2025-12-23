import router from './index'
import { createDiscreteApi } from 'naive-ui/es'
import type { RouteRecordRaw } from 'vue-router'
import { s_permissionStore } from '@/stores/permission'

const { message: messageApi } = createDiscreteApi(['message'])

export interface RouteMeta extends Record<string, any> {
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

// ⚡ 最佳实践：根据使用频率使用不同的加载策略
// 高频页面使用 eager 模式（首页、常用功能）- 打包到主chunk，立即可用
const EAGER_MODULES = import.meta.glob('@/views/home/**/*.vue', { eager: true })
const EAGER_DASH = import.meta.glob('@/views/dashboard/**/*.vue', {
  eager: true,
})

// 其他页面使用懒加载 - 按需加载，减小初始包体积
const LAZY_MODULES = import.meta.glob('@/views/**/!(home|dashboard)*.vue')

// 合并所有模块映射
const VIEW_MODULES = { ...EAGER_MODULES, ...EAGER_DASH, ...LAZY_MODULES }

/**
 * 路径规范化处理
 */
const normalizePath = (path: string, isChild: boolean): string => {
  if (import.meta.env.DEV && isChild && path.startsWith('/')) {
    console.warn(
      `[路由警告] 子路由path "${path}" 已包含前导/，请确认数据源是否需要修改`
    )
  }
  return isChild && !path.startsWith('/') ? `/${path}` : path
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

    const module = VIEW_MODULES[viewPath]

    if (module) {
      // eager 模式的模块直接返回
      if (typeof module === 'object' && 'default' in module) {
        return () => Promise.resolve(module)
      }
      // lazy 模式的模块返回函数
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
export const clearExistingRoutes = (protectedNames = ['login']) => {
  router
    .getRoutes()
    .filter(r => r.name && !protectedNames.includes(r.name.toString()))
    .forEach(r => router.removeRoute(r.name!))
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
    const { code, data: routes, msg } = await permissionStore.getAuthMenuList()

    if (code !== '0' || !Array.isArray(routes)) {
      throw new Error(msg || '无效的路由数据格式')
    }

    clearExistingRoutes(['login', '404', '401', 'portal', 'micro-app'])

    const processedRoutes = routes.map(route =>
      processRoute(route as DynamicRoute)
    )

    processedRoutes.forEach(route => {
      router.addRoute(route)
    })

    return true
  } catch (error) {
    console.error('动态路由初始化失败:', error)
    handleRouteError(error)
    return false
  }
}

// 开发环境调试工具
if (import.meta.env.DEV)
  router.afterEach(to => console.debug('[动态路由] 导航至:', to.path))
