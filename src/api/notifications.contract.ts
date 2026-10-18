/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.contract.ts
 * @Description: 企业消息领域协议；演示与未来 HTTP 服务使用同一契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export type NotificationTopic = 'general' | 'workflow'
export type NotificationTaskStatus =
  'pending' | 'in_progress' | 'done' | 'cancelled'
export type NotificationWorkflowStatus =
  'pending' | 'approved' | 'rejected' | 'returned' | 'withdrawn' | 'cancelled'
export type NotificationWorkflowRelationship = 'assignee' | 'initiator' | 'cc'
export type NotificationWorkflowAction =
  'approve' | 'reject' | 'return' | 'withdraw'
export interface NotificationWorkflowHistory {
  id: string
  action: NotificationWorkflowAction | 'submit' | 'cancel'
  actor: string
  at: string
  node: string
  comment: string
}
export interface NotificationWorkflow {
  instanceId: string
  processName: string
  businessNo: string
  initiator: string
  currentNode: string
  relationship: NotificationWorkflowRelationship
  status: NotificationWorkflowStatus
  dueAt?: string | null
  history: NotificationWorkflowHistory[]
}
export interface NotificationWorkflowCommand {
  recordId: string
  action: NotificationWorkflowAction
  comment: string
  revision: number
  operationId: string
}
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
  | 'start-task'
  | 'complete-task'
  | 'cancel-task'
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
  /** 主题与系统/业务/告警类别正交；旧记录缺省为通用通知。 */
  topic?: NotificationTopic
  workflow?: NotificationWorkflow
  source: string
  priority: NotificationPriority
  createdAt: string
  updatedAt: string
  readAt: string | null
  archivedAt: string | null
  starred: boolean
  taskStatus: NotificationTaskStatus | null
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
  topic?: NotificationTopic
  workflowStatus?: NotificationWorkflowStatus
  taskStatus?: NotificationTaskStatus
  relationship?: NotificationWorkflowRelationship
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
  /** 未归档的主题总数；旧远端未提供时保持未知，禁止从预览推算。 */
  byTopic?: Record<NotificationTopic, number>
  /** 当前用户可审批且仍在待审的全量记录数。 */
  workflowPending?: number
  /** 当前用户待处理且已超过截止时间的全量记录数。 */
  overdue?: number
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
  workflow?: boolean
}
export interface NotificationCommand {
  type: NotificationMutation
  ids: string[]
  operationId: string
}
export interface NotificationMarkAllCommand {
  topic?: NotificationTopic
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
  workflowAction?(
    command: NotificationWorkflowCommand,
    signal?: AbortSignal
  ): Promise<NotificationRecord>
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
  simulateIncoming?(kind?: 'notification' | 'task' | 'workflow'): Promise<void>
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
  byTopic: { general: 0, workflow: 0 },
  workflowPending: 0,
  overdue: 0,
})
export const notificationScopeKey = (scope: NotificationScope): string =>
  [scope.userId, scope.tenantId, scope.companyId]
    .map(encodeURIComponent)
    .join(':')
