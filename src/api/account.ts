/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\api\account.ts
 * @Description: 当前账号资料、安全设置与登录记录接口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { getData, putData } from '@robot-admin/request-core'
import { isMockDataMode } from '@/config/dataMode'
import { delayWithSignal } from '@/utils/abort'

export interface AccountProfile {
  username: string
  nickname: string
  email: string
  phone: string
  bio: string
  avatar: string
  role: string
  department: string
  createTime: string
  lastLoginTime: string
  lastLoginIp: string
}

export type UpdateAccountProfilePayload = Pick<
  AccountProfile,
  'username' | 'nickname' | 'email' | 'phone' | 'bio' | 'avatar'
>

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface AccountLoginRecord {
  id: string
  time: string
  ip: string
  location: string
  device: string
  browser: string
  status: 'success' | 'failed'
}

export interface AccountSecuritySetting {
  key: string
  label: string
  description: string
  icon: string
  enabled: boolean
  action?: string
}

export type AccountActionType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'other'

export interface AccountActivityRecord {
  id: string
  time: string
  actionType: AccountActionType
  module: string
  description: string
  ip: string
  result: 'success' | 'failed'
  detail?: string
}

export interface AccountApiResponse<T> {
  code: string | number
  data: T
  message?: string
  msg?: string
}

const createMockResponse = async <T>(
  data: T,
  signal?: AbortSignal
): Promise<AccountApiResponse<T>> => {
  await delayWithSignal(300, signal)
  return { code: '0', data, message: '操作成功' }
}

export const getAccountProfileApi = (
  mockProfile: AccountProfile,
  signal?: AbortSignal
): Promise<AccountApiResponse<AccountProfile>> =>
  isMockDataMode()
    ? createMockResponse(mockProfile, signal)
    : getData<AccountApiResponse<AccountProfile>>('/account/profile', {
        signal,
      })

export const updateAccountProfileApi = (
  data: UpdateAccountProfilePayload
): Promise<AccountApiResponse<void>> =>
  isMockDataMode()
    ? createMockResponse(undefined)
    : putData<AccountApiResponse<void>>('/account/profile', data)

export const changeAccountPasswordApi = (
  data: ChangePasswordPayload
): Promise<AccountApiResponse<void>> =>
  isMockDataMode()
    ? createMockResponse(undefined)
    : putData<AccountApiResponse<void>>('/account/password', data)

export const getAccountLoginRecordsApi = (
  mockRecords: AccountLoginRecord[],
  signal?: AbortSignal
): Promise<AccountApiResponse<AccountLoginRecord[]>> =>
  isMockDataMode()
    ? createMockResponse(mockRecords, signal)
    : getData<AccountApiResponse<AccountLoginRecord[]>>(
        '/account/login-records',
        { signal }
      )

export const getAccountSecuritySettingsApi = (
  mockSettings: AccountSecuritySetting[],
  signal?: AbortSignal
): Promise<AccountApiResponse<AccountSecuritySetting[]>> =>
  isMockDataMode()
    ? createMockResponse(mockSettings, signal)
    : getData<AccountApiResponse<AccountSecuritySetting[]>>(
        '/account/security-settings',
        { signal }
      )

export const updateAccountSecuritySettingApi = (
  key: string,
  enabled: boolean
): Promise<AccountApiResponse<void>> =>
  isMockDataMode()
    ? createMockResponse(undefined)
    : putData<AccountApiResponse<void>>(`/account/security/${key}`, {
        enabled,
      })

export const getAccountActivityLogsApi = (
  mockRecords: AccountActivityRecord[],
  signal?: AbortSignal
): Promise<AccountApiResponse<AccountActivityRecord[]>> =>
  isMockDataMode()
    ? createMockResponse(mockRecords, signal)
    : getData<AccountApiResponse<AccountActivityRecord[]>>(
        '/account/activity-logs',
        { signal }
      )
