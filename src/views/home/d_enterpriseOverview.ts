/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\src\views\home\d_enterpriseOverview.ts
 * @Description: 根据当前授权菜单统计工作空间可访问页面
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { MenuOptions } from '@/types/modules/menu'

/** 外链、分组和分隔线不计入内部页面。 */
const getWorkspacePagePath = (menu: MenuOptions): string | undefined =>
  menu.meta?.link || menu.type ? undefined : menu.path

/** 统计可见菜单中的内部叶子页面，排除分组、外链和重复路径。 */
export const countWorkspacePages = (menus: MenuOptions[]): number => {
  const paths = new Set<string>()

  const collectPages = (items: MenuOptions[]): void => {
    for (const item of items) {
      if (item.meta?.hidden || item.disabled) continue
      if (item.children?.length) {
        collectPages(item.children)
        continue
      }
      const path = getWorkspacePagePath(item)
      if (path) paths.add(path)
    }
  }

  collectPages(menus)
  return paths.size
}
