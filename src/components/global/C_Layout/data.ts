/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-05-24
 * @FilePath: \Robot_Admin\src\components\global\C_Layout\data.ts
 * @Description: 布局组件数据处理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  DEFAULT_MENU_GROUPS,
  GROUP_COLORS,
  OTHER_GROUP_LABEL,
  type MenuGroupConfig,
} from '@/components/global/C_MenuGrouped/data'

export interface MenuGroup {
  label: string
  items: any[]
}

export const isMatchGroup = (
  cfg: MenuGroupConfig,
  p: string,
  t: string
): boolean => {
  if (cfg.paths?.some(x => p === x || p.endsWith(`/${x}`))) return true
  if (cfg.keywords?.some(kw => t.includes(kw))) return true
  return false
}

export const buildGroupedMenuData = (menus: any[]): MenuGroup[] => {
  const buckets: MenuGroup[] = DEFAULT_MENU_GROUPS.map(g => ({
    label: g.label,
    items: [],
  }))
  const other: MenuGroup = { label: OTHER_GROUP_LABEL, items: [] }

  for (const menu of menus) {
    const p = menu.path || menu.key || ''
    const t = menu.meta?.title || menu.name || ''
    const i = DEFAULT_MENU_GROUPS.findIndex(c => isMatchGroup(c, p, t))
    if (i >= 0) buckets[i].items.push(menu)
    else other.items.push(menu)
  }

  const out = buckets.filter(g => g.items.length > 0)
  if (other.items.length > 0) out.push(other)
  return out
}

export const getMenuGroupColor = (i: number) =>
  GROUP_COLORS[i % GROUP_COLORS.length]
