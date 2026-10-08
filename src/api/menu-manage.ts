/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\menu-manage.ts
 * @Description: 菜单和按钮权限请求适配，隔离远端与演示 CRUD 并按公司保存缓存策略
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ApiResponse } from './management.contract'
import type {
  MenuData,
  MenuFormData,
  ButtonPermission,
  MenuDropPosition,
} from './menu-manage.contract'
import {
  getData,
  postData,
  putData,
  deleteData,
} from '@robot-admin/request-core/axios'
import { isMockDataMode } from '@/config/dataMode'
import { delayWithSignal } from '@/utils/abort'
import {
  getMockMenuCachePolicy,
  setMockMenuCachePolicy,
} from './menu-cache.mock'
import { validateMenuDraft, DEFAULT_MENU_FORM_DATA } from './d_menu'
import {
  MOCK_BUTTON_PERMISSIONS,
  getMockMenuData,
  cloneMenus,
  findMockMenu,
  removeMockMenu,
  collectMenuIds,
  findMockMenuLocation,
  normalizeMockMenuSort,
} from './menu-manage.mock'

/** 读取菜单树，演示缓存策略按公司上下文隔离。 */
export const getMenuListApi = async (
  signal?: AbortSignal,
  contextId = 'default'
): Promise<ApiResponse<MenuData[]>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<MenuData[]>>('/sys/menus', { signal })
  }
  await delayWithSignal(300, signal)
  const policy = getMockMenuCachePolicy(contextId)
  const applyPolicy = (menus: MenuData[]): MenuData[] =>
    menus.map(menu => ({
      ...menu,
      keepAlive:
        menu.type === 'menu' &&
        (Object.prototype.hasOwnProperty.call(policy, menu.id)
          ? policy[menu.id]
          : menu.keepAlive),
      children: menu.children ? applyPolicy(menu.children) : undefined,
    }))
  return {
    code: '0',
    data: applyPolicy(cloneMenus(getMockMenuData())),
    msg: '成功',
  }
}

/** 读取指定页面或全部按钮权限。 */
export const getButtonPermissionsApi = async (
  menuId?: string,
  signal?: AbortSignal
): Promise<ApiResponse<ButtonPermission[]>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<ButtonPermission[]>>(
      menuId ? `/sys/menus/${menuId}/buttons` : '/sys/menu-buttons',
      { signal }
    )
  }
  await delayWithSignal(200, signal)
  const filteredPermissions = menuId
    ? MOCK_BUTTON_PERMISSIONS.filter(btn => btn.menuId === menuId)
    : MOCK_BUTTON_PERMISSIONS
  return {
    code: '0',
    data: filteredPermissions.map(permission => ({ ...permission })),
    msg: '成功',
  }
}

