/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\src\utils\d_tablePreferences.ts
 * @Description: 生成租户、公司与用户隔离的稳定表格偏好范围，不包含会话凭据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

interface TablePreferenceIdentity {
  userId: unknown
  tenantId: unknown
  companyId: unknown
}

/** 零有效；字符串仅检查空白，不改写服务端赋予的 opaque ID。 */
function normalizeIdentity(value: unknown): string | undefined {
  if (typeof value === 'number')
    return Number.isFinite(value) ? String(value) : undefined
  if (typeof value === 'string') return value.trim() ? value : undefined
  return undefined
}

/** JSON 元组避免分隔符碰撞；版本前缀与历史未隔离键完全分开，不隐式迁移。 */
export function buildTablePreferenceScope(
  identity: TablePreferenceIdentity
): string | undefined {
  const user = normalizeIdentity(identity.userId)
  const tenant = normalizeIdentity(identity.tenantId)
  const company = normalizeIdentity(identity.companyId)
  if (user === undefined || tenant === undefined || company === undefined)
    return undefined
  return JSON.stringify([
    'robot-admin:table-preferences:v1',
    tenant,
    company,
    user,
  ])
}
