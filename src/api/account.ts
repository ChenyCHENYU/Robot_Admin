/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\api\account.ts
 * @Description: 当前账号资料、安全设置与登录记录接口
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { ApiResponse } from './management.contract'
import { getData, putData } from '@robot-admin/request-core/axios'
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

export type UpdateAccountProfilePayload = Partial<
  Pick<AccountProfile, 'username' | 'nickname' | 'bio' | 'avatar'>
> & {
  email?: string | null
  phone?: string | null
}

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

const createMockResponse = async <T>(
  data: T,
  signal?: AbortSignal
): Promise<ApiResponse<T>> => {
  await delayWithSignal(300, signal)
  return { code: '0', data, msg: '操作成功' }
}

/** 资料读取将空展示字段归一为空串，保持清空后的重新读取正确。 */
export const getAccountProfileApi = async (
  mockProfile: AccountProfile,
  signal?: AbortSignal
): Promise<ApiResponse<AccountProfile>> => {
  if (isMockDataMode()) return createMockResponse(mockProfile, signal)
  const response = await getData<ApiResponse<AccountProfile>>(
    '/account/profile',
    { signal }
  )
  return {
    ...response,
    data: {
      ...response.data,
      email: response.data.email ?? '',
      phone: response.data.phone ?? '',
      bio: response.data.bio ?? '',
      avatar: response.data.avatar ?? '',
    },
  }
}

/** Remote仅支持昵称、邮箱和手机号；省略保留，显式null/空串清空联系方式。 */
export const updateAccountProfileApi = async (
  data: UpdateAccountProfilePayload,
  signal?: AbortSignal
): Promise<ApiResponse<void>> => {
  if (isMockDataMode()) return createMockResponse(undefined, signal)
  const allowed = new Set(['nickname', 'email', 'phone'])
  if (Object.keys(data).some(key => !allowed.has(key)))
    throw new Error('当前服务仅支持昵称、邮箱和手机号保存')
  return putData<ApiResponse<void>>(
    '/account/profile',
    {
      ...data,
      ...(Object.prototype.hasOwnProperty.call(data, 'email')
        ? { email: data.email === '' ? null : data.email }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(data, 'phone')
        ? { phone: data.phone === '' ? null : data.phone }
        : {}),
    },
    { signal }
  )
}

export const changeAccountPasswordApi = (
  data: ChangePasswordPayload,
  signal?: AbortSignal
): Promise<ApiResponse<void>> =>
  isMockDataMode()
    ? createMockResponse(undefined, signal)
    : putData<ApiResponse<void>>('/account/password', data, { signal })

export const getAccountLoginRecordsApi = (
  mockRecords: AccountLoginRecord[],
  signal?: AbortSignal
): Promise<ApiResponse<AccountLoginRecord[]>> =>
  isMockDataMode()
    ? createMockResponse(mockRecords, signal)
    : getData<ApiResponse<AccountLoginRecord[]>>('/account/login-records', {
        signal,
      })

export const getAccountSecuritySettingsApi = (
  mockSettings: AccountSecuritySetting[],
  signal?: AbortSignal
): Promise<ApiResponse<AccountSecuritySetting[]>> =>
  isMockDataMode()
    ? createMockResponse(mockSettings, signal)
    : getData<ApiResponse<AccountSecuritySetting[]>>(
        '/account/security-settings',
        { signal }
      )

/** 安全开关只在Mock演示中可变；Remote配置是认证能力只读状态。 */
export const updateAccountSecuritySettingApi = async (
  key: string,
  enabled: boolean
): Promise<ApiResponse<void>> => {
  if (isMockDataMode()) return createMockResponse(undefined)
  if (!key || typeof enabled !== 'boolean') throw new Error('安全配置参数无效')
  throw new Error('当前服务安全配置只读，不支持修改此开关')
}

export const getAccountActivityLogsApi = (
  mockRecords: AccountActivityRecord[],
  signal?: AbortSignal
): Promise<ApiResponse<AccountActivityRecord[]>> =>
  isMockDataMode()
    ? createMockResponse(mockRecords, signal)
    : getData<ApiResponse<AccountActivityRecord[]>>('/account/activity-logs', {
        signal,
      })
