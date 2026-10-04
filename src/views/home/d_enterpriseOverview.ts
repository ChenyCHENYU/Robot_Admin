/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\src\views\home\d_enterpriseOverview.ts
 * @Description: 从可见授权菜单提取工作空间页面与首页入口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MenuOptions } from '@/types/modules/menu'

/** 外链、分组和分隔线不计入内部页面。 */
const getWorkspacePagePath = (menu: MenuOptions): string | undefined =>
  menu.meta?.link || menu.type ? undefined : menu.path

/** 收集内部叶子页面，过滤隐藏、禁用项与重复路径。 */
export const getWorkspacePages = (menus: MenuOptions[]): MenuOptions[] => {
  const pages = new Map<string, MenuOptions>()
  /** 隐藏或禁用父级的子页面也不可作为首页入口。 */
  const collectPages = (items: MenuOptions[]): void => {
    for (const item of items) {
      if (item.meta?.hidden || item.disabled) continue
      if (item.children?.length) {
        collectPages(item.children)
        continue
      }
      const path = getWorkspacePagePath(item)
      if (path && !pages.has(path)) pages.set(path, item)
    }
  }
  collectPages(menus)
  return [...pages.values()]
}

/** 可访问页面数与首页入口使用同一份授权菜单。 */
export const countWorkspacePages = (menus: MenuOptions[]): number =>
  getWorkspacePages(menus).length
