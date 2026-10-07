/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\api\permission-governance.ts
 * @Description: 权限治理扩展数据与变更接口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  DataPermissionRule,
  TempAuthorization,
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

export interface GovernanceApiResponse<T> {
  code: string | number
  data: T
  message?: string
  msg?: string
}

const createMockResponse = async <T>(
  data: T,
  signal?: AbortSignal
): Promise<GovernanceApiResponse<T>> => {
  await delayWithSignal(250, signal)
  return { code: '0', data, message: '操作成功' }
}

const getGovernanceList = async <T>(
  endpoint: string,
  mockData: T,
  signal?: AbortSignal
): Promise<GovernanceApiResponse<T>> => {
  if (!isMockDataMode())
    return getData<GovernanceApiResponse<T>>(endpoint, { signal })
  await delayWithSignal(250, signal)
  return { code: '0', data: structuredClone(mockData), message: '操作成功' }
}

export const getDataPermissionRulesApi = (signal?: AbortSignal) =>
  getGovernanceList('/sys/data-permissions', MOCK_DATA_PERMISSIONS, signal)

export const getTempAuthorizationsApi = (signal?: AbortSignal) =>
  getGovernanceList(
    '/sys/temp-authorizations',
    MOCK_TEMP_AUTHORIZATIONS,
    signal
  )

export const getPermissionConstraintsApi = (signal?: AbortSignal) =>
  getGovernanceList('/sys/permission-constraints', MOCK_CONSTRAINTS, signal)

export const getPermissionAuditLogsApi = (signal?: AbortSignal) =>
  getGovernanceList('/sys/permission-audit-logs', MOCK_AUDIT_LOGS, signal)

export const updateDataPermissionRuleApi = async (
  id: string,
  data: DataPermissionRule
): Promise<GovernanceApiResponse<DataPermissionRule>> => {
  if (!isMockDataMode())
    return putData<GovernanceApiResponse<DataPermissionRule>>(
      `/sys/data-permissions/${id}`,
      data
    )
  const index = MOCK_DATA_PERMISSIONS.findIndex(item => item.id === id)
  if (index < 0) throw new Error('数据权限不存在')
  const result = await createMockResponse({
    ...data,
    departmentIds: [...data.departmentIds],
    fieldPermissions: data.fieldPermissions.map(field => ({ ...field })),
  })
  MOCK_DATA_PERMISSIONS[index] = result.data
  return result
}

export const createTempAuthorizationApi = async (
  data: TempAuthorization
): Promise<GovernanceApiResponse<TempAuthorization>> => {
  if (!isMockDataMode())
    return postData<GovernanceApiResponse<TempAuthorization>>(
      '/sys/temp-authorizations',
      data
    )
  const result = await createMockResponse({
    ...data,
    permissions: [...data.permissions],
    permissionNames: [...data.permissionNames],
  })
  MOCK_TEMP_AUTHORIZATIONS.unshift(result.data)
  return result
}

export const revokeTempAuthorizationApi = async (
  id: string
): Promise<GovernanceApiResponse<void>> => {
  if (!isMockDataMode())
    return putData<GovernanceApiResponse<void>>(
      `/sys/temp-authorizations/${id}/revoke`
    )
  const record = MOCK_TEMP_AUTHORIZATIONS.find(item => item.id === id)
  if (!record) throw new Error('临时授权不存在')
  const result = await createMockResponse(undefined)
  record.status = 'revoked'
  return result
}
