/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-20
 * @Description: 将已授权的消息详情投影为只读审批查看器数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationRecord,
  NotificationWorkflow,
} from '@/api/notifications.contract'
import type {
  ApprovalInstanceDetail,
  ApprovalInstanceStatus,
  ApprovalViewerSource,
} from '@robot-admin/naive-ui-components/C_ApprovalViewer'

const statusLabels = {
  pending: 'running',
  approved: 'approved',
  rejected: 'rejected',
  returned: 'terminated',
  withdrawn: 'withdrawn',
  cancelled: 'cancelled',
} satisfies Record<NotificationWorkflow['status'], ApprovalInstanceStatus>

export const workflowHistoryLabels = {
  submit: '发起申请',
  approve: '同意',
  reject: '驳回',
  return: '退回修改',
  withdraw: '撤回申请',
  cancel: '取消流程',
} satisfies Record<NotificationWorkflow['history'][number]['action'], string>

/** 只使用当前消息详情提供的审批信息，演示模式额外补一条样本。 */
export function createMessageApprovalSource(
  record: NotificationRecord,
  workflow: NotificationWorkflow,
  demo: boolean
): ApprovalViewerSource {
  const history = workflow.history
    .map(event => ({
      id: event.id,
      title: `${workflowHistoryLabels[event.action]} · ${event.node}`,
      actor: event.actor,
      comment: event.comment,
      occurredAt: Date.parse(event.at),
    }))
    .filter(event => Number.isFinite(event.occurredAt))
    .sort((first, second) => first.occurredAt - second.occurredAt)
  const startedAt = history[0]?.occurredAt ?? Date.parse(record.createdAt)
  const current: ApprovalInstanceDetail = {
    id: workflow.instanceId,
    label:
      workflow.status === 'returned'
        ? `${workflow.processName} · 已退回修改`
        : workflow.processName,
    status: statusLabels[workflow.status],
    startedAt,
    initiator: workflow.initiator,
    finishedAt:
      workflow.status === 'pending' ? undefined : history.at(-1)?.occurredAt,
    history,
  }
  const instances = [current]
  // 消息接口只提供当前实例。追加旧记录仅用于演示切换，不参与业务办理。
  if (demo) {
    const previousStart = startedAt - 86_400_000
    instances.push({
      id: `${current.id}:demo-previous`,
      label: '上次提交 · 演示记录',
      status: 'withdrawn',
      startedAt: previousStart,
      finishedAt: previousStart + 3_600_000,
      initiator: workflow.initiator,
      history: [
        {
          id: 'previous-submit',
          title: '提交申请',
          actor: workflow.initiator,
          occurredAt: previousStart,
        },
        {
          id: 'previous-withdraw',
          title: '撤回申请',
          actor: workflow.initiator,
          occurredAt: previousStart + 3_600_000,
          comment: '补齐附件后重新提交（演示）。',
        },
      ],
    })
  }
  return {
    /** 限定在当前消息授权的单据。 */
    async listInstances(businessKey, signal) {
      signal.throwIfAborted()
      return businessKey === workflow.businessNo ? instances : []
    },
    /** 拒绝当前消息之外的实例。 */
    async getInstance(instanceId, signal) {
      signal.throwIfAborted()
      const instance = instances.find(item => item.id === instanceId)
      if (!instance) throw new Error('当前消息未提供该审批实例')
      return instance
    },
  }
}
