/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\user-manage.ts
 * @Description: 用户接口适配：远端请求与演示 CRUD 共享契约，变更只在适配器内完成
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ApiResponse, PageResult } from './management.contract'
import { assertMockRevision, requireRevision } from './management-revision'

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
  revision: existing ? (existing.revision ?? 0) + 1 : 0,
  membershipRevision: existing ? (existing.membershipRevision ?? 0) + 1 : 0,
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
  const scopedUsers = companyUsers.map(user => {
    const directory = getMockDirectoryUser(user.username)
    const member = directory?.memberships.find(item =>
      params.contextId ? item.contextId === params.contextId : item.isPrimary
    )
    const department =
      member && Object.prototype.hasOwnProperty.call(member, 'departmentId')
        ? member.departmentId
        : member?.isPrimary
          ? user.deptId
          : undefined
    return {
      ...user,
      revision: user.revision ?? 0,
      membershipRevision: member?.revision ?? user.membershipRevision ?? 0,
      status:
        member?.enabled === undefined ? user.status : member.enabled ? 1 : 0,
      accountStatus: directory ? Number(directory.enabled) : user.accountStatus,
      deptId: department || undefined,
      deptName: department ? getDeptNameById(department) : undefined,
    }
  })
  const filteredUsers = filterUsers(scopedUsers, params)
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
      enabled: true,
      memberships: draft.memberships.map(member =>
        member.contextId ===
        (draft.contextId ??
          draft.memberships.find(item => item.isPrimary)?.contextId)
          ? {
              ...member,
              departmentId: draft.deptId,
              enabled: draft.status === 1,
              revision: 0,
            }
          : {
              ...member,
              enabled: member.enabled ?? true,
              revision: member.revision ?? 0,
            }
      ),
    })
    MOCK_USER_DATA.push(user)
    persistMockUsers()
    return
  }
  const remoteData = {
    username: data.username,
    nickname: data.nickname,
    email: data.email === '' ? null : data.email,
    phone: data.phone === '' ? null : data.phone,
    departmentId: data.deptId,
    password: data.password,
    roleIds: [...data.roleIds],
    status: data.status,
    revision: data.revision,
    membershipRevision: data.membershipRevision,
  }
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
    assertMockRevision(existing.revision, draft.revision)
    const currentDirectory = getMockDirectoryUser(existing.username)
    const currentMember = currentDirectory?.memberships.find(member =>
      draft.contextId ? member.contextId === draft.contextId : member.isPrimary
    )
    assertMockRevision(
      currentMember?.revision ?? existing.membershipRevision,
      draft.membershipRevision
    )
    validateMockMemberships(draft.memberships)
    const updated = buildUserRecord(draft, existing)
    upsertMockDirectoryUser({
      username: updated.username,
      enabled: currentDirectory?.enabled ?? true,
      memberships: draft.memberships.map(member =>
        member.contextId ===
        (draft.contextId ??
          draft.memberships.find(item => item.isPrimary)?.contextId)
          ? {
              ...member,
              departmentId: draft.deptId,
              enabled: draft.status === 1,
              revision: requireRevision(draft.membershipRevision) + 1,
            }
          : {
              ...member,
              enabled: member.enabled ?? true,
              revision: member.revision ?? 0,
            }
      ),
    })
    MOCK_USER_DATA.splice(MOCK_USER_DATA.indexOf(existing), 1, updated)
    persistMockUsers()
    return
  }
  const remoteData = {
    username: data.username,
    nickname: data.nickname,
    email: data.email === '' ? null : data.email,
    phone: data.phone === '' ? null : data.phone,
    departmentId: data.deptId,
    password: data.password,
    roleIds: [...data.roleIds],
    status: data.status,
    revision: data.revision,
    membershipRevision: data.membershipRevision,
  }
  remoteData.revision = requireRevision(data.revision)
  remoteData.membershipRevision = requireRevision(data.membershipRevision)
  await putData(`/sys/users/${id}`, remoteData)
}

export const deleteUserApi = async (
  id: string,
  expectedRevision?: number,
  contextId?: string
): Promise<void> => {
  const revision = requireRevision(expectedRevision)
  if (isMockDataMode()) {
    await delayWithSignal(250)
    const user = requireMockUser(id)
    const directory = getMockDirectoryUser(user.username)
    const member = directory?.memberships.find(item =>
      contextId ? item.contextId === contextId : item.isPrimary
    )
    assertMockRevision(member?.revision ?? user.membershipRevision, revision)
    const memberships =
      directory?.memberships.filter(
        item => item.contextId !== member?.contextId
      ) ?? []
    if (directory && memberships.length) {
      if (!memberships.some(item => item.isPrimary))
        memberships[0].isPrimary = true
      upsertMockDirectoryUser({ ...directory, memberships })
    } else {
      removeMockDirectoryUser(user.username)
      MOCK_USER_DATA.splice(MOCK_USER_DATA.indexOf(user), 1)
    }
    persistMockUsers()
    return
  }
  await deleteData(`/sys/users/${id}`, {
    params: { expectedRevision: revision },
  })
}

export const updateUserStatusApi = async (
  id: string,
  status: number,
  expectedRevision?: number,
  contextId?: string
): Promise<void> => {
  const revision = requireRevision(expectedRevision)
  if (status !== 0 && status !== 1) throw new Error('用户状态只能是 0 或 1')
  if (isMockDataMode()) {
    await delayWithSignal(250)
    const user = requireMockUser(id)
    const directory = getMockDirectoryUser(user.username)
    if (!directory) throw new Error('用户公司归属缺失，请先编辑用户并关联公司')
    const member = directory.memberships.find(item =>
      contextId ? item.contextId === contextId : item.isPrimary
    )
    if (!member) throw new Error('当前公司成员不存在')
    assertMockRevision(member.revision ?? user.membershipRevision, revision)
    upsertMockDirectoryUser({
      ...directory,
      memberships: directory.memberships.map(item =>
        item.contextId === member.contextId
          ? { ...item, enabled: status === 1, revision: revision + 1 }
          : item
      ),
    })
    user.status = status
    user.membershipRevision = revision + 1
    user.updateTime = new Date().toLocaleString()
    persistMockUsers()
    return
  }
  await putData(`/sys/users/${id}/status`, {
    status,
    expectedRevision: revision,
  })
}

export const resetUserPasswordApi = async (
  id: string,
  password: string,
  expectedRevision?: number,
  expectedMembershipRevision?: number,
  contextId?: string
): Promise<void> => {
  const revision = requireRevision(expectedRevision)
  const membershipRevision = requireRevision(expectedMembershipRevision)
  if (isMockDataMode()) {
    await createMockApi(undefined, 300)
    const user = requireMockUser(id)
    const member = getMockDirectoryUser(user.username)?.memberships.find(
      item => (contextId ? item.contextId === contextId : item.isPrimary)
    )
    assertMockRevision(user.revision, revision)
    assertMockRevision(
      member?.revision ?? user.membershipRevision,
      membershipRevision
    )
    user.revision = revision + 1
    persistMockUsers()
    return
  }
  await postData(`/sys/users/${id}/reset-password`, {
    password,
    expectedRevision: revision,
    expectedMembershipRevision: membershipRevision,
  })
}
