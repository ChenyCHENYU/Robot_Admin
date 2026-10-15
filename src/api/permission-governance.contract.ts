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
  userId?: string
  userNickname?: string
  roleId?: string
  revision?: number
  statusFlag?: number
  effectFrom?: string
  effectTo?: string
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
  type: 'mutual_exclusion' | 'inheritance' | 'unsupported'
  ruleName?: string
  ruleType?: string
  configJson?: string
  sourceId: string
  sourceName: string
  sourceCode: string
  targetId: string
  targetName: string
  targetCode: string
  description: string
  createTime: string
}

/** 当前公司的临时角色授予；不能对角色临时附加任意权限。 */
export interface TemporaryRoleGrantRequest {
  userId: string
  roleId: string
  /** UTC无偏移契约，格式yyyy-MM-dd HH:mm:ss；页面选择器先转UTC。 */
  effectFrom: string
  /** UTC无偏移契约，截止时刻起失效；展示转换为用户本地时区。 */
  effectTo: string
  reason: string
}

export interface GovernanceCapability {
  read: boolean
  write: boolean
  revoke?: boolean
}
export interface GovernanceCapabilities {
  dataScope: GovernanceCapability
  fieldPermission: GovernanceCapability
  constraint: GovernanceCapability
  audit: GovernanceCapability
  temporaryRoleGrant: GovernanceCapability
}

export interface AuditLogItem {
  id: string
  operatorName: string
  actionRaw?: string
  operatorAvatar?: string
  action: 'grant' | 'revoke' | 'modify' | 'create' | 'delete'
  targetType: 'role' | 'user' | 'menu' | 'permission'
  targetName: string
  detail: string
  timestamp: string
  ip: string
}
