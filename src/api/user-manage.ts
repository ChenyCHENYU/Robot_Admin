/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\user-manage.ts
 * @Description: 用户接口适配：远端请求与演示 CRUD 共享契约，变更只在适配器内完成
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ApiResponse, PageResult } from './management.contract'

import {
  deleteData,
  getData,
  postData,
  putData,
} from '@robot-admin/request-core/axios'
import { isMockDataMode } from '@/config/dataMode'
import { delayWithSignal } from '@/utils/abort'
import {
  getMockDirectoryUser,
  upsertMockDirectoryUser,
  removeMockDirectoryUser,
  validateMockMemberships,
} from './auth.mock-directory'
import type {
  UserData,
  UserFormData,
  UserListParams,
  DeptData,
  RoleData,
} from './user-manage.contract'
import {
  MOCK_USER_DATA,
  MOCK_DEPT_DATA,
  MOCK_ROLE_DATA,
  persistMockUsers,
  getDeptNameById,
  getRoleNameById,
} from './user-manage.mock'

const snapshotUserForm = (data: UserFormData): UserFormData => ({
  ...data,
  roleIds: [...data.roleIds],
  memberships: data.memberships.map(item => ({ ...item })),
})
const requireMockUser = (id: string): UserData => {
  const user = MOCK_USER_DATA.find(item => item.id === id)
  if (!user) throw new Error('用户不存在')
  return user
}
const validateNewUsername = (username: string): void => {
  if (
    MOCK_USER_DATA.some(
      user => user.username.toLowerCase() === username.toLowerCase()
    ) ||
    getMockDirectoryUser(username)
  )
    throw new Error('用户名已存在')
}
const optionalText = (value: string | null) => value || undefined

const buildUserRecord = (
  draft: UserFormData,
  existing?: UserData
): UserData => ({
  ...existing,
  id: existing?.id ?? `user_${crypto.randomUUID()}`,
  username: existing?.username ?? draft.username,
  nickname: draft.nickname,
  email: optionalText(draft.email),
  phone: optionalText(draft.phone),
  userType: draft.userType,
  deptId: optionalText(draft.deptId),
  deptName: draft.deptId ? getDeptNameById(draft.deptId) : undefined,
  roleIds: [...draft.roleIds],
  roleNames: draft.roleIds.map(getRoleNameById),
  status: draft.status,
  remark: optionalText(draft.remark),
  companyName: optionalText(draft.companyName),
  contactPerson: optionalText(draft.contactPerson),
  createTime: existing?.createTime ?? new Date().toLocaleString(),
  updateTime: existing ? new Date().toLocaleString() : undefined,
})

// ==================== 工具函数 ====================
const createMockApi = async <T>(
  data: T,
  delay = 500,
  signal?: AbortSignal
): Promise<ApiResponse<T>> => {
  await delayWithSignal(delay, signal)
  return { code: '0', data: structuredClone(data), msg: '成功' }
}

const filterUsers = (users: UserData[], params: UserListParams): UserData[] => {
  let filtered = [...users]

  // 关键词搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      user =>
        user.username.toLowerCase().includes(keyword) ||
        user.nickname.toLowerCase().includes(keyword) ||
        (user.email && user.email.toLowerCase().includes(keyword))
    )
  }

  // 状态筛选
  if (params.status !== null && params.status !== undefined) {
    filtered = filtered.filter(user => user.status === params.status)
  }

  // 用户类型筛选
  if (params.userType) {
    filtered = filtered.filter(user => user.userType === params.userType)
  }

  // 部门筛选
  if (params.deptId) {
    filtered = filtered.filter(user => user.deptId === params.deptId)
  }

  // 角色筛选
  const { roleId } = params
  if (roleId) {
    filtered = filtered.filter(
      user => user.roleIds && user.roleIds.includes(roleId)
    )
  }

  return filtered
}

const paginateData = <T>(data: T[], page: number, pageSize: number) => {
  const total = data.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = data.slice(start, end)
  return { list, total, page, pageSize }
}

