/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\d_menu.ts
 * @Description: 菜单领域默认草稿、树查询与父级路径权限校验，不依赖页面或 UI
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  MenuFormData,
  MenuData,
  ButtonPermission,
} from './menu-manage.contract'

export const DEFAULT_MENU_FORM_DATA: MenuFormData = {
  name: '',
  type: 'menu',
  parentId: null,
  path: '',
  component: '',
  icon: '',
  permission: '',
  sort: 0,
  status: 1,
  hidden: 0,
  keepAlive: false,
  remark: '',
}

/** 按树顺序展开菜单，供检索与父级约束共用。 */
export const flattenMenus = (menus: MenuData[]): MenuData[] =>
  menus.flatMap(menu => [menu, ...flattenMenus(menu.children || [])])

/** 按稳定菜单 ID 查找节点。 */
export const findMenu = (
  menus: MenuData[],
  id?: string | null
): MenuData | undefined => flattenMenus(menus).find(menu => menu.id === id)

type DraftErrors = Partial<Record<keyof MenuFormData, string>>

const isEligibleParent = (
  type: MenuFormData['type'],
  parent?: MenuData
): boolean =>
  type === 'button'
    ? parent?.type === 'menu'
    : !parent || parent.type === 'directory'

const validateParent = (
  draft: MenuFormData,
  menus: MenuData[]
): DraftErrors => {
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
  draft: MenuFormData,
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

const validateRoute = (draft: MenuFormData, menus: MenuData[]): DraftErrors => {
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

/** 验证父级关系、路径、组件和按钮权限，返回字段级错误。 */
export const validateMenuDraft = (
  draft: MenuFormData,
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
