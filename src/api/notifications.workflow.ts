/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.workflow.ts
 * @Description: 审批专用状态机与权限判断，阅读及普通待办命令不能推进流程
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationRecord,
  NotificationWorkflowCommand,
  NotificationWorkflowStatus,
} from './notifications.contract'
import { createNotificationId } from './notifications.id'

/** 兼容缺省主题的历史收件；流程实例始终归入审批主题。 */
export const resolveNotificationTopic = (item: NotificationRecord) =>
  item.workflow ? 'workflow' : (item.topic ?? 'general')

/** 我的待办只包含普通任务及当前分配给我的待审流程。 */
export const isNotificationTodo = (item: NotificationRecord): boolean => {
  if (item.workflow)
    return (
      item.workflow.status === 'pending' &&
      item.workflow.relationship === 'assignee'
    )
  return item.taskStatus === 'pending' || item.taskStatus === 'in_progress'
}

/** 根据当前节点、参与关系及审批状态列出允许的流程动作。 */
export const getNotificationWorkflowActions = (
  item: NotificationRecord
): NotificationWorkflowCommand['action'][] => {
  const { workflow } = item
  if (!workflow || workflow.status !== 'pending' || item.archivedAt) return []
  if (workflow.relationship === 'assignee')
    return ['approve', 'reject', 'return']
  return workflow.relationship === 'initiator' ? ['withdraw'] : []
}

/** 审批提交校验采用客户端快照版本；真实服务仍必须核验会话和服务端分配关系。 */
export const validateNotificationWorkflowCommand = (
  command: NotificationWorkflowCommand
) => {
  const validIds = [command.recordId, command.operationId].every(
    value =>
      typeof value === 'string' &&
      !!value &&
      value.length <= 256 &&
      value.trim() === value
  )
  if (
    !validIds ||
    !Number.isSafeInteger(command.revision) ||
    command.revision < 0
  )
    throw new Error('审批请求缺少有效记录、版本或幂等标识')
  if (!['approve', 'reject', 'return', 'withdraw'].includes(command.action))
    throw new Error('审批操作无效')
  if (typeof command.comment !== 'string' || command.comment.length > 1000)
    throw new Error('审批意见最多 1000 字')
  if (['reject', 'return'].includes(command.action) && !command.comment.trim())
    throw new Error('驳回或退回必须填写审批意见')
}

/** 只在当前用户有权办理且版本一致时推进一个审批实例。 */
export const applyNotificationWorkflowAction = (
  item: NotificationRecord,
  command: NotificationWorkflowCommand,
  actor: string,
  at: string,
  revision: number
): NotificationRecord => {
  validateNotificationWorkflowCommand(command)
  if (item.revision !== command.revision)
    throw new Error('审批已被其他操作更新，请刷新后重试')
  if (!getNotificationWorkflowActions(item).includes(command.action))
    throw new Error('当前参与关系或流程状态不允许此审批操作')
  const workflow = item.workflow!
  const statuses: Record<
    NotificationWorkflowCommand['action'],
    NotificationWorkflowStatus
  > = {
    approve: 'approved',
    reject: 'rejected',
    return: 'returned',
    withdraw: 'withdrawn',
  }
  workflow.history = workflow.history.slice(-199)
  workflow.history.push({
    id: createNotificationId(),
    action: command.action,
    actor,
    at,
    node: workflow.currentNode,
    comment: command.comment.trim(),
  })
  workflow.status = statuses[command.action]
  workflow.currentNode = command.action === 'return' ? '申请人修改' : '流程结束'
  item.taskStatus = item.kind === 'task' ? 'done' : null
  item.readAt ??= at
  item.updatedAt = at
  item.revision = revision
  return structuredClone(item)
}
