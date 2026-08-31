/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\router\routePrefetch.ts
 * @Description: 重量级路由的意图预取与空闲预热调度
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Router } from 'vue-router'
import { HEAVY_PAGES, HEAVY_PAGE_ROUTES } from '@/config/heavyPages'
import {
  shouldPrefetchHeavyRoutes,
  type NetworkInformationLike,
} from './routePrefetchPolicy'

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformationLike
  deviceMemory?: number
}

type HeavyRoute = (typeof HEAVY_PAGES)[number]['routePath']
type RouteLoader = () => Promise<unknown>

const HEAVY_ROUTE_LOADERS = {
  '/plugins/calendar': () => import('@/views/demo/13-calendar/index.vue'),
  '/editor/text-editor': () => import('@/views/demo/16-text-editor/index.vue'),
  '/editor/antv-x6-editor': () =>
    import('@/views/demo/29-antv-x6-editor/index.vue'),
  '/hooks/excel-all': () => import('@/views/demo/30-excel-all/index.vue'),
  '/plugins/v-table-gantt': () =>
    import('@/views/demo/33-v-table-gantt/index.vue'),
  '/editor/work-flow-editor': () =>
    import('@/views/demo/28-work-flow-editor/index.vue'),
} satisfies Record<HeavyRoute, RouteLoader>

const routePrefetchCache = new Map<HeavyRoute, Promise<unknown>>()
const PREFETCH_START_DELAY = 1800
const PREFETCH_GAP = 500

const normalizeRoutePath = (path: string): string => path.split(/[?#]/, 1)[0]

/**
 * 预取单个重量级路由。相同动态 import 会与 Vue Router 共享浏览器模块缓存。
 */
export const prefetchHeavyRoute = (
  path: string
): Promise<unknown> | undefined => {
  if (typeof navigator !== 'undefined') {
    const { connection, deviceMemory } = navigator as NavigatorWithConnection
    if (!shouldPrefetchHeavyRoutes(connection, deviceMemory)) return undefined
  }
  const normalizedPath = normalizeRoutePath(path) as HeavyRoute
  const loader = HEAVY_ROUTE_LOADERS[normalizedPath]
  if (!loader) return undefined

  const cached = routePrefetchCache.get(normalizedPath)
  if (cached) return cached

  const request = loader().catch(error => {
    routePrefetchCache.delete(normalizedPath)
    if (import.meta.env.DEV) {
      console.warn(`[route-prefetch] ${normalizedPath} 预取失败`, error)
    }
  })
  routePrefetchCache.set(normalizedPath, request)
  return request
}

const scheduleIdleTask = (callback: () => void): (() => void) => {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(callback, { timeout: 2500 })
    return () => window.cancelIdleCallback(handle)
  }

  const handle = window.setTimeout(callback, PREFETCH_GAP)
  return () => window.clearTimeout(handle)
}

/**
 * 登录后逐个预热高频大页面；预览页和登录页不启动，避免与首屏资源竞争。
 */
export const setupRoutePrefetch = (router: Router): (() => void) => {
  if (import.meta.env.VITE_ROUTE_IDLE_PREFETCH !== 'true') {
    return () => undefined
  }
  const { connection, deviceMemory } = navigator as NavigatorWithConnection
  if (!shouldPrefetchHeavyRoutes(connection, deviceMemory)) {
    return () => undefined
  }

  let stopped = false
  let started = false
  let cancelPendingTask: (() => void) | undefined
  let startTimer: number | undefined
  const queue = [...HEAVY_PAGE_ROUTES]

  const scheduleNext = () => {
    if (stopped || !queue.length) return

    cancelPendingTask = scheduleIdleTask(() => {
      if (stopped) return
      if (document.visibilityState === 'hidden') {
        scheduleNext()
        return
      }

      const path = queue.shift()
      if (!path) return
      void prefetchHeavyRoute(path)?.finally(() => {
        if (!stopped) {
          startTimer = window.setTimeout(scheduleNext, PREFETCH_GAP)
        }
      })
    })
  }

  const startWhenAuthenticated = () => {
    const { path } = router.currentRoute.value
    if (started || path === '/login' || path.startsWith('/preview')) return

    started = true
    startTimer = window.setTimeout(scheduleNext, PREFETCH_START_DELAY)
  }

  const removeAfterEach = router.afterEach(startWhenAuthenticated)
  startWhenAuthenticated()

  return () => {
    stopped = true
    removeAfterEach()
    cancelPendingTask?.()
    if (startTimer !== undefined) window.clearTimeout(startTimer)
  }
}
