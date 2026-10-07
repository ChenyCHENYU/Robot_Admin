/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @Description: role-manage 页面表单与业务配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { FormItemRule } from 'naive-ui/es'
import type {
  RoleType,
  RoleData,
  RoleFormData,
  PermissionData,
  DataScopeType,
} from '@/api/role-manage.contract'
export type {
  RoleType,
  RoleData,
  RoleFormData,
  PermissionData,
  RoleUserData,
  DataScopeType,
  RoleDataScope,
  RoleTempAuth,
} from '@/api/role-manage.contract'

export interface SearchForm {
  keyword: string
  status: number | null
  type: RoleType | null
}

export interface PermissionTemplate {
  id: string
  name: string
  description: string
  icon: string
  permissions: string[]
}

// ==================== 常量配置 ====================
export const ICONS = {
  search: 'mdi:magnify',
  plus: 'mdi:plus',
  refresh: 'mdi:refresh',
  toggle: 'mdi:toggle-switch',
  delete: 'mdi:delete',
  edit: 'mdi:pencil',
  eye: 'mdi:eye',
  pause: 'mdi:pause',
  play: 'mdi:play',
  permission: 'mdi:shield-account',
  users: 'mdi:account-group',
} as const

export const STATUS_CONFIG = {
  1: { text: '正常', type: 'success' as const, icon: 'mdi:check-circle' },
  0: { text: '禁用', type: 'error' as const, icon: 'mdi:pause-circle' },
} as const

export const ROLE_TYPE_CONFIG = {
  system: { text: '系统', type: 'error' as const, icon: 'mdi:cog' },
  custom: { text: '自定义', type: 'info' as const, icon: 'mdi:account-key' },
  temp: { text: '临时', type: 'warning' as const, icon: 'mdi:clock' },
} as const

export const UI_CONFIG = {
  roleType: [
    { label: '系统角色', value: 'system' },
    { label: '自定义角色', value: 'custom' },
    { label: '临时角色', value: 'temp' },
  ],
  roleStatus: [
    { label: '正常', value: 1 },
    { label: '禁用', value: 0 },
  ],
  permissionType: [
    { label: '菜单权限', value: 'menu' },
    { label: '按钮权限', value: 'button' },
    { label: 'API权限', value: 'api' },
  ],
}

// ==================== 表单验证规则 ====================
export const ROLE_FORM_RULES: Record<string, FormItemRule[]> = {
  name: [
    { required: true, message: '请输入角色名称', trigger: ['input', 'blur'] },
    {
      min: 2,
      max: 50,
      message: '角色名称长度在 2 到 50 个字符',
      trigger: ['input', 'blur'],
    },
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: ['input', 'blur'] },
    {
      min: 2,
      max: 50,
      message: '角色编码长度在 2 到 50 个字符',
      trigger: ['input', 'blur'],
    },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: '角色编码必须以字母开头，只能包含字母、数字和下划线',
      trigger: ['input', 'blur'],
    },
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: ['change', 'blur'] },
  ],
  sort: [
    {
      required: true,
      type: 'number',
      message: '请输入排序值',
      trigger: ['input', 'blur'],
    },
    {
      type: 'number',
      min: 0,
      max: 9999,
      message: '排序值必须在 0 到 9999 之间',
      trigger: ['input', 'blur'],
    },
  ],
}

// ==================== 默认数据 ====================
export const DEFAULT_ROLE_FORM_DATA: RoleFormData = {
  name: '',
  code: '',
  type: 'custom',
  status: 1,
  description: '',
  permissionIds: [],
  sort: 0,
  remark: '',
}

