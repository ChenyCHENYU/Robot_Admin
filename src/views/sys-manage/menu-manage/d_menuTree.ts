/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\views\sys-manage\menu-manage\d_menuTree.ts
 * @Description: 菜单搜索上下文与父级选择的页面展示适配
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MenuFormData, MenuData } from '@/api/menu-manage.contract'
import { flattenMenus, findMenu } from '@/api/d_menu'
import type { TreeSelectOption } from 'naive-ui/es'
import { joinRoutePath } from '@/router/routePath'

/** 父节点命中时保留整棵子树；子节点命中时保留祖先上下文。 */
export const filterMenus = (
  menus: MenuData[],
  keyword: string,
  parentPath = ''
): MenuData[] => {
  const term = keyword.trim().toLocaleLowerCase()
  if (!term) return menus
  return menus.flatMap(menu => {
    const fullPath = joinRoutePath(parentPath, menu.path || '')
    if (
      [menu.name, fullPath, menu.permission, menu.component].some(value =>
        value?.toLocaleLowerCase().includes(term)
      )
    ) {
      return [menu]
    }
    const children = filterMenus(menu.children || [], term, fullPath)
    return children.length ? [{ ...menu, children }] : []
  })
}

export const getParentOptions = (
  menus: MenuData[],
  draft: MenuFormData
): TreeSelectOption[] => {
  const current = findMenu(menus, draft.id)
  const excluded = new Set(
    current ? flattenMenus([current]).map(menu => menu.id) : []
  )
  const visit = (nodes: MenuData[]): TreeSelectOption[] =>
    nodes.flatMap(menu => {
      if (excluded.has(menu.id) || menu.type === 'button') return []
      const eligible =
        draft.type === 'button'
          ? menu.type === 'menu'
          : menu.type === 'directory'
      const children = visit(menu.children || [])
      return [
        {
          key: menu.id,
          label: menu.name,
          disabled: !eligible,
          children: children.length ? children : undefined,
        },
      ]
    })
  return visit(menus)
}
