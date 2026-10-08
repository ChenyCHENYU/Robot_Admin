/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\components\global\C_NavbarRight\d_searchMenu.ts
 * @Description: 权限菜单到全局搜索的边界转换，独立于导航栏 UI 与会话维护
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { SearchMenuItem } from '@robot-admin/naive-ui-components/C_GlobalSearch'
import {
  createMenuOptions,
  type RouteItem,
} from '@robot-admin/naive-ui-components/C_Menu'
import type { MenuOptions } from '@/types/modules/menu'
import type { MenuOption } from 'naive-ui/es'
import { translateRouteTitle } from '@/utils/plugins/i18n-route'

/** 将 Naive UI 菜单节点收窄为全局搜索可消费的数据结构。 */
function toSearchMenuItem(item: MenuOption): SearchMenuItem | null {
  if (
    (typeof item.key !== 'string' && typeof item.key !== 'number') ||
    typeof item.label !== 'string'
  ) {
    return null
  }

  const children = item.children
    ?.map(toSearchMenuItem)
    .filter((child): child is SearchMenuItem => child !== null)

  return {
    key: String(item.key),
    label: item.label,
    icon: item.icon,
    ...(children?.length ? { children } : {}),
  }
}

/** 将权限菜单树扁平化为 SearchMenuItem[]。 */
export function flattenMenuItems(items: MenuOption[]): SearchMenuItem[] {
  const result: SearchMenuItem[] = []
  for (const item of items) {
    const searchItem = toSearchMenuItem(item)
    if (searchItem) result.push(searchItem)
    if (item.children?.length) {
      result.push(...flattenMenuItems(item.children))
    }
  }
  return result
}

/** 将应用菜单路由转换为组件库公开的最小路由契约。 */
function toRouteItems(items: MenuOptions[]): RouteItem[] {
  return items.flatMap(item => {
    if (!item.path) return []

    const children = item.children?.length
      ? toRouteItems(item.children)
      : undefined

    return [
      {
        path: item.path,
        name: item.name,
        component: item.component,
        redirect: item.redirect,
        meta: item.meta,
        type: item.type,
        disabled: item.disabled,
        ...(children?.length ? { children } : {}),
      },
    ]
  })
}

/** 使用统一边界适配权限菜单，避免调用处重复做不安全断言。 */
export const createSearchMenuOptions = (items: MenuOptions[]): MenuOption[] =>
  createMenuOptions(toRouteItems(items), {
    labelFormatter: translateRouteTitle,
  })

const normalizeMenuKey = (key: unknown): string | null =>
  typeof key === 'string' || typeof key === 'number' ? String(key) : null

/** 在菜单树中找到父级的第一个子路由 key */
export function findFirstChildKey(
  parentKey: string,
  normalized: MenuOption[]
): string | null {
  const find = (nodes: MenuOption[]): string | null => {
    for (const n of nodes) {
      if (String(n.key) === parentKey && n.children?.length) {
        return normalizeMenuKey(n.children[0]?.key)
      }
      const nestedKey = n.children?.length ? find(n.children) : null
      if (nestedKey) return nestedKey
    }
    return null
  }
  return find(normalized)
}
