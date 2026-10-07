/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\role-manage.ts
 * @Description: 角色查询与变更适配，演示模式与远端模式保持同一契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  deleteData,
  getData,
  postData,
  putData,
} from '@robot-admin/request-core/axios'
import { isMockDataMode } from '@/config/dataMode'
import { delayWithSignal } from '@/utils/abort'
import type {
  ApiResponse,
  PageResult,
  RoleData,
  RoleFormData,
  RoleListParams,
  RoleUserData,
  PermissionData,
  RoleDataScope,
  RoleTempAuth,
} from './role-manage.contract'
import {
  MOCK_ROLE_DATA,
  MOCK_PERMISSION_DATA,
  MOCK_USER_DATA,
  MOCK_ROLE_DATA_SCOPES,
  getRoleTempAuths,
} from './role-manage.mock'

const updateRoleInList = (roleId: string, updates: Partial<RoleData>) => {
  const index = MOCK_ROLE_DATA.findIndex(item => item.id === roleId)
  if (index < 0) throw new Error('角色不存在')
  MOCK_ROLE_DATA[index] = {
    ...MOCK_ROLE_DATA[index],
    ...updates,
    updateTime: new Date().toLocaleString(),
  }
}

const createMockApi = async <T>(
  data: T,
  delay = 500,
  signal?: AbortSignal
): Promise<ApiResponse<T>> => {
  await delayWithSignal(delay, signal)
  return { code: '0', data: structuredClone(data), msg: '成功' }
}

const filterRoles = (roles: RoleData[], params: RoleListParams): RoleData[] => {
  let filtered = [...roles]

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      role =>
        role.name.toLowerCase().includes(keyword) ||
        role.code.toLowerCase().includes(keyword) ||
        (role.description && role.description.toLowerCase().includes(keyword))
    )
  }

  if (params.status !== null && params.status !== undefined) {
    filtered = filtered.filter(role => role.status === params.status)
  }

  if (params.type) {
    filtered = filtered.filter(role => role.type === params.type)
  }

  return filtered
}

const paginateData = <T>(
  data: T[],
  page: number,
  pageSize: number
): PageResult<T> => {
  const total = data.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = data.slice(start, end)
  return { list, total, page, pageSize }
}

// 角色用户映射关系
const getRoleUserMapping = (): Record<string, string[]> => ({
  role_1: ['user_1'], // 超级管理员
  role_2: ['user_2', 'user_3', 'user_4'], // 系统管理员
  role_3: [
    'user_5',
    'user_6',
    'user_7',
    'user_8',
    'user_9',
    'user_10',
    'user_11',
    'user_12',
  ], // 内容编辑员
  role_4: ['user_13', 'user_14', 'user_15', 'user_16', 'user_17'], // 数据分析师
  role_5: [], // 测试角色
})

const getUsersByRoleId = (roleId: string): RoleUserData[] => {
  const roleUserMapping = getRoleUserMapping()
  const userIds = roleUserMapping[roleId] || []
  return MOCK_USER_DATA.filter(user => userIds.includes(user.id))
}

// ==================== API 方法 ====================
export const getRoleListApi = async (
  params: RoleListParams,
  signal?: AbortSignal
): Promise<ApiResponse<PageResult<RoleData>>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<PageResult<RoleData>>>('/sys/roles', {
      params: { ...params },
      signal,
    })
  }
  const filteredRoles = filterRoles(MOCK_ROLE_DATA, params)
  const paginatedData = paginateData(
    filteredRoles,
    params.page,
    params.pageSize
  )
  return createMockApi(paginatedData, 500, signal)
}

export const getPermissionListApi = async (): Promise<
  ApiResponse<PermissionData[]>
> =>
  isMockDataMode()
    ? createMockApi(MOCK_PERMISSION_DATA, 300)
    : getData<ApiResponse<PermissionData[]>>('/sys/permissions/tree')

