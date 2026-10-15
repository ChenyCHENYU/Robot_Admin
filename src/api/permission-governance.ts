/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\api\permission-governance.ts
 * @Description: 权限治理扩展数据与变更接口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { requireRevision, assertMockRevision } from './management-revision'
import {
  toTemporaryRoleGrant,
  parseGrantDateTime,
  type RemoteTemporaryRoleGrant,
} from './d_governance'
import type { ApiResponse, PageResult } from './management.contract'

import type {
  DataPermissionRule,
  TempAuthorization,
  TemporaryRoleGrantRequest,
  GovernanceCapabilities,
  PermissionConstraint,
  AuditLogItem,
} from './permission-governance.contract'
import {
  MOCK_DATA_PERMISSIONS,
  MOCK_TEMP_AUTHORIZATIONS,
  MOCK_CONSTRAINTS,
  MOCK_AUDIT_LOGS,
} from './permission-governance.mock'
import { getData, postData, putData } from '@robot-admin/request-core/axios'
import { isMockDataMode } from '@/config/dataMode'
import { delayWithSignal } from '@/utils/abort'

const createMockResponse = async <T>(
  data: T,
  signal?: AbortSignal
): Promise<ApiResponse<T>> => {
  await delayWithSignal(250, signal)
  return { code: '0', data, msg: '操作成功' }
}

const getGovernanceList = async <T>(
  endpoint: string,
  mockData: T,
  signal?: AbortSignal
): Promise<ApiResponse<T>> => {
  if (!isMockDataMode()) return getData<ApiResponse<T>>(endpoint, { signal })
  await delayWithSignal(250, signal)
  return { code: '0', data: structuredClone(mockData), msg: '操作成功' }
}

/** 读取服务器能力声明；读取失败时页面保持禁写，不猜测支持范围。 */
export const getGovernanceCapabilitiesApi = async (
  signal?: AbortSignal
): Promise<ApiResponse<GovernanceCapabilities>> =>
  getGovernanceList(
    '/sys/governance-capabilities',
    {
      dataScope: { read: true, write: false },
      fieldPermission: { read: true, write: false },
      constraint: { read: true, write: false },
      audit: { read: true, write: false },
      temporaryRoleGrant: { read: true, write: true, revoke: true },
    },
    signal
  )

/** Remote 只读取有效角色范围摘要；空字段数组是占位，不表示已读取字段规则。 */
export const getDataPermissionRulesApi = async (
  signal?: AbortSignal
): Promise<ApiResponse<DataPermissionRule[]>> => {
  if (isMockDataMode())
    return getGovernanceList(
      '/sys/data-permissions',
      MOCK_DATA_PERMISSIONS,
      signal
    )
  const response = await getData<
    ApiResponse<
      Array<{
        module: string
        scope: DataPermissionRule['scope']
        customDepartments?: string[]
      }>
    >
  >('/sys/data-permissions', { signal })
  return {
    ...response,
    data: response.data.map(row => ({
      id: row.module,
      module: row.module,
      moduleName: row.module === '*' ? '所有模块' : row.module,
      scope: row.scope,
      departmentIds: row.customDepartments ?? [],
      fieldPermissions: [],
      createTime: '—',
      updateTime: '—',
    })),
  }
}

/** 按人授角色的临时授权列表，保持服务端对象与 revision。 */
export const getTempAuthorizationsApi = async (
  signal?: AbortSignal
): Promise<ApiResponse<TempAuthorization[]>> => {
  if (isMockDataMode())
    return getGovernanceList(
      '/sys/temp-authorizations',
      MOCK_TEMP_AUTHORIZATIONS.map(row => ({
        ...row,
        userId: row.userId ?? 'user_1',
        userNickname: row.userNickname ?? '演示成员',
        roleId: row.roleId ?? row.targetRole,
        revision: row.revision ?? 0,
        statusFlag: row.status === 'revoked' ? 0 : 1,
        effectFrom: row.effectFrom ?? row.startTime,
        effectTo: row.effectTo ?? row.expireTime,
        permissions: [],
        permissionNames: [],
      })),
      signal
    )
  const response = await getData<ApiResponse<RemoteTemporaryRoleGrant[]>>(
    '/sys/temp-authorizations',
    { signal }
  )
  return {
    ...response,
    data: response.data.map(row => toTemporaryRoleGrant(row)),
  }
}

/** 原始约束配置只读展示，不把存储记录声称为执行中的约束引擎。 */
export const getPermissionConstraintsApi = async (
  signal?: AbortSignal
): Promise<ApiResponse<PermissionConstraint[]>> => {
  if (isMockDataMode())
    return getGovernanceList(
      '/sys/permission-constraints',
      MOCK_CONSTRAINTS,
      signal
    )
  const response = await getData<
    ApiResponse<
      Array<{
        id: string
        ruleName: string
        ruleType: string
        configJson: string
        createDateTime?: string
      }>
    >
  >('/sys/permission-constraints', { signal })
  return {
    ...response,
    data: response.data.map(row => ({
      ...row,
      type: 'unsupported',
      sourceId: '',
      sourceName: '',
      sourceCode: '',
      targetId: '',
      targetName: '',
      targetCode: '',
      description: row.ruleName,
      createTime: row.createDateTime ?? '—',
    })),
  }
}

