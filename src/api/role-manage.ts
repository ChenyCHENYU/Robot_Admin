/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\role-manage.ts
 * @Description: 角色查询与变更适配，演示模式与远端模式保持同一契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ApiResponse, PageResult } from './management.contract'
import {
  toTemporaryRoleGrant,
  type RemoteTemporaryRoleGrant,
} from './d_governance'
import { assertMockRevision, requireRevision } from './management-revision'

import {
  deleteData,
  getData,
  postData,
  putData,
} from '@robot-admin/request-core/axios'
import { isMockDataMode } from '@/config/dataMode'
import { delayWithSignal } from '@/utils/abort'
import type {
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
    revision: (MOCK_ROLE_DATA[index].revision ?? 0) + 1,
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
  const filteredRoles = filterRoles(MOCK_ROLE_DATA, params).map(role => ({
    ...role,
    revision: role.revision ?? 0,
  }))
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

export const getRoleUsersApi = async (
  roleId: string,
  signal?: AbortSignal
): Promise<ApiResponse<RoleUserData[]>> => {
  if (!isMockDataMode()) {
    const response = await getData<
      ApiResponse<
        Array<{
          id: string
          username: string
          name?: string
          status: string | number
          createTime?: string
        }>
      >
    >(`/sys/roles/${roleId}/users`, { signal })
    return {
      ...response,
      data: response.data.map(user => ({
        ...user,
        nickname: user.name ?? user.username,
        status: user.status === 1 || user.status === 'active' ? 1 : 0,
        createTime: user.createTime ?? '—',
      })),
    }
  }
  return createMockApi(getUsersByRoleId(roleId), 300, signal)
}

/** 当前角色的数据范围摘要。 */
export const getRoleDataScopesApi = async (
  roleId: string,
  signal?: AbortSignal
): Promise<ApiResponse<RoleDataScope[]>> => {
  if (isMockDataMode())
    return createMockApi(MOCK_ROLE_DATA_SCOPES[roleId] || [], 250, signal)
  const response = await getData<ApiResponse<RoleDataScope[]>>(
    `/sys/roles/${roleId}/data-scopes`,
    { signal }
  )
  return {
    ...response,
    data: response.data.map(row => ({
      ...row,
      moduleName:
        row.moduleName || (row.module === '*' ? '所有模块' : row.module),
    })),
  }
}

/** 角色抽屉显示向成员授予本角色的时间窗口，与治理页保持相同事实。 */
export const getRoleTempAuthorizationsApi = async (
  roleId: string,
  signal?: AbortSignal
): Promise<ApiResponse<RoleTempAuth[]>> => {
  if (isMockDataMode())
    return createMockApi(getRoleTempAuths(roleId), 250, signal)
  const response = await getData<ApiResponse<RemoteTemporaryRoleGrant[]>>(
    `/sys/roles/${roleId}/temp-authorizations`,
    { signal }
  )
  return {
    ...response,
    data: response.data.map(record => {
      const grant = toTemporaryRoleGrant(record)
      return {
        ...grant,
        roleId: record.roleId,
        roleName: record.roleName ?? record.roleId,
        targetRoleId: record.userId,
        targetRoleName: record.userNickname ?? record.userId,
      }
    }),
  }
}

export const createRoleApi = async (data: RoleFormData): Promise<void> => {
  const draft = { ...data, permissionIds: [...data.permissionIds] }
  if (isMockDataMode()) {
    await createMockApi(undefined, 300)
    if (MOCK_ROLE_DATA.some(role => role.code === draft.code))
      throw new Error('角色编码已存在')
    MOCK_ROLE_DATA.push({
      ...draft,
      id: `role_${crypto.randomUUID()}`,
      revision: 0,
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
  draft.revision = requireRevision(data.revision)
  if (draft.permissionIds) draft.permissionIds = [...draft.permissionIds]
  if ('permissionNames' in draft && draft.permissionNames)
    draft.permissionNames = [...draft.permissionNames]
  if (isMockDataMode()) {
    await createMockApi(undefined, 300)
    assertMockRevision(
      MOCK_ROLE_DATA.find(role => role.id === id)?.revision,
      draft.revision
    )
    updateRoleInList(id, draft)
    return
  }
  await putData(`/sys/roles/${id}`, draft)
}

export const deleteRoleApi = async (
  id: string,
  expectedRevision?: number
): Promise<void> => {
  const revision = requireRevision(expectedRevision)
  if (isMockDataMode()) {
    await createMockApi(undefined, 250)
    const index = MOCK_ROLE_DATA.findIndex(role => role.id === id)
    if (index < 0) throw new Error('角色不存在')
    assertMockRevision(MOCK_ROLE_DATA[index].revision, revision)
    MOCK_ROLE_DATA.splice(index, 1)
    return
  }
  await deleteData(`/sys/roles/${id}`, {
    params: { expectedRevision: revision },
  })
}

export const updateRoleStatusApi = async (
  id: string,
  status: number,
  expectedRevision?: number
): Promise<void> => {
  const revision = requireRevision(expectedRevision)
  if (status !== 0 && status !== 1) throw new Error('角色状态只能是 0 或 1')
  if (isMockDataMode()) return updateRoleApi(id, { status, revision })
  await putData(`/sys/roles/${id}/status`, {
    status,
    expectedRevision: revision,
  })
}

export const updateRolePermissionsApi = async (
  id: string,
  permissionIds: string[],
  expectedRevision?: number
): Promise<void> => {
  const revision = requireRevision(expectedRevision)
  const ids = [...permissionIds]
  if (isMockDataMode()) {
    await createMockApi(undefined, 300)
    assertMockRevision(
      MOCK_ROLE_DATA.find(role => role.id === id)?.revision,
      revision
    )
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
  await putData(`/sys/roles/${id}/permissions`, {
    permissionIds: ids,
    revision,
  })
}

/** 公司角色成员由数据库分页并返回真实总数，启停状态同时考虑账号和成员。 */
export const getRoleUsersPageApi = async (
  roleId: string,
  query: { page: number; pageSize: number },
  signal?: AbortSignal
): Promise<ApiResponse<PageResult<RoleUserData>>> => {
  if (isMockDataMode())
    return createMockApi(
      paginateData(getUsersByRoleId(roleId), query.page, query.pageSize),
      300,
      signal
    )
  const response = await getData<
    ApiResponse<
      PageResult<{
        id: string
        username: string
        name?: string
        status: string | number
      }>
    >
  >(`/sys/roles/${roleId}/users/page`, { params: query, signal })
  return {
    ...response,
    data: {
      ...response.data,
      list: response.data.list.map(user => ({
        ...user,
        nickname: user.name ?? user.username,
        status: user.status === 1 || user.status === 'active' ? 1 : 0,
        createTime: '—',
      })),
    },
  }
}
