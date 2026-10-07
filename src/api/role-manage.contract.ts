/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\role-manage.contract.ts
 * @Description: 角色资源请求与响应契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

// ==================== 类型定义 ====================
export type RoleType = 'system' | 'custom' | 'temp'

export type PermissionType = 'menu' | 'button' | 'api'

export interface RoleData {
  id: string
  name: string
  code: string
  type: RoleType
  status: number // 1-正常 0-禁用
  description?: string
  permissionIds?: string[]
  permissionNames?: string[]
  userCount?: number
  sort: number
  createTime: string
  updateTime?: string
  remark?: string
}

export interface RoleFormData {
  id?: string
  name: string
  code: string
  type: RoleType
  status: number
  description: string
  permissionIds: string[]
  sort: number
  remark: string
}

export interface PermissionData {
  id: string
  name: string
  code: string
  type: PermissionType
  parentId?: string | null
  path?: string
  icon?: string
  description?: string
  sort: number
  status: number
  children?: PermissionData[]
}

export interface ApiResponse<T = unknown> {
  code: string | number
  data: T
  msg: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface RoleListParams {
  keyword?: string
  status?: number | null
  type?: RoleType | null
  page: number
  pageSize: number
}

export interface RoleUserData {
  id: string
  username: string
  nickname: string
  email?: string
  phone?: string
  deptName?: string
  status: number
  createTime: string
}

// ==================== 权限预览相关类型 ====================
export type DataScopeType =
  'all' | 'department' | 'department_below' | 'self' | 'custom'

export interface RoleDataScope {
  module: string
  moduleName: string
  scope: DataScopeType
  customDepartments?: string[]
}

export interface RoleTempAuth {
  id: string
  roleId: string
  roleName: string
  targetRoleId: string
  targetRoleName: string
  permissions: string[]
  permissionNames: string[]
  reason: string
  startTime: string
  expireTime: string
  status: 'active' | 'expired' | 'revoked'
  grantedBy: string
}
