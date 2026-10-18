/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息入口的可分享筛选参数与显式枚举校验
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import type { NotificationQuery } from '@/api/notifications.contract'
import {
  INBOX_TABS,
  TASK_STATUS_OPTIONS,
  WORKFLOW_RELATION_OPTIONS,
  WORKFLOW_STATUS_OPTIONS,
} from '../data'

/** 只接受单个已登记枚举，数组与未知值不进入查询协议。 */
const routeOption = <T extends string>(
  value: unknown,
  options: readonly { value: T }[]
): T | undefined => options.find(option => option.value === value)?.value

/** 顶部预览链接和页面刷新采用相同筛选语义。 */
export const parseMessageRouteQuery = (
  query: LocationQuery
): Partial<NotificationQuery> | null => {
  const patch: Partial<NotificationQuery> = {
    topic: routeOption(query.topic, [
      { value: 'general' },
      { value: 'workflow' },
    ] as const),
    status: routeOption(query.status, INBOX_TABS),
    relationship: routeOption(
      query.relationship,
      WORKFLOW_RELATION_OPTIONS
    ) as NotificationQuery['relationship'],
    workflowStatus: routeOption(
      query.workflowStatus,
      WORKFLOW_STATUS_OPTIONS
    ) as NotificationQuery['workflowStatus'],
    taskStatus: routeOption(
      query.taskStatus,
      TASK_STATUS_OPTIONS
    ) as NotificationQuery['taskStatus'],
  }
  if (!Object.values(patch).some(value => value !== undefined)) return null
  return { ...patch, status: patch.status ?? 'all' }
}

/** URL仅记录业务入口和状态，不将正文搜索或时间草稿混入路由。 */
export const toMessageRouteQuery = (
  query: NotificationQuery
): LocationQueryRaw => ({
  status: query.status,
  topic: query.topic,
  relationship: query.relationship,
  workflowStatus: query.workflowStatus,
  taskStatus: query.taskStatus,
})

/** 由页面自身同步的 URL 不再触发重复查询。 */
export const matchesMessageRouteQuery = (
  query: NotificationQuery,
  patch: Partial<NotificationQuery>
): boolean =>
  (
    ['topic', 'status', 'relationship', 'workflowStatus', 'taskStatus'] as const
  ).every(key => query[key] === patch[key])