// 权限模板数据
export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'admin_template',
    name: '管理员模板',
    description: '包含用户管理、角色管理等核心管理权限，适合系统管理员使用',
    icon: 'mdi:account-key',
    permissions: [
      'perm_1',
      'perm_1_1',
      'perm_1_1_1',
      'perm_1_1_2',
      'perm_1_2',
      'perm_1_2_1',
      'perm_1_2_2',
    ],
  },
  {
    id: 'editor_template',
    name: '编辑员模板',
    description: '包含内容管理相关权限，适合内容编辑人员使用',
    icon: 'mdi:file-document-edit',
    permissions: ['perm_2', 'perm_2_1', 'perm_2_1_1', 'perm_2_1_2'],
  },
  {
    id: 'analyst_template',
    name: '分析师模板',
    description: '包含数据查看和分析权限，适合数据分析人员使用',
    icon: 'mdi:chart-line',
    permissions: ['perm_3', 'perm_3_1', 'perm_3_2'],
  },
  {
    id: 'viewer_template',
    name: '查看员模板',
    description: '只包含基础查看权限，适合临时访问用户使用',
    icon: 'mdi:eye',
    permissions: ['perm_3_1'],
  },
]

// ==================== 工具函数 ====================
export const findPermissionById = (
  permissions: PermissionData[],
  id: string
): PermissionData | null => {
  for (const permission of permissions) {
    if (permission.id === id) return permission
    if (permission.children) {
      const found = findPermissionById(permission.children, id)
      if (found) return found
    }
  }
  return null
}

export interface PermissionPreviewItem {
  type: 'menu' | 'button' | 'api'
  id: string
  name: string
  code: string
  icon?: string
  path?: string
  parentName?: string
}

// ==================== 权限预览常量 ====================
export const DATA_SCOPE_CONFIG: Record<
  DataScopeType,
  {
    text: string
    type: 'success' | 'info' | 'warning' | 'error' | 'default'
    icon: string
    description: string
  }
> = {
  all: {
    text: '全部数据',
    type: 'success',
    icon: 'mdi:database',
    description: '可查看系统中所有数据',
  },
  department: {
    text: '本部门',
    type: 'info',
    icon: 'mdi:domain',
    description: '仅可查看本部门数据',
  },
  department_below: {
    text: '本部门及下级',
    type: 'warning',
    icon: 'mdi:file-tree',
    description: '可查看本部门及下级部门数据',
  },
  self: {
    text: '仅本人',
    type: 'error',
    icon: 'mdi:account',
    description: '仅可查看自己创建的数据',
  },
  custom: {
    text: '自定义',
    type: 'default',
    icon: 'mdi:tune',
    description: '自定义可访问的数据范围',
  },
}

export const TEMP_AUTH_STATUS = {
  active: { text: '生效中', type: 'success' as const },
  expired: { text: '已过期', type: 'warning' as const },
  revoked: { text: '已撤销', type: 'error' as const },
}

// ==================== 工具函数：权限预览 ====================

/**
 * * @description: 从权限树中提取扁平化的权限预览列表
 * ? @param {PermissionData[]} permissions 权限树
 * ? @param {string[]} selectedIds 已选权限ID列表
 * ! @return {PermissionPreviewItem[]} 扁平化的权限预览项
 */
export const extractPermissionPreview = (
  permissions: PermissionData[],
  selectedIds: string[],
  parentName?: string
): PermissionPreviewItem[] => {
  const result: PermissionPreviewItem[] = []
  for (const perm of permissions) {
    if (selectedIds.includes(perm.id)) {
      result.push({
        type: perm.type,
        id: perm.id,
        name: perm.name,
        code: perm.code,
        icon: perm.icon,
        path: perm.path,
        parentName,
      })
    }
    if (perm.children) {
      result.push(
        ...extractPermissionPreview(perm.children, selectedIds, perm.name)
      )
    }
  }
  return result
}

/**
 * * @description: 比较两个角色的权限差异
 * ? @param {RoleData} roleA 角色A
 * ? @param {RoleData} roleB 角色B
 * ! @return {{ shared, onlyA, onlyB }} 权限差异
 */
export const compareRolePermissions = (
  roleA: RoleData,
  roleB: RoleData
): {
  shared: string[]
  onlyA: string[]
  onlyB: string[]
} => {
  const idsA = new Set(roleA.permissionIds || [])
  const idsB = new Set(roleB.permissionIds || [])
  const shared = [...idsA].filter(id => idsB.has(id))
  const onlyA = [...idsA].filter(id => !idsB.has(id))
  const onlyB = [...idsB].filter(id => !idsA.has(id))
  return { shared, onlyA, onlyB }
}