/** 保存调用时的菜单草稿，远端业务拒绝直接抛错。 */
export const addMenuApi = async (data: MenuFormData): Promise<void> => {
  const draft = { ...data }
  if (!isMockDataMode()) {
    await checkMenuMutation(postData('/sys/menus', draft))
    return
  }
  await delayWithSignal(300)
  assertValidDraft(draft)
  const record: MenuData = {
    ...draft,
    id: `menu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    children: draft.type === 'directory' ? [] : undefined,
  }
  if (draft.parentId) {
    const parent = findMockMenu(draft.parentId)
    if (!parent) throw new Error('上级菜单不存在')
    parent.children = [...(parent.children || []), record]
  } else {
    getMockMenuData().push(record)
  }
}

const relocateMockMenu = (current: MenuData, parentId: string | null): void => {
  if (current.parentId !== parentId) {
    const oldLocation = findMockMenuLocation(current.id)!
    const destination = parentId ? findMockMenu(parentId)! : null
    oldLocation.list.splice(oldLocation.index, 1)
    normalizeMockMenuSort(oldLocation.list)
    const target = destination
      ? (destination.children ||= [])
      : getMockMenuData()
    target.push(current)
  }
}

/** 更新菜单及公司页面缓存策略，移动保留子节点。 */
export const updateMenuApi = async (
  data: MenuFormData,
  contextId = 'default'
): Promise<void> => {
  const draft = { ...data }
  if (!isMockDataMode()) {
    if (!draft.id) throw new Error('更新菜单缺少 id')
    await checkMenuMutation(putData(`/sys/menus/${draft.id}`, draft))
    return
  }
  await delayWithSignal(300)
  if (!draft.id) throw new Error('更新菜单缺少 id')
  assertValidDraft(draft)
  const current = findMockMenu(draft.id)
  if (!current) throw new Error('菜单不存在')
  relocateMockMenu(current, draft.parentId)
  // 缓存策略属于公司上下文，不写入共享演示目录。
  const { keepAlive, ...fields } = draft
  Object.assign(current, fields)
  setMockMenuCachePolicy(
    contextId,
    current.id,
    current.type === 'menu' && keepAlive
  )
}

/** 删除菜单及下级按钮权限。 */
export const deleteMenuApi = async (id: string): Promise<void> => {
  if (!isMockDataMode()) {
    await checkMenuMutation(deleteData(`/sys/menus/${id}`))
    return
  }
  await delayWithSignal(250)
  const current = findMockMenu(id)
  if (!current) throw new Error('菜单不存在')
  const removedIds = new Set(collectMenuIds(current))
  if (!removeMockMenu(id)) throw new Error('菜单不存在')
  for (let index = MOCK_BUTTON_PERMISSIONS.length - 1; index >= 0; index--) {
    const menuId = MOCK_BUTTON_PERMISSIONS[index]?.menuId
    if (menuId && removedIds.has(menuId)) {
      MOCK_BUTTON_PERMISSIONS.splice(index, 1)
    }
  }
}

const validateMockMove = (
  dragId: string,
  targetId: string,
  position: MenuDropPosition
) => {
  const dragMenu = findMockMenu(dragId)
  const targetMenu = findMockMenu(targetId)
  if (!dragMenu || !targetMenu) throw new Error('拖拽菜单不存在')
  if (dragId === targetId || collectMenuIds(dragMenu).includes(targetId)) {
    throw new Error('不能将菜单移动到自身或其子菜单')
  }
  if (position === 'inside' && targetMenu.type !== 'directory') {
    throw new Error('菜单只能拖入目录，不能拖入页面')
  }

  const dragLocation = findMockMenuLocation(dragId)
  if (!dragLocation) throw new Error('拖拽菜单位置无效')
  return { dragMenu, targetMenu, dragLocation }
}

const moveMockMenu = (
  dragId: string,
  targetId: string,
  position: MenuDropPosition
): void => {
  const { dragMenu, targetMenu, dragLocation } = validateMockMove(
    dragId,
    targetId,
    position
  )
  dragLocation.list.splice(dragLocation.index, 1)
  normalizeMockMenuSort(dragLocation.list)

  if (position === 'inside') {
    targetMenu.children = [...(targetMenu.children || []), dragMenu]
    dragMenu.parentId = targetMenu.id
    normalizeMockMenuSort(targetMenu.children)
    return
  }

  const targetLocation = findMockMenuLocation(targetId)
  if (!targetLocation) throw new Error('目标菜单位置无效')
  const insertIndex = targetLocation.index + (position === 'after' ? 1 : 0)
  dragMenu.parentId = targetMenu.parentId
  targetLocation.list.splice(insertIndex, 0, dragMenu)
  normalizeMockMenuSort(targetLocation.list)
}

/** 调整菜单顺序或所属目录，自身与后代关系禁止移动。 */
export const moveMenuApi = async (
  dragId: string,
  targetId: string,
  position: MenuDropPosition
): Promise<void> => {
  if (!isMockDataMode()) {
    await checkMenuMutation(
      putData(`/sys/menus/${dragId}/move`, { targetId, position })
    )
    return
  }

  await delayWithSignal(200)
  moveMockMenu(dragId, targetId, position)
}

/** 新增按钮权限并校验页面归属。 */
export const addButtonPermissionApi = async (
  data: Omit<ButtonPermission, 'id'>
): Promise<void> => {
  const draft = { ...data }
  if (!isMockDataMode()) {
    await checkMenuMutation(
      postData(`/sys/menus/${draft.menuId}/buttons`, draft)
    )
    return
  }
  await delayWithSignal(250)
  assertValidPermission(draft)
  MOCK_BUTTON_PERMISSIONS.push({
    ...draft,
    id: `btn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  })
}

/** 保存按钮权限快照。 */
export const updateButtonPermissionApi = async (
  data: ButtonPermission
): Promise<void> => {
  const draft = { ...data }
  if (!isMockDataMode()) {
    await checkMenuMutation(putData(`/sys/menu-buttons/${draft.id}`, draft))
    return
  }
  await delayWithSignal(250)
  assertValidPermission(draft)
  const index = MOCK_BUTTON_PERMISSIONS.findIndex(item => item.id === draft.id)
  if (index < 0) throw new Error('按钮权限不存在')
  MOCK_BUTTON_PERMISSIONS[index] = { ...draft }
}

/** 删除指定按钮权限。 */
export const deleteButtonPermissionApi = async (id: string): Promise<void> => {
  if (!isMockDataMode()) {
    await checkMenuMutation(deleteData(`/sys/menu-buttons/${id}`))
    return
  }
  await delayWithSignal(200)
  const index = MOCK_BUTTON_PERMISSIONS.findIndex(item => item.id === id)
  if (index < 0) throw new Error('按钮权限不存在')
  MOCK_BUTTON_PERMISSIONS.splice(index, 1)
}

const assertValidDraft = (data: MenuFormData): void => {
  const error = Object.values(validateMenuDraft(data, getMockMenuData()))[0]
  if (error) throw new Error(error)
}

const assertValidPermission = (
  data: Omit<ButtonPermission, 'id'> & { id?: string }
): void => {
  const error = Object.values(
    validateMenuDraft(
      {
        ...DEFAULT_MENU_FORM_DATA,
        ...data,
        type: 'button',
        parentId: data.menuId,
      },
      getMockMenuData(),
      MOCK_BUTTON_PERMISSIONS
    )
  )[0]
  if (error) throw new Error(error)
}

/** 兼容空响应；有业务状态码时必须成功，避免保存失败却弹出成功提示。 */
export const checkMenuMutation = async (
  request: Promise<unknown>
): Promise<void> => {
  const response = await request
  if (!response || typeof response !== 'object' || !('code' in response)) return
  const result = response as { code: unknown; msg?: string; message?: string }
  if (!['0', '200'].includes(String(result.code)))
    throw new Error(result.msg || result.message || '操作失败，请重试')
}
