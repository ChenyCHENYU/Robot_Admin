/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\api\notifications.demo.workflow.ts
 * @Description: 审批与普通待办演示种子及旧快照非破坏升级
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationRecord,
  NotificationWorkflow,
  NotificationWorkflowHistory,
} from './notifications.contract'
import type { NotificationDemoDocument } from './notifications.demo.seed'

const cases: Array<{
  title: string
  processName: string
  status: NotificationWorkflow['status']
  relationship: NotificationWorkflow['relationship']
  initiator: string
  currentNode: string
}> = [
  {
    title: '研发设备采购 · 部门审批',
    processName: '采购申请',
    status: 'pending',
    relationship: 'assignee',
    initiator: '林晓',
    currentNode: '部门负责人审批',
  },
  {
    title: '差旅费用报销 · 已通过',
    processName: '费用报销',
    status: 'approved',
    relationship: 'assignee',
    initiator: '周宁',
    currentNode: '流程结束',
  },
  {
    title: '供应商准入 · 已驳回',
    processName: '供应商准入',
    status: 'rejected',
    relationship: 'assignee',
    initiator: '陈琳',
    currentNode: '流程结束',
  },
  {
    title: '合同用印申请 · 待补充材料',
    processName: '合同用印',
    status: 'returned',
    relationship: 'initiator',
    initiator: '我',
    currentNode: '申请人修改',
  },
  {
    title: '调休申请 · 我已撤回',
    processName: '休假申请',
    status: 'withdrawn',
    relationship: 'initiator',
    initiator: '我',
    currentNode: '流程结束',
  },
  {
    title: '临时访客申请 · 已取消',
    processName: '访客申请',
    status: 'cancelled',
    relationship: 'initiator',
    initiator: '我',
    currentNode: '流程结束',
  },
  {
    title: '预算调整 · 抄送给我',
    processName: '预算调整',
    status: 'pending',
    relationship: 'cc',
    initiator: '王婷',
    currentNode: '财务负责人审批',
  },
  {
    title: '我的出差申请 · 审批中',
    processName: '出差申请',
    status: 'pending',
    relationship: 'initiator',
    initiator: '我',
    currentNode: '直属主管审批',
  },
]

const workflowDueAt = (
  now: Date,
  index: number,
  status: NotificationWorkflow['status']
) =>
  status === 'pending'
    ? new Date(
        now.getTime() + (index === 0 ? -2 : 24) * 60 * 60_000
      ).toISOString()
    : null

/** 丰富流程示例独立于历史十二条消息，删除后不会由迁移重新创建。 */
export const createNotificationWorkflowDemoRecords = (
  now: Date,
  revision = 1
): NotificationRecord[] => {
  const workflows = cases.map((scenario, index): NotificationRecord => {
    const at = new Date(now.getTime() - (index + 1) * 13 * 60_000).toISOString()
    const submittedAt = new Date(
      now.getTime() - (index + 2) * 60 * 60_000
    ).toISOString()
    const businessNo = `DEMO-${['CG', 'BX', 'GY', 'HT', 'XJ', 'FK', 'YS', 'CC'][index]}-202610-${String(index + 1).padStart(3, '0')}`
    const history: NotificationWorkflowHistory[] = [
      {
        id: `demo-flow-${index + 1}-submitted`,
        action: 'submit',
        actor: scenario.initiator,
        at: submittedAt,
        node: '发起申请',
        comment: '本地模拟流程已提交',
      },
    ]
    if (scenario.status !== 'pending')
      history.push({
        id: `demo-flow-${index + 1}-handled`,
        action: (
          {
            approved: 'approve',
            rejected: 'reject',
            returned: 'return',
            withdrawn: 'withdraw',
            cancelled: 'cancel',
          } as const
        )[scenario.status],
        actor: scenario.status === 'withdrawn' ? '我' : '流程处理人',
        at,
        node: '业务审核',
        comment:
          scenario.status === 'returned'
            ? '请补充合同附件后重新提交'
            : '本地模拟处理记录',
      })
    const assigned = scenario.relationship === 'assignee'
    return {
      id: `demo-workflow-${index + 1}`,
      title: scenario.title,
      source: '审批中心',
      category: 'business',
      topic: 'workflow',
      priority: index === 0 ? 'urgent' : 'normal',
      kind: assigned ? 'task' : 'notification',
      taskStatus: assigned
        ? scenario.status === 'pending'
          ? 'pending'
          : 'done'
        : null,
      summary: `${businessNo} · ${scenario.initiator}发起 · ${scenario.currentNode}`,
      content: `【审批演示】${scenario.processName}\n业务单号：${businessNo}\n发起人：${scenario.initiator}\n当前节点：${scenario.currentNode}\n\n这些记录只在当前浏览器模拟审批，不会提交真实业务。阅读、审批与普通待办办理分别记录。`,
      contentType: 'text',
      createdAt: at,
      updatedAt: at,
      readAt: [0, 3, 6].includes(index) ? null : at,
      archivedAt: null,
      starred: false,
      revision,
      receivedRevision: revision,
      workflow: {
        instanceId: `demo-workflow-instance-${index + 1}`,
        processName: scenario.processName,
        businessNo,
        initiator: scenario.initiator,
        currentNode: scenario.currentNode,
        relationship: scenario.relationship,
        status: scenario.status,
        dueAt: workflowDueAt(now, index, scenario.status),
        history,
      },
    }
  })
  const taskBase = workflows[0]!
  return [
    ...workflows,
    ...(['in_progress', 'cancelled'] as const).map(
      (taskStatus, index): NotificationRecord => {
        const at = new Date(
          now.getTime() - (index + 1) * 31 * 60_000
        ).toISOString()
        return {
          ...taskBase,
          id: `demo-business-task-${index + 1}`,
          title: index ? '过期素材整理 · 已取消' : '季度数据核对 · 进行中',
          source: '业务协作',
          topic: 'general',
          workflow: undefined,
          kind: 'task',
          taskStatus,
          priority: 'normal',
          summary: '普通业务待办，支持开始、完成或取消；与审批流独立。',
          content:
            '【业务待办演示】这是一项普通业务协作任务。其生命周期与阅读状态、审批流程互相独立。',
          createdAt: at,
          updatedAt: at,
          readAt: at,
        }
      }
    ),
  ]
}

/** 对旧持久化快照只追加新主题示例一次，不重建已删除的旧消息或重置偏好。 */
export const upgradeNotificationDemoDocument = (
  document: NotificationDemoDocument,
  now: Date
): boolean => {
  if ((document.seedRevision ?? 0) >= 2) return false
  const ids = new Set(document.items.map(item => item.id))
  const revision = document.revision + 1
  document.items.push(
    ...createNotificationWorkflowDemoRecords(now, revision).filter(
      item => !ids.has(item.id)
    )
  )
  document.seedRevision = 2
  return true
}