// ==================== API 方法 ====================
export const getUserListApi = async (
  params: UserListParams,
  signal?: AbortSignal
): Promise<ApiResponse<PageResult<UserData>>> => {
  if (!isMockDataMode()) {
    const remoteParams = { ...params }
    delete remoteParams.contextId
    const response = await getData<ApiResponse<PageResult<UserData>>>(
      '/sys/users',
      { params: remoteParams, signal }
    )
    return response
  }
  const companyUsers = params.contextId
    ? MOCK_USER_DATA.filter(user =>
        getMockDirectoryUser(user.username)?.memberships.some(
          item => item.contextId === params.contextId
        )
      )
    : MOCK_USER_DATA
  const filteredUsers = filterUsers(companyUsers, params)
  const paginatedData = paginateData(
    filteredUsers,
    params.page,
    params.pageSize
  )
  return createMockApi(paginatedData, 500, signal)
}

export const getDeptListApi = async (): Promise<ApiResponse<DeptData[]>> => {
  if (isMockDataMode()) return createMockApi(MOCK_DEPT_DATA, 300)
  const response = await getData<ApiResponse<DeptData[]>>('/sys/departments')
  return response
}

export const getUserRolesApi = async (): Promise<ApiResponse<RoleData[]>> => {
  if (isMockDataMode()) return createMockApi(MOCK_ROLE_DATA, 300)
  const response = await getData<ApiResponse<RoleData[]>>('/sys/roles/options')
  return response
}

export const createUserApi = async (data: UserFormData): Promise<void> => {
  if (isMockDataMode()) {
    const draft = snapshotUserForm(data)
    await delayWithSignal(300)
    validateNewUsername(draft.username)
    validateMockMemberships(draft.memberships)
    const user = buildUserRecord(draft)
    upsertMockDirectoryUser({
      username: user.username,
      enabled: user.status === 1,
      memberships: draft.memberships,
    })
    MOCK_USER_DATA.push(user)
    persistMockUsers()
    return
  }
  const remoteData: Partial<UserFormData> = { ...data }
  delete remoteData.memberships
  await postData('/sys/users', remoteData)
}

export const updateUserApi = async (
  id: string,
  data: UserFormData
): Promise<void> => {
  if (isMockDataMode()) {
    const draft = snapshotUserForm(data)
    await delayWithSignal(300)
    const existing = requireMockUser(id)
    validateMockMemberships(draft.memberships)
    const updated = buildUserRecord(draft, existing)
    upsertMockDirectoryUser({
      username: updated.username,
      enabled: updated.status === 1,
      memberships: draft.memberships,
    })
    MOCK_USER_DATA.splice(MOCK_USER_DATA.indexOf(existing), 1, updated)
    persistMockUsers()
    return
  }
  const remoteData: Partial<UserFormData> = { ...data }
  delete remoteData.memberships
  await putData(`/sys/users/${id}`, remoteData)
}

export const deleteUserApi = async (id: string): Promise<void> => {
  if (isMockDataMode()) {
    await delayWithSignal(250)
    const user = requireMockUser(id)
    removeMockDirectoryUser(user.username)
    MOCK_USER_DATA.splice(MOCK_USER_DATA.indexOf(user), 1)
    persistMockUsers()
    return
  }
  await deleteData(`/sys/users/${id}`)
}

export const updateUserStatusApi = async (
  id: string,
  status: number
): Promise<void> => {
  if (isMockDataMode()) {
    await delayWithSignal(250)
    const user = requireMockUser(id)
    user.status = status
    user.updateTime = new Date().toLocaleString()
    const directory = getMockDirectoryUser(user.username)
    if (directory)
      upsertMockDirectoryUser({ ...directory, enabled: status === 1 })
    persistMockUsers()
    return
  }
  await putData(`/sys/users/${id}/status`, { status })
}

export const resetUserPasswordApi = async (
  id: string,
  password: string
): Promise<void> => {
  if (isMockDataMode()) {
    await createMockApi(undefined, 300)
    return
  }
  await postData(`/sys/users/${id}/reset-password`, { password })
}
