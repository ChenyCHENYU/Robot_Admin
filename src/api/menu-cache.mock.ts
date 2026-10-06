/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\api\menu-cache.mock.ts
 * @Description: Mock 菜单缓存策略，按公司隔离并同步至认证路由
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { DynamicRoute } from '../router/dynamicRouter'

const STORAGE_PREFIX = 'robot-admin:menu-cache:v1:'
const memory = new Map<string, Record<string, boolean>>()

export const getMockMenuCachePolicy = (
  contextId = 'default'
): Record<string, boolean> => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_PREFIX + contextId)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.fromEntries(
          Object.entries(parsed).filter(
            ([, value]) => typeof value === 'boolean'
          )
        )
      }
    }
  } catch {
    // 禁用存储或旧数据损坏时使用当前会话配置。
  }
  return { ...memory.get(contextId) }
}

export const setMockMenuCachePolicy = (
  contextId: string,
  routeName: string,
  keepAlive: boolean
): void => {
  const policy = {
    ...getMockMenuCachePolicy(contextId),
    [routeName]: keepAlive,
  }
  memory.set(contextId, policy)
  try {
    globalThis.localStorage?.setItem(
      STORAGE_PREFIX + contextId,
      JSON.stringify(policy)
    )
  } catch {
    // 本地存储不可写时仍支持本次会话。
  }
}

export const applyMockMenuCachePolicy = (
  routes: DynamicRoute[],
  contextId = 'default'
): DynamicRoute[] => {
  const policy = getMockMenuCachePolicy(contextId)
  const visit = (route: DynamicRoute): DynamicRoute => ({
    ...route,
    meta: {
      ...route.meta,
      ...(route.name && Object.prototype.hasOwnProperty.call(policy, route.name)
        ? { keepAlive: policy[route.name] }
        : {}),
    },
    children: route.children?.map(visit),
  })
  return routes.map(visit)
}
