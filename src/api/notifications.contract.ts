/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.contract.ts
 * @Description: 企业消息领域协议；演示与未来 HTTP 服务使用同一契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export type NotificationCategory = 'system' | 'business' | 'alarm'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type NotificationStatus =
  'all' | 'unread' | 'read' | 'todo' | 'done' | 'archived' | 'starred'
export type NotificationMutation =
  | 'read'
  | 'unread'
  | 'archive'
  | 'unarchive'
  | 'star'
  | 'unstar'
  | 'delete'
  | 'complete-task'
export type NotificationChannel = 'inbox' | 'email' | 'sms' | 'wecom'
export interface NotificationScope {
  userId: string
  tenantId: string
  companyId: string
}
export interface NotificationAttachment {
  id: string
  name: string
  url: string
  size?: number
}
export interface NotificationRecord {
  id: string
  title: string
  summary: string
  content: string
  contentType: 'text' | 'html'
  kind: 'notification' | 'task'
  category: NotificationCategory
  source: string
  priority: NotificationPriority
  createdAt: string
  updatedAt: string
  readAt: string | null
  archivedAt: string | null
  starred: boolean
  taskStatus: 'pending' | 'done' | null
  revision: number
  /** 收件序号用于“全部已读”的截止边界，后续收藏等修改不改变它。 */
  receivedRevision?: number
  target?: { type: 'route' | 'task'; path?: string; resourceId?: string }
  attachments?: NotificationAttachment[]
  dispatchId?: string
}
export interface NotificationQuery {
  status: NotificationStatus
  keyword: string
  category?: NotificationCategory
  source?: string
  priority?: NotificationPriority
  dateFrom?: string
  dateTo?: string
  page: number
  pageSize: number
}
export interface NotificationStats {
  total: number
  unread: number
  read: number
  todo: number
  done: number
  archived: number
  starred: number
  /** 未归档消息的分类未读数；总计应与 unread 一致。 */
  byCategory: Record<NotificationCategory, number>
}
export interface NotificationSnapshot {
  items: NotificationRecord[]
  previewItems: NotificationRecord[]
  stats: NotificationStats
  total: number
  revision: number
  capabilities?: NotificationCapabilities
}
export interface NotificationCapabilities {
  manage: boolean
  realtime: boolean
  preferences: boolean
}
export interface NotificationCommand {
  type: NotificationMutation
  ids: string[]
  operationId: string
}
export interface NotificationMarkAllCommand {
  category?: NotificationCategory
  /** 只标记调用时已经存在的记录，不吞掉调用后抵达的新消息。 */
  throughRevision: number
  operationId: string
}
export interface NotificationTemplate {
  id: string
  name: string
  title: string
  content: string
  category: NotificationCategory
  priority: NotificationPriority
  channels: NotificationChannel[]
  enabled: boolean
  revision: number
  updatedAt: string
}
export type NotificationTemplateDraft = Omit<
  NotificationTemplate,
  'id' | 'revision' | 'updatedAt'
> & { id?: string; revision?: number; operationId?: string }
export interface NotificationDispatch {
  id: string
  title: string
  content: string
  category: NotificationCategory
  priority: NotificationPriority
  channels: NotificationChannel[]
  audience: 'self' | 'department' | 'company'
  templateId?: string
  scheduledAt: string | null
  status: 'draft' | 'scheduled' | 'sent' | 'withdrawn'
  revision: number
  createdAt: string
  updatedAt: string
}
export type NotificationDispatchDraft = Omit<
  NotificationDispatch,
  'id' | 'revision' | 'createdAt' | 'updatedAt' | 'status'
> & { id?: string; revision?: number; operationId?: string }
export interface NotificationDelivery {
  id: string
  dispatchId: string
  channel: NotificationChannel
  status: 'pending' | 'delivered' | 'failed' | 'withdrawn'
  attempts: number
  error: string | null
  updatedAt: string
}
export interface NotificationAudit {
  id: string
  action: string
  resourceId: string
  at: string
  actorId: string
  detail: string
}
export interface NotificationPreferences {
  categories: Record<NotificationCategory, boolean>
  channels: Record<NotificationChannel, boolean>
  quietHours: { enabled: boolean; start: string; end: string }
}
export interface NotificationGovernance {
  templates: NotificationTemplate[]
  dispatches: NotificationDispatch[]
  deliveries: NotificationDelivery[]
  audit: NotificationAudit[]
}
export interface NotificationService {
  readonly mode: 'demo' | 'remote'
  readonly capabilities: NotificationCapabilities
  query(
    query: NotificationQuery,
    signal?: AbortSignal
  ): Promise<NotificationSnapshot>
  detail(id: string, signal?: AbortSignal): Promise<NotificationRecord>
  mutate(command: NotificationCommand, signal?: AbortSignal): Promise<void>
  markAllRead(
    command: NotificationMarkAllCommand,
    signal?: AbortSignal
  ): Promise<void>
  clearMessages(
    command: NotificationMarkAllCommand,
    signal?: AbortSignal
  ): Promise<void>
  governance(signal?: AbortSignal): Promise<NotificationGovernance>
  saveTemplate(
    draft: NotificationTemplateDraft,
    signal?: AbortSignal
  ): Promise<NotificationTemplate>
  deleteTemplate(
    id: string,
    revision: number,
    signal?: AbortSignal
  ): Promise<void>
  saveDispatch(
    draft: NotificationDispatchDraft,
    signal?: AbortSignal
  ): Promise<NotificationDispatch>
  sendDispatch(
    id: string,
    revision: number,
    operationId: string,
    signal?: AbortSignal
  ): Promise<void>
  withdrawDispatch(
    id: string,
    revision: number,
    signal?: AbortSignal
  ): Promise<void>
  retryDelivery(id: string, signal?: AbortSignal): Promise<void>
  getPreferences(signal?: AbortSignal): Promise<NotificationPreferences>
  savePreferences(
    preferences: NotificationPreferences,
    signal?: AbortSignal
  ): Promise<void>
  subscribe(listener: () => void): () => void
  setOnline?(online: boolean): void
  simulateIncoming?(kind?: 'notification' | 'task'): Promise<void>
  simulateFailure?(operation?: string): void
  resetDemo?(): Promise<void>
  dispose(): void
}
export const defaultNotificationQuery = (): NotificationQuery => ({
  status: 'all',
  keyword: '',
  page: 1,
  pageSize: 10,
})
export const emptyNotificationStats = (): NotificationStats => ({
  total: 0,
  unread: 0,
  read: 0,
  todo: 0,
  done: 0,
  archived: 0,
  starred: 0,
  byCategory: { system: 0, business: 0, alarm: 0 },
})
export const notificationScopeKey = (scope: NotificationScope): string =>
  [scope.userId, scope.tenantId, scope.companyId]
    .map(encodeURIComponent)
    .join(':')