/** 审计显示真实操作者标识与目标，不编造昵称、来源 IP 或操作类型。 */
export const getPermissionAuditLogsApi = async (
  signal?: AbortSignal
): Promise<ApiResponse<AuditLogItem[]>> => {
  if (isMockDataMode())
    return getGovernanceList(
      '/sys/permission-audit-logs',
      MOCK_AUDIT_LOGS,
      signal
    )
  const response = await getData<
    ApiResponse<
      Array<{
        id: string
        actorUserNo: string
        action: string
        target: string
        detail: string
        createDateTime?: string
      }>
    >
  >('/sys/permission-audit-logs', { signal })
  return {
    ...response,
    data: response.data.map(row => ({
      id: row.id,
      operatorName: row.actorUserNo,
      action: 'modify',
      actionRaw: row.action,
      targetType: 'permission',
      targetName: row.target,
      detail: row.detail,
      timestamp: row.createDateTime ?? '—',
      ip: '—',
    })),
  }
}

/** 当前后端仅提供范围摘要；未实现的保存不能走 mock 成功或猜测接口。 */
export const updateDataPermissionRuleApi = async (
  _id: string,
  _data: DataPermissionRule
): Promise<ApiResponse<DataPermissionRule>> => {
  if (!_id || !_data) throw new Error('请选择数据范围摘要')
  throw new Error('当前服务仅支持数据范围摘要，尚不支持范围或字段规则保存')
}

/** 当前公司为指定用户临时授予现有角色，提交后页面重读列表。 */
export const createTempAuthorizationApi = async (
  data: TemporaryRoleGrantRequest
): Promise<ApiResponse<string>> => {
  const draft = { ...data }
  if (!draft.userId || !draft.roleId || !draft.reason.trim())
    throw new Error('请选择成员、角色并填写授权原因')
  if (
    !(parseGrantDateTime(draft.effectTo) > parseGrantDateTime(draft.effectFrom))
  )
    throw new Error('授权截止时间必须晚于开始时间')
  if (!isMockDataMode())
    return postData<ApiResponse<string>>('/sys/temp-authorizations', draft)
  const id = `ta_${crypto.randomUUID()}`
  const response = await createMockResponse(id)
  MOCK_TEMP_AUTHORIZATIONS.unshift(
    toTemporaryRoleGrant({ ...draft, id, revision: 0, statusFlag: 1 })
  )
  return response
}

/** 精准撤销一条已读取授权，包括未来尚未生效的授权；旧版本明确拒绝。 */
export const revokeTempAuthorizationApi = async (
  id: string,
  expectedRevision?: number
): Promise<ApiResponse<void>> => {
  const revision = requireRevision(expectedRevision)
  if (!isMockDataMode())
    return putData<ApiResponse<void>>(`/sys/temp-authorizations/${id}/revoke`, {
      expectedRevision: revision,
    })
  const record = MOCK_TEMP_AUTHORIZATIONS.find(item => item.id === id)
  if (!record) throw new Error('临时授权不存在')
  assertMockRevision(record.revision, revision)
  const response = await createMockResponse(undefined)
  record.status = 'revoked'
  record.statusFlag = 0
  record.revision = revision + 1
  return response
}

/** 临时角色历史分页，不静默截断为旧清单的前200条。 */
export const getTempAuthorizationsPageApi = async (
  query: { page: number; pageSize: number; roleId?: string },
  signal?: AbortSignal
): Promise<ApiResponse<PageResult<TempAuthorization>>> => {
  if (isMockDataMode()) {
    const response = await getTempAuthorizationsApi(signal)
    const rows = response.data.filter(
      row => !query.roleId || row.roleId === query.roleId
    )
    return {
      ...response,
      data: {
        list: rows.slice(
          (query.page - 1) * query.pageSize,
          query.page * query.pageSize
        ),
        total: rows.length,
        page: query.page,
        pageSize: query.pageSize,
      },
    }
  }
  const response = await getData<
    ApiResponse<PageResult<RemoteTemporaryRoleGrant>>
  >('/sys/temp-authorizations/page', { params: query, signal })
  return {
    ...response,
    data: {
      ...response.data,
      list: response.data.list.map(row => toTemporaryRoleGrant(row)),
    },
  }
}

/** 检索当前公司的完整历史审计，保持动作/目标事实与稳定分页。 */
export const getPermissionAuditLogsPageApi = async (
  query: { page: number; pageSize: number; action?: string; target?: string },
  signal?: AbortSignal
): Promise<ApiResponse<PageResult<AuditLogItem>>> => {
  if (isMockDataMode()) {
    const response = await getPermissionAuditLogsApi(signal)
    const rows = response.data.filter(
      row => !query.action || row.action === query.action
    )
    return {
      ...response,
      data: {
        list: rows.slice(
          (query.page - 1) * query.pageSize,
          query.page * query.pageSize
        ),
        total: rows.length,
        page: query.page,
        pageSize: query.pageSize,
      },
    }
  }
  const response = await getData<
    ApiResponse<
      PageResult<{
        id: string
        actorUserNo: string
        action: string
        target: string
        detail: string
        createDateTime: string
      }>
    >
  >('/sys/permission-audit-logs/page', { params: query, signal })
  return {
    ...response,
    data: {
      ...response.data,
      list: response.data.list.map(row => ({
        id: row.id,
        operatorName: row.actorUserNo,
        action: 'modify',
        actionRaw: row.action,
        targetType: 'permission',
        targetName: row.target,
        detail: row.detail,
        timestamp: row.createDateTime,
        ip: '—',
      })),
    },
  }
}
