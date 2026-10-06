/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\router\dynamicRouter.ts
 * @Description: 会话内共享动态路由初始化，注册完成后才向导航发布就绪状态
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import router from './index'
import type { RouteRecordRaw } from 'vue-router'
import { s_permissionStore } from '@/stores/permission'
import { s_userStore } from '@/stores/user'
import type { AuthMenuResponse } from '@/api/auth'
import { message as messageApi } from '@/plugins/discrete'
import {
  joinRoutePath,
  normalizeAbsoluteRoutePath,
  toRouteRecordPath,
} from './routePath'
import { bindCachedRouteComponent } from '@/utils/d_routeComponent'

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
type RouteComponentLoader = () => Promise<unknown>
const dynamicRouteLoaders = new Map<string, RouteComponentLoader>()
const routePrefetchCache = new Map<string, Promise<unknown>>()
let registeredGeneration: number | undefined
let registrationEpoch = 0
let pendingInitialization:
  { generation: number; epoch: number; promise: Promise<boolean> } | undefined

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
const resolveComponent = (path?: string): RouteComponentLoader | undefined => {
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
const processRoute = (
  route: DynamicRoute,
  isChild = false,
  parentPath = ''
): RouteRecordRaw => {
  const fullPath = joinRoutePath(parentPath, route.path)
  const resolved = resolveComponent(route.component)
  const component =
    resolved &&
    route.name &&
    route.meta?.keepAlive === true &&
    route.component !== 'layout'
      ? bindCachedRouteComponent(route.name, resolved)
      : resolved
  if (component) dynamicRouteLoaders.set(fullPath, component)

  return {
    ...route,
    path: normalizePath(route.path, isChild),
    component,
    children: route.children?.map(child => processRoute(child, true, fullPath)),
    meta: {
      ...route.meta,
      isLayout: route.component === 'layout',
    },
  } as RouteRecordRaw
}

/**
 * 移除已注册路由；初始化内部替换记录时保留同一份进行中的任务。
 */
const removeRegisteredRoutes = (): void => {
  registeredGeneration = undefined
  for (const removeRoute of dynamicRouteRemovers.reverse()) removeRoute()
  dynamicRouteRemovers = []
  dynamicRouteLoaders.clear()
  routePrefetchCache.clear()
}

/** 清理旧会话路由与初始化入口，下一次登录必须重新注册。 */
export const clearExistingRoutes = (): void => {
  registrationEpoch += 1
  pendingInitialization = undefined
  removeRegisteredRoutes()
}

/** 菜单响应写入 Store 早于 addRoute，不能用菜单非空作为导航就绪条件。 */
export const isDynamicRouterReady = (): boolean =>
  registeredGeneration === s_permissionStore().requestGeneration

/**
 * 在不触发导航的前提下加载动态路由组件。原生 import 缓存会被后续
 * Vue Router 导航复用；失败项会移出缓存，允许下一次用户意图重试。
 */
export const prefetchDynamicRouteComponent = (
  path: string
): Promise<unknown> | undefined => {
  const normalizedPath = normalizeAbsoluteRoutePath(path.split(/[?#]/, 1)[0])
  const loader = dynamicRouteLoaders.get(normalizedPath)
  if (!loader) return undefined

  const cached = routePrefetchCache.get(normalizedPath)
  if (cached) return cached

  const request = loader().catch(error => {
    routePrefetchCache.delete(normalizedPath)
    throw error
  })
  routePrefetchCache.set(normalizedPath, request)
  return request
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

/** 校验菜单响应后才允许进入路由注册阶段，空菜单明确报错。 */
const readDynamicRoutes = (response: AuthMenuResponse): DynamicRoute[] => {
  const { code, data, msg, message } = response
  if (![0, 200, '0', '200'].includes(code))
    throw new Error(msg || message || '菜单请求失败')
  if (!Array.isArray(data) || !data.length)
    throw new Error('菜单数据为空或格式无效，请联系管理员')
  return data
}

/**
 * 获取并注册当前会话的路由，旧会话响应不能发布就绪状态。
 */
const registerDynamicRoutes = async (
  generation: number,
  epoch: number
): Promise<boolean> => {
  const permissionStore = s_permissionStore()
  /** 会话清除或路由主动失效后，旧任务不得重新注册页面或清除新路由。 */
  const isCurrent = (): boolean =>
    generation === permissionStore.requestGeneration &&
    epoch === registrationEpoch
  try {
    const response = await permissionStore.getAuthMenuList(
      s_userStore().activeContext
    )

    if (!isCurrent()) return false
    const routes = readDynamicRoutes(response)

    removeRegisteredRoutes()

    for (const route of routes) {
      dynamicRouteRemovers.push(router.addRoute(processRoute(route)))
    }
    if (router.resolve('/home').name === 'NotFound') {
      throw new Error('菜单未提供首页路由，请联系管理员')
    }
    registeredGeneration = generation

    // 菜单路由是进入页面的唯一关键依赖；按钮/数据权限保持 deny-by-default，
    // 在后台并行补齐，避免任一辅助接口延迟拖住整次导航和顶部进度条。
    void permissionStore.initializeAuxiliaryPermissions().catch(error => {
      console.error('[动态路由] 辅助权限初始化失败:', error)
    })

    if (import.meta.env.DEV) {
      console.debug('[动态路由] 初始化完成:', router.getRoutes())
    }

    return true
  } catch (error) {
    if (!isCurrent()) return false
    clearExistingRoutes()
    permissionStore.resetPermissions()
    handleRouteError(error)
    return false
  }
}

/** 登录提交与路由守卫共享当前会话的唯一初始化任务，避免重复清除和注册。 */
export const initDynamicRouter = (): Promise<boolean> => {
  const generation = s_permissionStore().requestGeneration
  const epoch = registrationEpoch
  if (isDynamicRouterReady()) return Promise.resolve(true)
  if (
    pendingInitialization?.generation === generation &&
    pendingInitialization.epoch === epoch
  )
    return pendingInitialization.promise

  const promise = registerDynamicRoutes(generation, epoch)
  pendingInitialization = { generation, epoch, promise }
  /** 旧会话任务完成时，不清除新会话正在进行的初始化。 */
  const release = (): void => {
    if (pendingInitialization?.promise === promise)
      pendingInitialization = undefined
  }
  void promise.then(release, release)
  return promise
}

// 开发环境调试工具
if (import.meta.env.DEV)
  router.afterEach(to => console.debug('[动态路由] 导航至:', to.path))
