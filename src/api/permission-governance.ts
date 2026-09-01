/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\api\permission-governance.ts
 * @Description: 权限治理扩展数据与变更接口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { getData, postData, putData } from '@robot-admin/request-core'
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

const getGovernanceList = <T>(
  endpoint: string,
  mockData: T,
  signal?: AbortSignal
): Promise<GovernanceApiResponse<T>> =>
  isMockDataMode()
    ? createMockResponse(mockData, signal)
    : getData<GovernanceApiResponse<T>>(endpoint, { signal })

export const getDataPermissionRulesApi = <T>(
  mockData: T,
  signal?: AbortSignal
) => getGovernanceList('/sys/data-permissions', mockData, signal)

export const getTempAuthorizationsApi = <T>(
  mockData: T,
  signal?: AbortSignal
) => getGovernanceList('/sys/temp-authorizations', mockData, signal)

export const getPermissionConstraintsApi = <T>(
  mockData: T,
  signal?: AbortSignal
) => getGovernanceList('/sys/permission-constraints', mockData, signal)

export const getPermissionAuditLogsApi = <T>(
  mockData: T,
  signal?: AbortSignal
) => getGovernanceList('/sys/permission-audit-logs', mockData, signal)

export const updateDataPermissionRuleApi = <T>(
  id: string,
  data: T
): Promise<GovernanceApiResponse<T>> =>
  isMockDataMode()
    ? createMockResponse(data)
    : putData<GovernanceApiResponse<T>>(`/sys/data-permissions/${id}`, data)

export const createTempAuthorizationApi = <T>(
  data: T
): Promise<GovernanceApiResponse<T>> =>
  isMockDataMode()
    ? createMockResponse(data)
    : postData<GovernanceApiResponse<T>>('/sys/temp-authorizations', data)

export const revokeTempAuthorizationApi = (
  id: string
): Promise<GovernanceApiResponse<void>> =>
  isMockDataMode()
    ? createMockResponse(undefined)
    : putData<GovernanceApiResponse<void>>(
        `/sys/temp-authorizations/${id}/revoke`
      )