export const getRoleDetailApi = async (
  id: string
): Promise<ApiResponse<RoleData>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<RoleData>>(`/sys/roles/${id}`)
  }
  const role = MOCK_ROLE_DATA.find(r => r.id === id)
  if (!role) {
    return Promise.reject(new Error('角色不存在'))
  }
  return createMockApi(role, 300)
}

export const getRoleUsersApi = async (
  roleId: string,
  signal?: AbortSignal
): Promise<ApiResponse<RoleUserData[]>> => {
  if (!isMockDataMode()) {
    return getData<ApiResponse<RoleUserData[]>>(`/sys/roles/${roleId}/users`, {
      signal,
    })
  }
  const users = getUsersByRoleId(roleId)
  return createMockApi(users, 300, signal)
}

export const getRoleDataScopesApi = (
  roleId: string,
  signal?: AbortSignal
): Promise<ApiResponse<RoleDataScope[]>> =>
  isMockDataMode()
    ? createMockApi(MOCK_ROLE_DATA_SCOPES[roleId] || [], 250, signal)
    : getData<ApiResponse<RoleDataScope[]>>(
        `/sys/roles/${roleId}/data-scopes`,
        { signal }
      )

export const getRoleTempAuthorizationsApi = (
  roleId: string,
  signal?: AbortSignal
): Promise<ApiResponse<RoleTempAuth[]>> =>
  isMockDataMode()
    ? createMockApi(getRoleTempAuths(roleId), 250, signal)
    : getData<ApiResponse<RoleTempAuth[]>>(
        `/sys/roles/${roleId}/temp-authorizations`,
        { signal }
      )

export const createRoleApi = async (data: RoleFormData): Promise<void> => {
  const draft = { ...data, permissionIds: [...data.permissionIds] }
  if (isMockDataMode()) {
    await createMockApi(undefined, 300)
    if (MOCK_ROLE_DATA.some(role => role.code === draft.code))
      throw new Error('角色编码已存在')
    MOCK_ROLE_DATA.push({
      ...draft,
      id: `role_${crypto.randomUUID()}`,
      permissionNames: [],
      userCount: 0,
      createTime: new Date().toLocaleString(),
    })
    return
  }
  await postData('/sys/roles', draft)
}

export const updateRoleApi = async (
  id: string,
  data: Partial<RoleData> | RoleFormData
): Promise<void> => {
  const draft = { ...data }
  if (draft.permissionIds) draft.permissionIds = [...draft.permissionIds]
  if ('permissionNames' in draft && draft.permissionNames)
    draft.permissionNames = [...draft.permissionNames]
  if (isMockDataMode()) {
    await createMockApi(undefined, 300)
    updateRoleInList(id, draft)
    return
  }
  await putData(`/sys/roles/${id}`, draft)
}

export const deleteRoleApi = async (id: string): Promise<void> => {
  if (isMockDataMode()) {
    await createMockApi(undefined, 250)
    const index = MOCK_ROLE_DATA.findIndex(role => role.id === id)
    if (index < 0) throw new Error('角色不存在')
    MOCK_ROLE_DATA.splice(index, 1)
    return
  }
  await deleteData(`/sys/roles/${id}`)
}

export const updateRoleStatusApi = async (
  id: string,
  status: number
): Promise<void> => updateRoleApi(id, { status })

export const updateRolePermissionsApi = async (
  id: string,
  permissionIds: string[]
): Promise<void> => {
  const ids = [...permissionIds]
  if (isMockDataMode()) {
    await createMockApi(undefined, 300)
    const names = new Map<string, string>()
    const collectNames = (items: PermissionData[]) => {
      for (const item of items) {
        names.set(item.id, item.name)
        if (item.children) collectNames(item.children)
      }
    }
    collectNames(MOCK_PERMISSION_DATA)
    updateRoleInList(id, {
      permissionIds: ids,
      permissionNames: ids
        .map(id => names.get(id))
        .filter((name): name is string => Boolean(name)),
    })
    return
  }
  await putData(`/sys/roles/${id}/permissions`, { permissionIds: ids })
}
