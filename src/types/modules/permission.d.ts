/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-10
 * @FilePath: \Robot_Admin\src\types\modules\permission.d.ts
 * @Description: 权限体系类型定义 — RBAC + 数据权限 + 字段权限 + 审计日志
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 权限资源类型 */
export type PermissionType = 'module' | 'function' | 'button' | 'api'

/** 数据权限范围 */
export type DataScopeType =
  | 'all' // 全部数据
  | 'department' // 本部门数据
  | 'department_below' // 本部门及下级
  | 'self' // 仅本人数据
  | 'custom' // 自定义范围

/** 权限状态 */
export type PermissionStatus = 0 | 1 // 0=禁用 1=启用

/** 按钮权限定义 */
export interface ButtonPermission {
  /** 权限标识，如 user:manage:add */
  code: string
  /** 权限名称 */
  name: string
  /** 是否启用 */
  status: PermissionStatus
}

/** 按钮权限列表（按路由 path 索引） */
export type ButtonPermissionMap = Record<string, string[]>

/** 字段权限 */
export interface FieldPermission {
  /** 字段名 */
  field: string
  /** 是否可见 */
  visible: boolean
  /** 是否可编辑 */
  editable: boolean
  /** 是否脱敏显示 */
  masked: boolean
}

/** 数据权限规则 */
export interface DataPermission {
  /** 所属模块（如 user-manage、order-manage） */
  module: string
  /** 数据范围 */
  scope: DataScopeType
  /** 自定义部门 ID 列表（scope=custom 时生效） */
  departmentIds?: string[]
  /** 字段级权限 */
  fieldPermissions?: FieldPermission[]
}

/** 角色权限配置 */
export interface RolePermission {
  /** 角色 ID */
  roleId: string
  /** 角色编码 */
  roleCode: string
  /** 菜单权限 ID 列表 */
  menuIds: string[]
  /** 按钮权限编码列表 */
  buttonCodes: string[]
  /** 数据权限规则 */
  dataPermissions: DataPermission[]
}

/** 权限变更日志 */
export interface PermissionAuditLog {
  /** 日志 ID */
  id: string
  /** 操作人 ID */
  operatorId: string
  /** 操作人名称 */
  operatorName: string
  /** 操作类型 */
  action: 'grant' | 'revoke' | 'modify' | 'create' | 'delete'
  /** 目标类型 */
  targetType: 'role' | 'user' | 'menu' | 'permission'
  /** 目标 ID */
  targetId: string
  /** 变更详情 */
  detail: string
  /** 操作时间 */
  timestamp: number
  /** 操作 IP */
  ip?: string
}

/** 权限校验结果 */
export interface PermissionCheckResult {
  /** 是否有权限 */
  allowed: boolean
  /** 拒绝原因 */
  reason?: string
}
