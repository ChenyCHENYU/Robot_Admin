/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\utils\d_notificationPresentation.ts
 * @Description: 消息预览、列表与详情共用的业务分类和独立状态呈现
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationPriority,
  NotificationRecord,
  NotificationStatus,
  NotificationTopic,
} from '@/api/notifications.contract'

export type NotificationTone =
  'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'

export const notificationTopicOptions = [
  { value: 'all', label: '全部' },
  { value: 'general', label: '通用消息' },
  { value: 'workflow', label: '审批流程' },
] as const

export const notificationStatusOptions: {
  value: NotificationStatus
  label: string
}[] = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读' },
  { value: 'read', label: '已读' },
  { value: 'todo', label: '待办' },
  { value: 'done', label: '已办' },
]

/** 旧消息缺少业务分类时，根据显式流程信息兼容归类。 */
export const getNotificationTopic = (
  item: Pick<NotificationRecord, 'topic' | 'workflow'>
): NotificationTopic => (item.workflow ? 'workflow' : (item.topic ?? 'general'))

/** 业务分类独立于系统、业务、告警等来源维度。 */
export const getNotificationTopicLabel = (topic: NotificationTopic): string =>
  topic === 'workflow' ? '审批流程' : '通用消息'

const taskLabels = {
  pending: '待办',
  in_progress: '处理中',
  done: '已办',
  cancelled: '已取消',
} as const

/** 阅读不会完成任务，任务标签始终取独立任务状态。 */
export const getNotificationTaskLabel = (
  status: NotificationRecord['taskStatus']
): string => (status ? taskLabels[status] : '')

/** 任务状态使用统一语义色。 */
export const getNotificationTaskTone = (
  status: NotificationRecord['taskStatus']
): NotificationTone => {
  if (status === 'done') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'in_progress') return 'info'
  return 'default'
}

type Workflow = NonNullable<NotificationRecord['workflow']>
const workflowLabels: Record<Workflow['status'], string> = {
  pending: '审批中',
  approved: '已通过',
  rejected: '已驳回',
  returned: '已退回',
  withdrawn: '已撤回',
  cancelled: '已取消',
}

/** 流程结果和个人任务状态各自展示，避免把“已读”误当“已办”。 */
export const getNotificationWorkflowLabel = (
  status: Workflow['status']
): string => workflowLabels[status]

/** 审批流程状态使用统一语义色。 */
export const getNotificationWorkflowTone = (
  status: Workflow['status']
): NotificationTone => {
  if (status === 'approved') return 'success'
  if (status === 'pending') return 'info'
  if (status === 'rejected') return 'error'
  if (status === 'returned') return 'warning'
  return 'default'
}

/** 区分我的审批、我发起的流程与抄送消息。 */
export const getNotificationWorkflowRelationLabel = (
  relationship: Workflow['relationship']
): string =>
  ({ assignee: '由我审批', initiator: '我发起的', cc: '抄送给我' })[
    relationship
  ]

/** 优先级只描述紧急程度，不替代任务或审批状态。 */
export const getNotificationPriorityLabel = (
  priority: NotificationPriority
): string =>
  ({ low: '低', normal: '普通', high: '重要', urgent: '紧急' })[priority]

/** 优先级采用同一套可识别语义色。 */
export const getNotificationPriorityTone = (
  priority: NotificationPriority
): NotificationTone => {
  if (priority === 'urgent') return 'error'
  if (priority === 'high') return 'warning'
  return 'default'
}

/** 紧凑时间显示；完整时间仍由列表元素的 title 提供。 */
export const getNotificationRelativeTime = (
  value: string,
  now = Date.now()
): string => {
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return '时间未知'
  const minutes = Math.max(0, Math.floor((now - time) / 60_000))
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时前`
  if (minutes < 10_080) return `${Math.floor(minutes / 1440)} 天前`
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  }).format(time)
}

/** 无来源文案时保留明确且稳定的兜底名称。 */
export const getNotificationSourceLabel = (
  item: Pick<NotificationRecord, 'source'>
): string => item.source || '消息服务'

/** 静态图标名称由 UnoCSS 扫描，避免运行时请求图标资源。 */
export const getNotificationIcon = (
  item: Pick<NotificationRecord, 'topic' | 'workflow' | 'category'>
): string => {
  if (getNotificationTopic(item) === 'workflow') return 'i-mdi-source-branch'
  if (item.category === 'alarm') return 'i-mdi-alert'
  if (item.category === 'business') return 'i-mdi-domain'
  return 'i-mdi-bell-outline'
}
