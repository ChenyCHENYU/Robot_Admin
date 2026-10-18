/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.demo.governance.ts
 * @Description: 消息模板、投递、撤回与审计的本地演示领域操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationChannel,
  NotificationDispatch,
  NotificationDispatchDraft,
  NotificationPreferences,
  NotificationScope,
  NotificationTemplate,
  NotificationTemplateDraft,
} from './notifications.contract'
import type { NotificationDemoDocument } from './notifications.demo.seed'
import { createNotificationId } from './notifications.id'
import { validateNotificationContent } from './notifications.governance-validation'

export const addNotificationAudit = (
  document: NotificationDemoDocument,
  scope: NotificationScope,
  now: Date,
  action: string,
  resourceId: string,
  detail = ''
) => {
  document.audit.unshift({
    id: createNotificationId(),
    action,
    resourceId,
    detail,
    actorId: scope.userId,
    at: now.toISOString(),
  })
  document.audit = document.audit.slice(0, 1000)
}

export const assertNotificationRevision = (
  actual: number,
  expected?: number
) => {
  if (!Number.isInteger(expected) || actual !== expected)
    throw new Error('记录已被其他操作修改，请刷新后重试')
}

const channels = new Set<NotificationChannel>([
  'inbox',
  'email',
  'sms',
  'wecom',
])
const validateContent = (draft: {
  title: string
  content: string
  channels: NotificationChannel[]
}) => {
  validateNotificationContent(draft)
  if (!draft.title.trim() || draft.title.length > 120)
    throw new Error('标题必填且不超过 120 字')
  if (!draft.content.trim() || draft.content.length > 20_000)
    throw new Error('正文必填且不超过 20000 字')
  if (
    !draft.channels.length ||
    draft.channels.some(channel => !channels.has(channel))
  )
    throw new Error('请选择有效的投递通道')
}
const nextIdentity = (existing?: { id: string; revision: number }) =>
  existing
    ? { id: existing.id, revision: existing.revision + 1 }
    : { id: createNotificationId(), revision: 1 }

export const saveDemoTemplate = (
  document: NotificationDemoDocument,
  draft: NotificationTemplateDraft,
  now: Date
): NotificationTemplate => {
  validateContent(draft)
  if (typeof draft.enabled !== 'boolean') throw new Error('模板启用状态无效')
  if (!draft.name.trim() || draft.name.length > 80)
    throw new Error('模板名称必填且不超过 80 字')
  const existing = draft.id
    ? document.templates.find(item => item.id === draft.id)
    : undefined
  if (draft.id && !existing) throw new Error('模板不存在')
  if (existing) assertNotificationRevision(existing.revision, draft.revision)
  const record: NotificationTemplate = {
    ...structuredClone(draft),
    ...nextIdentity(existing),
    updatedAt: now.toISOString(),
    channels: [...new Set(draft.channels)],
  }
  document.templates = [
    record,
    ...document.templates.filter(item => item.id !== record.id),
  ]
  return record
}

const findEditableDispatch = (
  document: NotificationDemoDocument,
  draft: NotificationDispatchDraft
) => {
  const existing = draft.id
    ? document.dispatches.find(item => item.id === draft.id)
    : undefined
  if (draft.id && !existing) throw new Error('发送记录不存在')
  if (existing) {
    assertNotificationRevision(existing.revision, draft.revision)
    if (existing.status !== 'draft') throw new Error('只有草稿可以编辑')
  }
  return existing
}
const validateDispatchOptions = (
  document: NotificationDemoDocument,
  draft: NotificationDispatchDraft,
  now: Date
) => {
  if (!['self', 'department', 'company'].includes(draft.audience))
    throw new Error('受众范围无效')
  if (
    draft.templateId &&
    !document.templates.some(
      item => item.id === draft.templateId && item.enabled
    )
  )
    throw new Error('模板不存在或已停用')
  if (
    draft.scheduledAt &&
    (!Number.isFinite(Date.parse(draft.scheduledAt)) ||
      Date.parse(draft.scheduledAt) <= now.getTime())
  )
    throw new Error('定时发送时间必须晚于当前时间')
}
export const saveDemoDispatch = (
  document: NotificationDemoDocument,
  draft: NotificationDispatchDraft,
  now: Date
): NotificationDispatch => {
  validateContent(draft)
  validateDispatchOptions(document, draft, now)
  const existing = findEditableDispatch(document, draft)
  const record: NotificationDispatch = {
    ...structuredClone(draft),
    channels: [...new Set(draft.channels)],
    ...nextIdentity(existing),
    status: 'draft',
    createdAt: existing?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  }
  document.dispatches = [
    record,
    ...document.dispatches.filter(item => item.id !== record.id),
  ]
  return record
}

