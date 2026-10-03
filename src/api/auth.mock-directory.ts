/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-03
 * @FilePath: \Robot_Admin\src\api\auth.mock-directory.ts
 * @Description: 演示账号的公司归属目录，仅供前端 Mock 使用
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { AuthContext } from './auth.contract'

export type MockCompanyRole =
  'platform-admin' | 'operations-manager' | 'auditor'
export interface MockCompanyMembership {
  contextId: string
  isPrimary: boolean
  roleId: MockCompanyRole
}
export interface MockDirectoryUser {
  username: string
  enabled: boolean
  memberships: MockCompanyMembership[]
}

const STORAGE_KEY = 'robot-admin:mock-enterprise-directory:v2'
const LEGACY_STORAGE_KEY = 'robot-admin:mock-enterprise-directory:v1'
const LEGACY_CONTEXT_IDS: Record<string, string> = {
  'starlab-shanghai': 'jinheng-nanjing',
  'starlab-suzhou': 'jinheng-xian',
  'northstar-hangzhou': 'tianzhi-xian',
}

const COMPANY_CATALOG = [
  {
    id: 'jinheng-nanjing',
    tenantId: 'jiangsu-jinheng',
    tenantName: '江苏金恒',
    companyId: 'nanjing',
    companyName: '江苏金恒（南京）',
  },
  {
    id: 'jinheng-xian',
    tenantId: 'jiangsu-jinheng',
    tenantName: '江苏金恒',
    companyId: 'xian',
    companyName: '江苏金恒（西安）',
  },
  {
    id: 'tianzhi-xian',
    tenantId: 'xian-tianzhi',
    tenantName: '西安天智',
    companyId: 'xian',
    companyName: '西安天智',
  },
] as const

const ROLE_NAMES: Record<MockCompanyRole, string> = {
  'platform-admin': '企业管理员',
  'operations-manager': '运营经理',
  auditor: '只读审计',
}

const seedUsers: MockDirectoryUser[] = [
  {
    username: 'CHENY',
    enabled: true,
    memberships: [
      {
        contextId: 'jinheng-nanjing',
        isPrimary: true,
        roleId: 'platform-admin',
      },
      {
        contextId: 'jinheng-xian',
        isPrimary: false,
        roleId: 'operations-manager',
      },
      { contextId: 'tianzhi-xian', isPrimary: false, roleId: 'auditor' },
    ],
  },
  {
    username: 'STAFF',
    enabled: true,
    memberships: [
      { contextId: 'tianzhi-xian', isPrimary: true, roleId: 'auditor' },
    ],
  },
  {
    username: 'admin',
    enabled: true,
    memberships: [
      {
        contextId: 'jinheng-nanjing',
        isPrimary: true,
        roleId: 'platform-admin',
      },
    ],
  },
  {
    username: 'zhangsan',
    enabled: true,
    memberships: [
      {
        contextId: 'jinheng-nanjing',
        isPrimary: true,
        roleId: 'operations-manager',
      },
      {
        contextId: 'jinheng-xian',
        isPrimary: false,
        roleId: 'operations-manager',
      },
    ],
  },
  {
    username: 'lisi',
    enabled: false,
    memberships: [
      {
        contextId: 'jinheng-nanjing',
        isPrimary: true,
        roleId: 'operations-manager',
      },
    ],
  },
  {
    username: 'wangwu',
    enabled: true,
    memberships: [
      { contextId: 'tianzhi-xian', isPrimary: true, roleId: 'auditor' },
    ],
  },
  {
    username: 'customer001',
    enabled: true,
    memberships: [
      { contextId: 'tianzhi-xian', isPrimary: true, roleId: 'auditor' },
    ],
  },
]

const cloneUser = (user: MockDirectoryUser): MockDirectoryUser => ({
  ...user,
  memberships: user.memberships.map(item => ({ ...item })),
})
const isRole = (value: unknown): value is MockCompanyRole =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(ROLE_NAMES, value)
const isValidUser = (value: unknown): value is MockDirectoryUser => {
  if (!value || typeof value !== 'object') return false
  const user = value as Partial<MockDirectoryUser>
  return (
    typeof user.username === 'string' &&
    typeof user.enabled === 'boolean' &&
    Array.isArray(user.memberships) &&
    user.memberships.every(
      item =>
        typeof item?.contextId === 'string' &&
        COMPANY_CATALOG.some(company => company.id === item.contextId) &&
        typeof item.isPrimary === 'boolean' &&
        isRole(item.roleId)
    )
  )
}

