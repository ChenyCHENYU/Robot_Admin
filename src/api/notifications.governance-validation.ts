/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.governance-validation.ts
 * @Description: 消息发送治理与偏好的输入和响应边界校验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationDispatch,
  NotificationGovernance,
  NotificationPreferences,
  NotificationTemplate,
} from './notifications.contract'
import { isNotificationCount } from './notifications.validation'

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && !!value.trim() && value.length <= max
const id = (value: unknown): value is string =>
  text(value, 256) && value.trim() === value
const date = (value: unknown) =>
  text(value, 64) && Number.isFinite(Date.parse(value))
const category = (value: unknown) =>
  ['system', 'business', 'alarm'].includes(String(value))
const priority = (value: unknown) =>
  ['low', 'normal', 'high', 'urgent'].includes(String(value))
const channel = (value: unknown) =>
  ['inbox', 'email', 'sms', 'wecom'].includes(String(value))
const channels = (value: unknown) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= 4 &&
  value.every(channel) &&
  new Set(value).size === value.length
const content = (value: Record<string, unknown>) =>
  text(value.title, 120) &&
  text(value.content, 20_000) &&
  category(value.category) &&
  priority(value.priority) &&
  channels(value.channels)
const identity = (value: Record<string, unknown>) =>
  id(value.id) && isNotificationCount(value.revision) && date(value.updatedAt)
const isTemplate = (value: unknown): value is NotificationTemplate =>
  object(value) &&
  identity(value) &&
  content(value) &&
  text(value.name, 80) &&
  typeof value.enabled === 'boolean'
const dispatchOptions = (value: Record<string, unknown>) =>
  ['self', 'department', 'company'].includes(String(value.audience)) &&
  ['draft', 'scheduled', 'sent', 'withdrawn'].includes(String(value.status)) &&
  (value.scheduledAt === null || date(value.scheduledAt)) &&
  (value.templateId === undefined || id(value.templateId))
const isDispatch = (value: unknown): value is NotificationDispatch =>
  object(value) &&
  identity(value) &&
  content(value) &&
  date(value.createdAt) &&
  dispatchOptions(value)
const isDelivery = (value: unknown) => {
  if (!object(value)) return false
  return (
    id(value.id) &&
    id(value.dispatchId) &&
    channel(value.channel) &&
    ['pending', 'delivered', 'failed', 'withdrawn'].includes(
      String(value.status)
    ) &&
    isNotificationCount(value.attempts) &&
    (value.error === null || text(value.error, 4000)) &&
    date(value.updatedAt)
  )
}
const isAudit = (value: unknown) =>
  object(value) &&
  id(value.id) &&
  text(value.action, 120) &&
  typeof value.resourceId === 'string' &&
  value.resourceId.length <= 30_000 &&
  text(value.actorId, 256) &&
  typeof value.detail === 'string' &&
  value.detail.length <= 4000 &&
  date(value.at)
const collection = (
  value: unknown,
  test: (item: unknown) => boolean,
  max: number
) =>
  Array.isArray(value) &&
  value.length <= max &&
  value.every(test) &&
  new Set(value.map(item => item.id)).size === value.length
const invalid = () =>
  new Error('消息治理服务响应不符合约定，请联系服务维护人员')

/** 创建和更新前验证内容枚举，避免非法草稿污染持久化收件箱。 */
export const validateNotificationContent = (value: unknown): void => {
  if (!object(value) || !content(value))
    throw new Error('消息标题、正文、分类、优先级或通道无效')
}
/** 模板写确认必须返回完整实体。 */
export const requireNotificationTemplate = (
  value: unknown
): NotificationTemplate => {
  if (!isTemplate(value)) throw invalid()
  return value
}
/** 草稿写确认必须包含服务端主键、状态与版本。 */
export const requireNotificationDispatch = (
  value: unknown
): NotificationDispatch => {
  if (!isDispatch(value)) throw invalid()
  return value
}
/** 只有所有治理集合均合法时才替换共享缓存。 */
export const requireNotificationGovernance = (
  value: unknown
): NotificationGovernance => {
  if (!object(value)) throw invalid()
  const valid =
    collection(value.templates, isTemplate, 1000) &&
    collection(value.dispatches, isDispatch, 10_000) &&
    collection(value.deliveries, isDelivery, 40_000) &&
    collection(value.audit, isAudit, 1000)
  if (!valid) throw invalid()
  return value as unknown as NotificationGovernance
}
/** 通知偏好只接受完整布尔开关及明确的本地时段。 */
export const requireNotificationPreferences = (
  value: unknown
): NotificationPreferences => {
  if (
    !object(value) ||
    !object(value.categories) ||
    !object(value.channels) ||
    !object(value.quietHours)
  )
    throw invalid()
  const categoryFlags = ['system', 'business', 'alarm'].every(
    key =>
      typeof (value.categories as Record<string, unknown>)[key] === 'boolean'
  )
  const channelFlags = ['inbox', 'email', 'sms', 'wecom'].every(
    key => typeof (value.channels as Record<string, unknown>)[key] === 'boolean'
  )
  const quiet = value.quietHours
  if (
    !categoryFlags ||
    !channelFlags ||
    typeof quiet.enabled !== 'boolean' ||
    ![quiet.start, quiet.end].every(
      time => typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    )
  )
    throw invalid()
  return value as unknown as NotificationPreferences
}
