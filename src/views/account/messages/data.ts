/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\views\account\messages\data.ts
 * @Description: 企业消息中心选项、表单配置与安全展示规则
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  PRESET_RULES,
  type FormOption,
} from '@robot-admin/naive-ui-components/C_Form'
import type {
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  NotificationRecord,
  NotificationStatus,
} from '@/api/notifications.contract'

export const CATEGORY_OPTIONS = [
  { label: '系统通知', value: 'system' },
  { label: '业务消息', value: 'business' },
  { label: '风险告警', value: 'alarm' },
]
export const PRIORITY_OPTIONS = [
  { label: '低', value: 'low' },
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
]
export const CHANNEL_OPTIONS = [
  { label: '站内信', value: 'inbox' },
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: '企业微信', value: 'wecom' },
]
export const INBOX_TABS: { label: string; value: NotificationStatus }[] = [
  { label: '全部', value: 'all' },
  { label: '未读', value: 'unread' },
  { label: '待办', value: 'todo' },
  { label: '已完成', value: 'done' },
  { label: '星标', value: 'starred' },
  { label: '归档', value: 'archived' },
]
export const DISPATCH_STATUS = {
  draft: '草稿',
  scheduled: '待定时发送',
  sent: '已发送',
  withdrawn: '已撤回',
}
export const DELIVERY_STATUS = {
  pending: '待投递',
  delivered: '已送达',
  failed: '投递失败',
  withdrawn: '已撤回',
}
export const AUDIT_ACTION_LABELS: Readonly<Record<string, string>> = {
  read: '标为已读',
  unread: '标为未读',
  archive: '归档消息',
  unarchive: '恢复收件',
  star: '添加星标',
  unstar: '取消星标',
  delete: '删除消息',
  'complete-task': '完成待办',
  'mark-all-read': '全部标为已读',
  'clear-messages': '清空消息',
  'save-template': '保存模板',
  'delete-template': '删除模板',
  'save-dispatch': '保存草稿',
  'send-dispatch': '发送消息',
  'scheduled-send': '执行定时发送',
  'withdraw-dispatch': '撤回消息',
  'retry-delivery': '重试投递',
  'save-preferences': '保存通知偏好',
  'simulate-incoming': '生成演示消息',
}
export interface MessageEditor {
  name: string
  title: string
  content: string
  category: NotificationCategory
  priority: NotificationPriority
  channels: NotificationChannel[]
  enabled: boolean
}

/** 创建独立编辑模型，避免模板与草稿共享数组。 */
export const createMessageEditor = (): MessageEditor => ({
  name: '',
  title: '',
  content: '',
  category: 'business',
  priority: 'normal',
  channels: ['inbox'],
  enabled: true,
})

/** 消息与模板复用同一套校验及字段配置。 */
export const getEditorOptions = (
  template = false
): FormOption<MessageEditor>[] => [
  ...(template
    ? [
        {
          prop: 'name' as const,
          type: 'input',
          label: '模板名称',
          attrs: { maxlength: 60, showCount: true },
          rules: [PRESET_RULES.required('模板名称')],
        },
      ]
    : []),
  {
    prop: 'title',
    type: 'input',
    label: '消息标题',
    attrs: { maxlength: 120, showCount: true },
    rules: [PRESET_RULES.required('消息标题')],
  },
  {
    prop: 'content',
    type: 'input',
    label: '消息正文',
    attrs: { type: 'textarea', rows: 5, maxlength: 6000, showCount: true },
    rules: [PRESET_RULES.required('消息正文')],
  },
  {
    prop: 'category',
    type: 'select',
    label: '消息分类',
    children: CATEGORY_OPTIONS,
    rules: [PRESET_RULES.required('消息分类')],
  },
  {
    prop: 'priority',
    type: 'select',
    label: '优先级',
    children: PRIORITY_OPTIONS,
    rules: [PRESET_RULES.required('优先级')],
  },
  {
    prop: 'channels',
    type: 'select',
    label: '投递通道',
    children: CHANNEL_OPTIONS,
    attrs: { multiple: true },
    rules: [
      {
        type: 'array',
        required: true,
        min: 1,
        message: '至少选择一个投递通道',
        trigger: 'change',
      },
    ],
  },
  ...(template
    ? [{ prop: 'enabled' as const, type: 'switch', label: '启用模板' }]
    : []),
]

/** 格式化服务端时间；非法时间不传播到界面。 */
export const formatMessageTime = (value: string): string => {
  const time = new Date(value)
  return Number.isNaN(time.getTime())
    ? '—'
    : time.toLocaleString('zh-CN', { hour12: false })
}

/** 选项标签统一用于表格、详情和治理面板。 */
export const getOptionLabel = (
  options: readonly { label: string; value: string }[],
  value: string
): string => options.find(item => item.value === value)?.label ?? value

/** 由消息状态派生展示文案，阅读状态与待办办理状态互相独立。 */
export const getMessageState = (item: NotificationRecord): string => {
  if (item.archivedAt) return '已归档'
  if (item.taskStatus === 'pending') return '待办理'
  if (item.taskStatus === 'done') return '已完成'
  return item.readAt ? '已读' : '未读'
}
