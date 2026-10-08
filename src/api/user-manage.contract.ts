/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\user-manage.contract.ts
 * @Description: 用户资源、部门、角色选项及表单的请求响应契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MockCompanyMembership } from './auth.mock-directory'

// ==================== 类型定义 ====================
export type UserType = 'internal' | 'external' | 'partner' | 'guest'

export interface UserData {
  id: string
  username: string
  nickname: string
  email?: string
  phone?: string
  userType: UserType
  deptId?: string
  deptName?: string
  roleIds?: string[]
  roleNames?: string[]
  status: number
  avatar?: string
  remark?: string
  createTime: string
  updateTime?: string
  lastLoginTime?: string
  companyName?: string
  contactPerson?: string
}

export interface UserFormData {
  id?: string
  username: string
  nickname: string
  email: string
  phone: string
  userType: UserType
  deptId: string | null
  roleIds: string[]
  password: string
  status: number
  remark: string
  companyName: string
  contactPerson: string
  memberships: MockCompanyMembership[]
}

export interface DeptData {
  id: string
  name: string
  parentId?: string | null
  sort: number
  status: number
  type: string
  children?: DeptData[]
}

export interface DeptTreeOption {
  id: string
  name: string
  children?: DeptTreeOption[]
}

export interface RoleData {
  id: string
  name: string
  code: string
  status: number
}

export interface SearchForm {
  keyword: string
  status: number | null
  roleId: string | null
  deptId: string | null
  userType: UserType | null
}

export interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}

export interface UserListParams extends Partial<SearchForm> {
  page: number
  pageSize: number
  /** 仅供演示数据过滤；真实接口必须从服务端会话解析公司。 */
  contextId?: string
}
