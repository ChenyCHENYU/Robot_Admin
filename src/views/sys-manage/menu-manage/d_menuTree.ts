/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\views\sys-manage\menu-manage\d_menuTree.ts
 * @Description: 菜单检索、父级约束与表单校验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { ButtonPermission, FormData, MenuData } from './data'
import type { TreeSelectOption } from 'naive-ui/es'
import { joinRoutePath } from '@/router/routePath'

export const flattenMenus = (menus: MenuData[]): MenuData[] =>
  menus.flatMap(menu => [menu, ...flattenMenus(menu.children || [])])

export const findMenu = (
  menus: MenuData[],
  id?: string | null
): MenuData | undefined => flattenMenus(menus).find(menu => menu.id === id)

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
  draft: FormData
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

type DraftErrors = Partial<Record<keyof FormData, string>>

const isEligibleParent = (
  type: FormData['type'],
  parent?: MenuData
): boolean =>
  type === 'button'
    ? parent?.type === 'menu'
    : !parent || parent.type === 'directory'

const validateParent = (draft: FormData, menus: MenuData[]): DraftErrors => {
  const current = findMenu(menus, draft.id)
  const parent = findMenu(menus, draft.parentId)
  const descendants = flattenMenus(current ? [current] : [])
  if (
    draft.parentId &&
    (!parent || descendants.some(menu => menu.id === draft.parentId))
  ) {
    return { parentId: '不能选择自身、后代或不存在的节点作为上级' }
  }
  if (!isEligibleParent(draft.type, parent))
    return {
      parentId:
        draft.type === 'button'
          ? '请选择所属菜单页面'
          : '上级只能选择目录，留空为根目录',
    }
  return {}
}

const validatePermission = (
  draft: FormData,
  permissions: ButtonPermission[]
): DraftErrors => {
  if (!/^[\w.-]+(?::[\w.-]+)+$/.test(draft.permission.trim()))
    return { permission: '请输入权限标识，如 sys:menu:add' }
  if (
    permissions.some(
      item =>
        item.id !== draft.id && item.permission === draft.permission.trim()
    )
  )
    return { permission: '权限标识已存在' }
  return {}
}

const validateRoute = (draft: FormData, menus: MenuData[]): DraftErrors => {
  const errors: DraftErrors = {}
  if (
    !draft.path.trim() ||
    /[\s?#]/.test(draft.path) ||
    /^(?:javascript|data):/i.test(draft.path)
  )
    errors.path = '请输入有效路由路径，如 /sys-manage/menu-manage'
  const validComponent =
    /^\/?[\w./-]+$/.test(draft.component.trim()) &&
    !draft.component.includes('..')
  if (draft.type === 'menu' && !validComponent)
    errors.component = '请输入页面组件路径，如 /sys-manage/menu-manage/index'
  if (
    flattenMenus(menus).some(
      menu =>
        menu.id !== draft.id &&
        menu.parentId === draft.parentId &&
        menu.path === draft.path.trim()
    )
  )
    errors.path = '同一目录下的路由路径不能重复'
  return errors
}

export const validateMenuDraft = (
  draft: FormData,
  menus: MenuData[],
  permissions: ButtonPermission[] = []
): DraftErrors => {
  const errors: DraftErrors = {}
  const current = findMenu(menus, draft.id)
  if (!draft.name.trim()) errors.name = '请输入名称'
  if (draft.name.trim().length > 60) errors.name = '名称不能超过 60 个字符'
  if (!Number.isInteger(draft.sort) || draft.sort < 0 || draft.sort > 9999)
    errors.sort = '排序须为 0–9999 的整数'
  if (current && draft.type !== current.type)
    errors.type = '编辑时不能改变菜单类型'
  return {
    ...errors,
    ...validateParent(draft, menus),
    ...(draft.type === 'button'
      ? validatePermission(draft, permissions)
      : validateRoute(draft, menus)),
  }
}
