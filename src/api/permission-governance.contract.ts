/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\src\api\permission-governance.contract.ts
 * @Description: 权限治理领域契约，与页面布局无关
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  DataScopeType,
  TemporaryAuthorizationStatus,
} from './permission-policy.contract'

export interface DataPermissionRule {
  id: string
  module: string
  moduleName: string
  scope: DataScopeType
  departmentIds: string[]
  fieldPermissions: FieldPermissionItem[]
  createTime: string
  updateTime: string
}

export interface FieldPermissionItem {
  field: string
  label: string
  visible: boolean
  editable: boolean
  masked: boolean
}

export interface TempAuthorization {
  id: string
  targetRole: string
  targetRoleName: string
  permissions: string[]
  permissionNames: string[]
  reason: string
  grantedBy: string
  grantedByName: string
  startTime: string
  expireTime: string
  status: TemporaryAuthorizationStatus
  remark: string
}

export interface PermissionConstraint {
  id: string
  type: 'mutual_exclusion' | 'inheritance'
  sourceId: string
  sourceName: string
  sourceCode: string
  targetId: string
  targetName: string
  targetCode: string
  description: string
  createTime: string
}

export interface AuditLogItem {
  id: string
  operatorName: string
  operatorAvatar?: string
  action: 'grant' | 'revoke' | 'modify' | 'create' | 'delete'
  targetType: 'role' | 'user' | 'menu' | 'permission'
  targetName: string
  detail: string
  timestamp: string
  ip: string
}
