/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\notification.d.ts
 * @Description: 通知中心类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

// ─── 消息基础类型 ───────────────────────────────

/** 消息类别 */
export type NotificationCategory = 'system' | 'business' | 'alarm'

/** 消息优先级 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

/** 消息状态 */
export type NotificationStatus = 'unread' | 'read' | 'archived'

/** 单条通知消息 */
export interface NotificationMessage {
  /** 消息唯一 ID */
  id: string
  /** 消息标题 */
  title: string
  /** 消息摘要（列表中展示） */
  summary: string
  /** 消息详情（富文本 / 纯文本） */
  content?: string
  /** 消息类别 */
  category: NotificationCategory
  /** 优先级 */
  priority: NotificationPriority
  /** 消息状态 */
  status: NotificationStatus
  /** 发送时间（ISO 8601） */
  timestamp: string
  /** 发送者信息 */
  sender?: NotificationSender
  /** 关联操作链接 */
  actionUrl?: string
  /** 关联操作按钮文本 */
  actionText?: string
  /** 附加数据（业务扩展） */
  extra?: Record<string, unknown>
}

/** 发送者信息 */
export interface NotificationSender {
  /** 发送者名称 */
  name: string
  /** 发送者头像 URL */
  avatar?: string
}

// ─── API 函数签名 ───────────────────────────────

/** 拉取消息列表函数 */
export type FetchNotificationsFn = (params: {
  category?: NotificationCategory
  status?: NotificationStatus
  page?: number
  pageSize?: number
}) => Promise<{
  list: NotificationMessage[]
  total: number
  unreadCount: number
}>

/** 标记已读函数 */
export type MarkAsReadFn = (ids: string[]) => Promise<void>

/** 标记全部已读函数 */
export type MarkAllReadFn = (category?: NotificationCategory) => Promise<void>

/** 删除消息函数 */
export type DeleteNotificationFn = (ids: string[]) => Promise<void>

/** 清空消息函数 */
export type ClearNotificationsFn = (
  category?: NotificationCategory
) => Promise<void>

// ─── WebSocket 类型 ──────────────────────────────

/** WebSocket 配置 */
export interface NotificationWSConfig {
  /** WebSocket 地址（ws:// 或 wss://） */
  url: string
  /** 自动重连 */
  autoReconnect?: boolean
  /** 重连间隔（ms） */
  reconnectInterval?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 心跳间隔（ms），0 表示不发心跳 */
  heartbeatInterval?: number
  /** 心跳消息内容 */
  heartbeatMessage?: string
  /** 鉴权 token 获取函数 */
  getToken?: () => string | undefined
}

/** WebSocket 连接状态 */
export type WSConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'

/** WebSocket 推送消息负载 */
export interface WSNotificationPayload {
  /** 事件类型 */
  type: 'new_message' | 'read_sync' | 'count_update'
  /** 推送的消息数据 */
  data: NotificationMessage | NotificationMessage[] | { unreadCount: number }
}

// ─── 组件 Props / Emits / Expose ────────────────

/** 组件 Props */
export interface NotificationCenterProps {
  /** 拉取消息列表 */
  fetchNotifications?: FetchNotificationsFn
  /** 标记已读 */
  markAsRead?: MarkAsReadFn
  /** 标记全部已读 */
  markAllRead?: MarkAllReadFn
  /** 删除消息 */
  deleteNotification?: DeleteNotificationFn
  /** 清空消息 */
  clearNotifications?: ClearNotificationsFn
  /** WebSocket 配置 */
  wsConfig?: NotificationWSConfig
  /** 是否启用桌面通知 */
  desktopNotification?: boolean
  /** 角标最大显示数 */
  maxBadgeCount?: number
  /** 自动轮询间隔（ms），0 表示不轮询 */
  pollingInterval?: number
  /** 每页条数 */
  pageSize?: number
  /** 消息持久化缓存 key */
  storageKey?: string
}

/** 组件 Emits */
export interface NotificationCenterEmits {
  /** 点击消息 */
  itemClick: [message: NotificationMessage]
  /** 消息已读 */
  read: [ids: string[]]
  /** 全部已读 */
  allRead: [category?: NotificationCategory]
  /** 删除消息 */
  delete: [ids: string[]]
  /** 未读数变化 */
  unreadChange: [count: number]
  /** WebSocket 连接状态变化 */
  wsStatusChange: [status: WSConnectionStatus]
  /** 收到新消息 */
  newMessage: [message: NotificationMessage]
}

/** 组件 Expose */
export interface NotificationCenterExpose {
  /** 刷新消息列表 */
  refresh: () => Promise<void>
  /** 手动连接 WebSocket */
  connectWS: () => void
  /** 手动断开 WebSocket */
  disconnectWS: () => void
  /** 获取未读数 */
  getUnreadCount: () => number
  /** 获取当前消息列表 */
  getMessages: () => NotificationMessage[]
  /** 手动标记已读 */
  markRead: (ids: string[]) => Promise<void>
  /** 手动标记全部已读 */
  markAllAsRead: (category?: NotificationCategory) => Promise<void>
}
