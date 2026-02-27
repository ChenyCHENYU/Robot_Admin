/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_NotificationCenter\constants.ts
 * @Description: 通知中心常量配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  NotificationCategory,
  NotificationPriority,
} from '@/types/modules/notification'

// ─── 默认配置 ───────────────────────────────────

/** 默认角标最大显示数 */
export const DEFAULT_MAX_BADGE_COUNT = 99

/** 默认每页条数 */
export const DEFAULT_PAGE_SIZE = 20

/** 默认轮询间隔（ms）：60 秒 */
export const DEFAULT_POLLING_INTERVAL = 60_000

/** 默认缓存 key */
export const DEFAULT_STORAGE_KEY = 'notification_center'

/** WebSocket 默认重连间隔（ms） */
export const DEFAULT_WS_RECONNECT_INTERVAL = 3_000

/** WebSocket 默认最大重连次数 */
export const DEFAULT_WS_MAX_RECONNECT = 5

/** WebSocket 默认心跳间隔（ms） */
export const DEFAULT_WS_HEARTBEAT_INTERVAL = 30_000

/** WebSocket 默认心跳消息 */
export const DEFAULT_WS_HEARTBEAT_MESSAGE = 'ping'

// ─── 分类配置 ───────────────────────────────────

/** 分类标签映射 */
export const CATEGORY_MAP: Record<
  NotificationCategory,
  {
    label: string
    icon: string
    color: string
  }
> = {
  system: {
    label: '系统通知',
    icon: 'i-mdi:cog-outline',
    color: 'info',
  },
  business: {
    label: '业务消息',
    icon: 'i-mdi:briefcase-outline',
    color: 'success',
  },
  alarm: {
    label: '告警预警',
    icon: 'i-mdi:alert-outline',
    color: 'warning',
  },
}

/** 分类 Tab 列表 */
export const CATEGORY_TABS: {
  key: NotificationCategory | 'all'
  label: string
}[] = [
  { key: 'all', label: '全部' },
  { key: 'system', label: '系统通知' },
  { key: 'business', label: '业务消息' },
  { key: 'alarm', label: '告警预警' },
]

// ─── 优先级配置 ──────────────────────────────────

/** 优先级标签映射 */
export const PRIORITY_MAP: Record<
  NotificationPriority,
  {
    label: string
    type: 'default' | 'info' | 'success' | 'warning' | 'error'
  }
> = {
  low: { label: '低', type: 'default' },
  normal: { label: '普通', type: 'info' },
  high: { label: '重要', type: 'warning' },
  urgent: { label: '紧急', type: 'error' },
}

// ─── 模拟数据（开发环境使用） ─────────────────────

/** 模拟消息列表 */
export const MOCK_MESSAGES = [
  {
    id: 'msg-001',
    title: '系统维护通知',
    summary:
      '系统将于今晚 22:00-23:00 进行例行维护升级，届时部分功能可能暂时不可用。',
    content:
      '<p>尊敬的用户：</p><p>为了提升系统性能和稳定性，我们计划于 <strong>2026年2月27日 22:00-23:00</strong> 对系统进行例行维护升级。</p><p>维护期间，以下功能可能暂时不可用：</p><ul><li>报表导出</li><li>数据同步</li><li>定时任务</li></ul><p>请提前保存好未完成的工作，感谢您的理解与支持！</p>',
    category: 'system' as const,
    priority: 'high' as const,
    status: 'unread' as const,
    timestamp: new Date(Date.now() - 15 * 60_000).toISOString(),
    sender: { name: '系统管理员', avatar: '' },
  },
  {
    id: 'msg-002',
    title: '审批流程待处理',
    summary: '张三提交的《Q1 季度预算申请》需要您审批，请尽快处理。',
    category: 'business' as const,
    priority: 'urgent' as const,
    status: 'unread' as const,
    timestamp: new Date(Date.now() - 30 * 60_000).toISOString(),
    sender: {
      name: '张三',
      avatar:
        'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
    },
    actionUrl: '/workflow/approval',
    actionText: '去审批',
  },
  {
    id: 'msg-003',
    title: '服务器 CPU 使用率告警',
    summary:
      '生产环境节点 prod-node-03 CPU 使用率持续超过 90%，已触发告警阈值。',
    category: 'alarm' as const,
    priority: 'urgent' as const,
    status: 'unread' as const,
    timestamp: new Date(Date.now() - 2 * 60_000).toISOString(),
    sender: { name: '监控中心' },
    actionUrl: '/monitor/server',
    actionText: '查看详情',
  },
  {
    id: 'msg-004',
    title: '新版本发布 v1.14.0',
    summary: '系统已升级至 v1.14.0，新增通知中心、工作流增强等多项功能。',
    category: 'system' as const,
    priority: 'normal' as const,
    status: 'unread' as const,
    timestamp: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    sender: { name: '系统管理员' },
  },
  {
    id: 'msg-005',
    title: '项目交付提醒',
    summary: '「Robot Admin 二期」项目交付截止日期为 3月15日，当前进度 78%。',
    category: 'business' as const,
    priority: 'high' as const,
    status: 'read' as const,
    timestamp: new Date(Date.now() - 8 * 3_600_000).toISOString(),
    sender: { name: '项目管理系统' },
  },
  {
    id: 'msg-006',
    title: '数据库连接池告警',
    summary: '数据库连接池使用率达到 85%，建议关注并适时扩容。',
    category: 'alarm' as const,
    priority: 'high' as const,
    status: 'read' as const,
    timestamp: new Date(Date.now() - 12 * 3_600_000).toISOString(),
    sender: { name: '监控中心' },
  },
  {
    id: 'msg-007',
    title: '周报提交提醒',
    summary: '本周周报提交截止时间为周五 18:00，请及时提交。',
    category: 'business' as const,
    priority: 'normal' as const,
    status: 'read' as const,
    timestamp: new Date(Date.now() - 24 * 3_600_000).toISOString(),
    sender: { name: 'OA 系统' },
  },
  {
    id: 'msg-008',
    title: '账号安全提醒',
    summary: '检测到您的账号在新设备上登录，如非本人操作请及时修改密码。',
    category: 'system' as const,
    priority: 'high' as const,
    status: 'unread' as const,
    timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
    sender: { name: '安全中心' },
  },
]
