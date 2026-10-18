/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息表格序号、阅读与业务办理状态的独立呈现
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import type {
  NotificationQuery,
  NotificationRecord,
} from '@/api/notifications.contract'
import type { s_notificationStore } from '@/stores/notification'
import {
  getNotificationIcon,
  getNotificationPriorityLabel,
  getNotificationPriorityTone,
  getNotificationTaskLabel,
  getNotificationTaskTone,
  getNotificationTopic,
  getNotificationTopicLabel,
  getNotificationWorkflowLabel,
  getNotificationWorkflowRelationLabel,
  getNotificationWorkflowTone,
  type NotificationTone,
} from '@/utils/d_notificationPresentation'
import { CATEGORY_OPTIONS, formatMessageTime, getOptionLabel } from '../data'

/** 跨页连续编号始终使用已成功提交的分页条件。 */
export const getMessageRowNumber = (
  query: Pick<NotificationQuery, 'page' | 'pageSize'>,
  index: number
): number => (query.page - 1) * query.pageSize + index + 1

/** 统一轻量标签，保留文字以便无颜色环境仍可辨认。 */
const statusTag = (label: string, type: NotificationTone = 'default') =>
  h(
    NTag,
    { size: 'small', bordered: false, type, round: true },
    { default: () => label }
  )

/** 办理状态与审批流程结果分开显示，普通通知不制造待办状态。 */
const handlingCell = (row: NotificationRecord) => {
  if (row.workflow)
    return h('div', { class: 'message-handling-cell' }, [
      statusTag(
        getNotificationWorkflowLabel(row.workflow.status),
        getNotificationWorkflowTone(row.workflow.status)
      ),
      h(
        'small',
        { class: 'message-secondary' },
        getNotificationWorkflowRelationLabel(row.workflow.relationship)
      ),
    ])
  return row.taskStatus
    ? statusTag(
        getNotificationTaskLabel(row.taskStatus),
        getNotificationTaskTone(row.taskStatus)
      )
    : h('span', { class: 'message-secondary' }, '无需办理')
}

interface MessageColumnsOptions {
  store: ReturnType<typeof s_notificationStore>
  busy: () => boolean
  open: (id: string) => void
  star: (row: NotificationRecord) => void
}

/** 表格只负责展示及触发命令，权威查询与状态由消息领域管理。 */
export function useMessageColumns(options: MessageColumnsOptions) {
  const { store, open, star, busy } = options
  return computed<TableColumn<NotificationRecord>[]>(() => [
    { type: 'selection', width: 44 },
    {
      key: 'serialNumber',
      title: '序号',
      width: 62,
      align: 'center',
      render: (_row, index) =>
        h(
          'span',
          { class: 'message-row-number' },
          getMessageRowNumber(store.query, index)
        ),
    },
    {
      key: 'title',
      title: '消息主题',
      align: 'left',
      minWidth: 300,
      render: row =>
        h(
          'div',
          { class: ['message-title-cell', { 'is-unread': !row.readAt }] },
          [
            h('span', {
              class: ['message-type-icon', getNotificationIcon(row)],
              'aria-hidden': 'true',
            }),
            h('div', { class: 'message-title-content' }, [
              h(
                NButton,
                {
                  text: true,
                  onClick: () => open(row.id),
                  class: 'message-title-button',
                },
                { default: () => row.title }
              ),
              h(
                'div',
                { class: 'message-summary', title: row.summary },
                row.workflow
                  ? `${row.workflow.initiator}发起 · ${row.workflow.currentNode}`
                  : row.summary
              ),
              row.workflow
                ? h(
                    'span',
                    { class: 'message-business-number' },
                    row.workflow.businessNo
                  )
                : null,
            ]),
            !row.readAt
              ? h('span', {
                  class: 'message-unread-dot',
                  title: '未读',
                  'aria-label': '未读',
                })
              : null,
          ]
        ),
    },
    {
      key: 'category',
      title: '分类 / 来源',
      align: 'left',
      width: 150,
      render: row =>
        h('div', { class: 'message-source-cell' }, [
          h('span', getNotificationTopicLabel(getNotificationTopic(row))),
          h(
            'small',
            { class: 'message-secondary' },
            `${getOptionLabel(CATEGORY_OPTIONS, row.category)} · ${row.source}`
          ),
        ]),
    },
    {
      key: 'readAt',
      title: '阅读状态',
      width: 92,
      render: row =>
        statusTag(
          row.readAt ? '已读' : '未读',
          row.readAt ? 'default' : 'info'
        ),
    },
    {
      key: 'taskStatus',
      title: '办理 / 流程状态',
      align: 'left',
      width: 144,
      render: handlingCell,
    },
    {
      key: 'priority',
      title: '优先级',
      width: 88,
      render: row =>
        statusTag(
          getNotificationPriorityLabel(row.priority),
          getNotificationPriorityTone(row.priority)
        ),
    },
    {
      key: 'createdAt',
      title: '收到时间',
      align: 'left',
      width: 166,
      render: row =>
        h(
          'time',
          { dateTime: row.createdAt, class: 'message-time' },
          formatMessageTime(row.createdAt)
        ),
    },
    {
      key: 'starred',
      title: '关注',
      width: 64,
      align: 'center',
      render: row =>
        h(
          NButton,
          {
            text: true,
            type: row.starred ? 'warning' : 'default',
            disabled: busy(),
            'aria-label': row.starred ? '取消星标' : '添加星标',
            onClick: () => star(row),
          },
          {
            default: () =>
              h('span', {
                class: row.starred
                  ? 'i-mdi-star-outline'
                  : 'i-mdi-star-outline',
                'aria-hidden': 'true',
              }),
          }
        ),
    },
  ])
}