export const isQuietHours = (
  preferences: NotificationPreferences,
  now: Date
): boolean => {
  if (!preferences.quietHours.enabled) return false
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const { start, end } = preferences.quietHours
  return start <= end
    ? current >= start && current < end
    : current >= start || current < end
}

export const deliveryBlockReason = (
  document: NotificationDemoDocument,
  dispatch: NotificationDispatch,
  channel: NotificationChannel,
  now: Date
): string | null => {
  if (!document.preferences.categories[dispatch.category])
    return '当前类别通知已关闭，等待更新偏好后重试'
  if (!document.preferences.channels[channel])
    return '当前通道通知已关闭，等待更新偏好后重试'
  if (channel !== 'inbox' && isQuietHours(document.preferences, now))
    return '当前处于免打扰时段，等待时段结束后重试'
  return null
}

const deliverDemoChannel = (
  document: NotificationDemoDocument,
  dispatch: NotificationDispatch,
  channel: NotificationChannel,
  now: Date,
  failChannel: boolean
): boolean => {
  const reason = deliveryBlockReason(document, dispatch, channel, now)
  const failed = failChannel && !reason
  document.deliveries.unshift({
    id: createNotificationId(),
    dispatchId: dispatch.id,
    channel,
    status: reason ? 'pending' : failed ? 'failed' : 'delivered',
    attempts: 1,
    error: reason ?? (failed ? '演示：模拟通道投递失败，可重试' : null),
    updatedAt: now.toISOString(),
  })
  if (channel === 'inbox' && !reason && !failed)
    addDispatchInboxRecord(document, dispatch, now)
  return !reason
}
export const deliverDemoDispatch = (
  document: NotificationDemoDocument,
  dispatch: NotificationDispatch,
  now: Date,
  failChannel: boolean
): void => {
  const at = now.toISOString()
  dispatch.status = 'sent'
  dispatch.updatedAt = at
  dispatch.revision++
  for (const channel of dispatch.channels) {
    if (deliverDemoChannel(document, dispatch, channel, now, failChannel))
      failChannel = false
  }
}

export const addDispatchInboxRecord = (
  document: NotificationDemoDocument,
  dispatch: NotificationDispatch,
  now: Date
) => {
  if (document.items.some(item => item.dispatchId === dispatch.id)) return
  const at = now.toISOString()
  document.items.unshift({
    id: `dispatch-message-${dispatch.id}`,
    dispatchId: dispatch.id,
    title: dispatch.title,
    summary: dispatch.content.slice(0, 100),
    content: dispatch.content,
    contentType: 'text',
    kind: 'notification',
    category: dispatch.category,
    source: '消息发布（演示）',
    priority: dispatch.priority,
    createdAt: at,
    updatedAt: at,
    readAt: null,
    archivedAt: null,
    starred: false,
    taskStatus: null,
    revision: document.revision + 1,
    receivedRevision: document.revision + 1,
  })
}

export const validateNotificationPreferences = (
  preferences: NotificationPreferences
) => {
  if (
    !preferences ||
    !preferences.categories ||
    !preferences.channels ||
    !preferences.quietHours
  )
    throw new Error('通知偏好结构无效')
  if (
    !['system', 'business', 'alarm'].every(
      key =>
        typeof preferences.categories[
          key as keyof typeof preferences.categories
        ] === 'boolean'
    )
  )
    throw new Error('通知类别偏好无效')
  if (
    ![...channels].every(key => typeof preferences.channels[key] === 'boolean')
  )
    throw new Error('通知通道偏好无效')
  if (
    typeof preferences.quietHours.enabled !== 'boolean' ||
    ![preferences.quietHours.start, preferences.quietHours.end].every(time =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    )
  )
    throw new Error('免打扰时段无效')
}
