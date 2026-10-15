/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-14
 * @FilePath: \Robot_Admin\src\api\d_governance.ts
 * @Description: 后端治理事实到页面展示的受控映射，不推断未实现能力
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  TempAuthorization,
  TemporaryRoleGrantRequest,
} from './permission-governance.contract'

export interface RemoteTemporaryRoleGrant extends TemporaryRoleGrantRequest {
  id: string
  revision: number
  statusFlag: number
  userNickname?: string
  roleName?: string
}

/** 授权契约的无偏移墙钟字段固定表示UTC；无效日期不能由浏览器自动归一化。 */
export const parseGrantDateTime = (value: string): number => {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value))
    throw new Error('授权有效期必须是UTC yyyy-MM-dd HH:mm:ss')
  const time = new Date(value.replace(' ', 'T') + 'Z').getTime()
  if (!Number.isFinite(time) || formatGrantDateTime(time) !== value)
    throw new Error('授权有效期无效')
  return time
}

/** 日期选择器提供绝对时间戳；序列化为服务端约定的UTC墙钟字段。 */
export const formatGrantDateTime = (time: number): string => {
  const date = new Date(time)
  if (!Number.isFinite(date.getTime())) throw new Error('授权有效期无效')
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

/** UTC响应转换为用户当前时区的墙钟展示；只影响临时授权，不迁移历史日期。 */
export const formatLocalGrantDateTime = (time: number): string => {
  const date = new Date(time)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** 保留原UTC字段与revision，展示和生效窗口计算均从同一绝对时间派生。 */
export const toTemporaryRoleGrant = (
  record: RemoteTemporaryRoleGrant,
  now = Date.now()
): TempAuthorization => {
  const from = parseGrantDateTime(record.effectFrom)
  const to = parseGrantDateTime(record.effectTo)
  if (to <= from) throw new Error('授权截止时间必须晚于开始时间')
  return {
    ...record,
    targetRole: record.roleId,
    targetRoleName: record.roleName || record.roleId,
    permissions: [],
    permissionNames: [],
    grantedBy: '',
    grantedByName: '—',
    startTime: formatLocalGrantDateTime(from),
    expireTime: formatLocalGrantDateTime(to),
    status:
      record.statusFlag === 0
        ? 'revoked'
        : to <= now
          ? 'expired'
          : from > now
            ? 'pending'
            : 'active',
    remark: '',
  }
}
