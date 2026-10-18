/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.validation.ts
 * @Description: 消息领域输入边界的有界运行时校验，损坏响应不写入共享状态
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationRecord,
  NotificationSnapshot,
  NotificationStats,
} from './notifications.contract'

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length <= max
const isId = (value: unknown): value is string =>
  isText(value, 256) && !!value && value.trim() === value
export const isNotificationCount = (value: unknown): value is number =>
  Number.isSafeInteger(value) &&
  Number(value) >= 0 &&
  Number(value) <= 1_000_000_000
const isDate = (value: unknown): value is string =>
  isText(value, 64) && !!value && Number.isFinite(Date.parse(value))
const isNullableDate = (value: unknown) => value === null || isDate(value)
const isAttachment = (value: unknown): boolean => {
  if (!isObject(value)) return false
  return (
    isId(value.id) &&
    isText(value.name, 256) &&
    isText(value.url, 2048) &&
    /^(https?:\/\/|\/(?!\/)|$)/i.test(value.url) &&
    (value.size === undefined || isNotificationCount(value.size))
  )
}
const isTarget = (value: unknown): boolean => {
  if (value === undefined) return true
  if (!isObject(value) || !['route', 'task'].includes(String(value.type)))
    return false
  if (
    value.path !== undefined &&
    (!isText(value.path, 2048) || !/^\/(?!\/)/.test(value.path))
  )
    return false
  return value.resourceId === undefined || isId(value.resourceId)
}
const isRecordIdentity = (value: Record<string, unknown>) =>
  isId(value.id) &&
  isText(value.title, 120) &&
  isText(value.source, 200) &&
  isNotificationCount(value.revision)
const isRecordContent = (value: Record<string, unknown>) =>
  isText(value.summary, 4000) &&
  isText(value.content, 20_000) &&
  ['text', 'html'].includes(String(value.contentType)) &&
  ['system', 'business', 'alarm'].includes(String(value.category)) &&
  ['low', 'normal', 'high', 'urgent'].includes(String(value.priority))
const isRecordState = (value: Record<string, unknown>) => {
  const task =
    value.kind === 'task' &&
    ['pending', 'done'].includes(String(value.taskStatus))
  const notification =
    value.kind === 'notification' && value.taskStatus === null
  return (
    (task || notification) &&
    typeof value.starred === 'boolean' &&
    isNullableDate(value.readAt) &&
    isNullableDate(value.archivedAt)
  )
}
const isRecordDates = (value: Record<string, unknown>) =>
  isDate(value.createdAt) &&
  isDate(value.updatedAt) &&
  (value.receivedRevision === undefined ||
    isNotificationCount(value.receivedRevision))

/** 只接受完整且有界的消息记录，包括详情独立请求的响应。 */
export const isNotificationRecord = (
  value: unknown
): value is NotificationRecord => {
  if (!isObject(value)) return false
  const attachments =
    value.attachments === undefined ||
    (Array.isArray(value.attachments) &&
      value.attachments.length <= 30 &&
      value.attachments.every(isAttachment))
  return (
    isRecordIdentity(value) &&
    isRecordContent(value) &&
    isRecordState(value) &&
    isRecordDates(value) &&
    isTarget(value.target) &&
    attachments
  )
}
const isRecordList = (
  value: unknown,
  limit: number
): value is NotificationRecord[] =>
  Array.isArray(value) &&
  value.length <= limit &&
  value.every(isNotificationRecord) &&
  new Set(value.map(item => item.id)).size === value.length
const isStats = (value: unknown): value is NotificationStats => {
  if (!isObject(value) || !isObject(value.byCategory)) return false
  const counts = [
    'total',
    'unread',
    'read',
    'todo',
    'done',
    'archived',
    'starred',
  ].map(key => value[key])
  const categories = ['system', 'business', 'alarm'].map(
    key => (value.byCategory as Record<string, unknown>)[key]
  )
  if (
    !counts.every(isNotificationCount) ||
    !categories.every(isNotificationCount)
  )
    return false
  const stats = value as unknown as NotificationStats
  return (
    stats.unread + stats.read === stats.total &&
    stats.todo + stats.done <= stats.total &&
    stats.starred <= stats.total &&
    categories.reduce((sum, count) => sum + Number(count), 0) === stats.unread
  )
}
const isCapabilities = (value: unknown) =>
  value === undefined ||
  (isObject(value) &&
    ['manage', 'realtime', 'preferences'].every(
      key => typeof value[key] === 'boolean'
    ))
const invalidResponse = () =>
  new Error('消息服务响应不符合约定，请联系服务维护人员')

/** 验证权威统计、分页列表和预览，拒绝损坏的数据和重复主键。 */
export const requireNotificationSnapshot = (
  value: unknown
): NotificationSnapshot => {
  if (!isObject(value)) throw invalidResponse()
  const valid =
    isRecordList(value.items, 1000) &&
    isRecordList(value.previewItems, 100) &&
    isStats(value.stats) &&
    isNotificationCount(value.total) &&
    isNotificationCount(value.revision) &&
    isCapabilities(value.capabilities)
  if (!valid) throw invalidResponse()
  return value as unknown as NotificationSnapshot
}

/** 详情与列表沿用同一记录校验。 */
export const requireNotificationRecord = (
  value: unknown
): NotificationRecord => {
  if (!isNotificationRecord(value)) throw invalidResponse()
  return value
}