/** 旧版演示目录只迁移公司 ID，保留用户的主/兼任及角色选择。 */
const parseStoredUsers = (raw: string | null): MockDirectoryUser[] | null => {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(parsed)) return null
  const migrated = parsed.map(value => {
    if (!value || typeof value !== 'object') return value
    const user = value as Partial<MockDirectoryUser>
    return {
      ...user,
      memberships: Array.isArray(user.memberships)
        ? user.memberships.map(item => ({
            ...item,
            contextId: LEGACY_CONTEXT_IDS[item.contextId] ?? item.contextId,
          }))
        : user.memberships,
    }
  })
  return migrated.every(isValidUser) ? migrated.map(cloneUser) : null
}

/** 仅此模块读写演示目录；真实权限与用户归属必须来自服务端。 */
const readDirectory = (): MockDirectoryUser[] => {
  if (typeof localStorage === 'undefined') return seedUsers.map(cloneUser)
  try {
    const current = parseStoredUsers(localStorage.getItem(STORAGE_KEY))
    if (current) return current
    const previous = parseStoredUsers(localStorage.getItem(LEGACY_STORAGE_KEY))
    if (previous) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(previous))
      } catch {
        // 私密浏览等场景可能禁止写入，仍保留本次读取到的旧目录。
      }
      return previous
    }
    return seedUsers.map(cloneUser)
  } catch {
    return seedUsers.map(cloneUser)
  }
}

const writeDirectory = (users: MockDirectoryUser[]) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  }
}

export const getMockCompanies = () =>
  COMPANY_CATALOG.map(company => ({ ...company }))
export const getMockCompanyRoles = () =>
  Object.entries(ROLE_NAMES).map(([id, name]) => ({
    id: id as MockCompanyRole,
    name,
  }))
export const getMockDirectoryUser = (
  username: string
): MockDirectoryUser | null =>
  readDirectory().find(
    user => user.username.toLowerCase() === username.trim().toLowerCase()
  ) ?? null

export const validateMockMemberships = (
  memberships: MockCompanyMembership[]
): void => {
  if (!memberships.length) throw new Error('请至少关联一个公司')
  if (memberships.filter(item => item.isPrimary).length !== 1)
    throw new Error('必须且只能设置一个主公司')
  if (
    new Set(memberships.map(item => item.contextId)).size !== memberships.length
  )
    throw new Error('同一公司不可重复关联')
  if (
    memberships.some(
      item =>
        !COMPANY_CATALOG.some(company => company.id === item.contextId) ||
        !isRole(item.roleId)
    )
  )
    throw new Error('公司或公司内角色无效')
}

export const upsertMockDirectoryUser = (user: MockDirectoryUser): void => {
  validateMockMemberships(user.memberships)
  const users = readDirectory()
  const index = users.findIndex(
    item => item.username.toLowerCase() === user.username.toLowerCase()
  )
  if (index >= 0) users[index] = cloneUser(user)
  else users.push(cloneUser(user))
  writeDirectory(users)
}

export const removeMockDirectoryUser = (username: string): void => {
  writeDirectory(
    readDirectory().filter(
      user => user.username.toLowerCase() !== username.toLowerCase()
    )
  )
}

export const getMockAuthContexts = (username: string): AuthContext[] => {
  const user = getMockDirectoryUser(username)
  if (!user?.enabled) return []
  return user.memberships.flatMap(membership => {
    const company = COMPANY_CATALOG.find(
      item => item.id === membership.contextId
    )
    if (!company) return []
    return [
      {
        ...company,
        isPrimary: membership.isPrimary,
        roles: [{ id: membership.roleId, name: ROLE_NAMES[membership.roleId] }],
      },
    ]
  })
}
