/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\api\observability.contract.ts
 * @Description: 全站聚合查询契约，拒绝异常范围并剔除任意附加字段
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  UsageSummary,
  TelemetryEventType,
  TelemetryEvent,
} from '@/types/observability'
import { TELEMETRY_TYPES } from '@/utils/d_telemetryStore'

/** 非聚合对象与空响应统一拒绝。 */
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('全站统计响应格式异常')
  return value as Record<string, unknown>
}
/** 计数与时间必须是有限的非负数。 */
const numeric = (value: unknown, max = 1e13): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > max
  )
    throw new Error('全站统计数值异常')
  return value
}
/** 事件计数不接受小数，缺失值不能自动补零。 */
const count = (value: unknown): number => {
  const result = numeric(value)
  if (!Number.isInteger(result)) throw new Error('全站统计计数异常')
  return result
}
/** 空耗时保持未知，而不是零。 */
const timing = (value: unknown) =>
  value === null ? null : numeric(value, 600_000)
/** 稳定路由名与设备枚举不得含查询参数和个人信息。 */
const identifier = (value: unknown): string => {
  if (typeof value !== 'string' || !/^[\w-]{1,100}$/.test(value))
    throw new Error('全站统计标识异常')
  return value
}
/** 所有列表有数量上限，不接收任意用户明细。 */
const array = <T>(
  value: unknown,
  max: number,
  parse: (item: unknown) => T
): T[] => {
  if (!Array.isArray(value) || value.length > max)
    throw new Error('全站统计列表异常')
  return value.map(parse)
}
/** 重复维度会导致图表误计，必须由后端先聚合。 */
const unique = <T>(items: T[], key: (item: T) => string): T[] => {
  if (new Set(items.map(key)).size !== items.length)
    throw new Error('全站统计维度重复')
  return items
}
/** 只输出声明的字段，丢弃服务器可能意外附加的身份或认证信息。 */
export const validateUsageSummary = (value: unknown): UsageSummary => {
  const data = object(value)
  if (data.schemaVersion !== 1 || data.scope !== 'site')
    throw new Error('全站统计数据范围异常')
  const from = numeric(data.from),
    to = numeric(data.to)
  if (from > to || to - from > 31 * 86_400_000)
    throw new Error('全站统计时间范围异常')
  const totals = object(data.totals)
  const daily = unique(
    array(data.daily, 31, item => {
      const row = object(item)
      if (
        typeof row.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(row.date) ||
        !Number.isFinite(Date.parse(row.date))
      )
        throw new Error('全站统计日期异常')
      return {
        date: row.date,
        views: count(row.views),
        logins: count(row.logins),
      }
    }),
    item => item.date
  )
  const pages = unique(
    array(data.pages, 1000, item => {
      const row = object(item)
      return {
        route: identifier(row.route),
        views: count(row.views),
        p50Ms: timing(row.p50Ms),
        p95Ms: timing(row.p95Ms),
      }
    }),
    item => item.route
  )
  const events = unique(
    array(data.events, 5, item => {
      const row = object(item)
      if (!TELEMETRY_TYPES.includes(row.type as TelemetryEventType))
        throw new Error('全站统计事件异常')
      return { type: row.type as TelemetryEventType, count: count(row.count) }
    }),
    item => item.type
  )
  const devices = unique(
    array(data.devices, 3, item => {
      const row = object(item)
      if (!['desktop', 'tablet', 'mobile'].includes(String(row.device)))
        throw new Error('全站统计设备维度异常')
      return {
        device: row.device as TelemetryEvent['device'],
        count: count(row.count),
      }
    }),
    item => item.device
  )
  return {
    schemaVersion: 1,
    scope: 'site',
    from,
    to,
    updatedAt: numeric(data.updatedAt),
    totals: {
      views: count(totals.views),
      sessions: count(totals.sessions),
      loginSuccess: count(totals.loginSuccess),
      loginFailure: count(totals.loginFailure),
      companySwitches: count(totals.companySwitches),
      actions: count(totals.actions),
    },
    daily,
    pages,
    events,
    devices,
  }
}
