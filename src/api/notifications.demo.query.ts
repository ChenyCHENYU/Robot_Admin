/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.demo.query.ts
 * @Description: 消息全量权威统计与分页查询，阅读和待办状态分别计算
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import {
  emptyNotificationStats,
  type NotificationQuery,
  type NotificationRecord,
  type NotificationSnapshot,
  type NotificationStatus,
} from './notifications.contract'
import type { NotificationDemoDocument } from './notifications.demo.seed'

const statusMatches = (
  item: NotificationRecord,
  status: NotificationStatus
): boolean => {
  if (status === 'archived') return !!item.archivedAt
  if (item.archivedAt) return false
  const checks: Record<Exclude<NotificationStatus, 'archived'>, boolean> = {
    all: true,
    unread: !item.readAt,
    read: !!item.readAt,
    todo: item.taskStatus === 'pending',
    done: item.taskStatus === 'done',
    starred: item.starred,
  }
  return checks[status] ?? false
}

const dateBoundary = (
  value: string | undefined,
  end: boolean
): number | undefined => {
  if (!value) return
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T${end ? '23:59:59.999' : '00:00:00.000'}`
    : value
  const timestamp = Date.parse(date)
  if (!Number.isFinite(timestamp)) throw new Error('消息时间筛选无效')
  return timestamp
}
const matchesFields = (item: NotificationRecord, query: NotificationQuery) =>
  (!query.category || query.category === item.category) &&
  (!query.source || query.source === item.source) &&
  (!query.priority || query.priority === item.priority)

export const queryNotificationDocument = (
  document: NotificationDemoDocument,
  query: NotificationQuery
): NotificationSnapshot => {
  const stats = emptyNotificationStats()
  for (const item of document.items) {
    if (item.archivedAt) {
      stats.archived++
      continue
    }
    stats.total++
    if (item.readAt) stats.read++
    else {
      stats.unread++
      stats.byCategory[item.category]++
    }
    if (item.starred) stats.starred++
    if (item.taskStatus === 'pending') stats.todo++
    if (item.taskStatus === 'done') stats.done++
  }
  const sorted = [...document.items].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
  )
  const keyword = query.keyword.trim().toLocaleLowerCase()
  const from = dateBoundary(query.dateFrom, false)
  const to = dateBoundary(query.dateTo, true)
  const filtered = sorted.filter(item => {
    if (!statusMatches(item, query.status)) return false
    if (!matchesFields(item, query)) return false
    const at = Date.parse(item.createdAt)
    if (from !== undefined && at < from) return false
    if (to !== undefined && at > to) return false
    return (
      !keyword ||
      `${item.title} ${item.summary} ${item.source} ${item.content}`
        .toLocaleLowerCase()
        .includes(keyword)
    )
  })
  const start = (Math.max(1, query.page) - 1) * Math.max(1, query.pageSize)
  return structuredClone({
    items: filtered.slice(start, start + query.pageSize),
    previewItems: sorted.filter(item => !item.archivedAt).slice(0, 20),
    stats,
    total: filtered.length,
    revision: document.revision,
  })
}
