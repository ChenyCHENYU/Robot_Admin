/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\views\account\messages\components\c_messageDetail\useMessageDetailActions.ts
 * @Description: 详情中的审批与普通待办命令，按身份、版本及打开代次保护提交
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { Ref } from 'vue'
import type {
  NotificationMutation,
  NotificationRecord,
  NotificationWorkflowAction,
} from '@/api/notifications.contract'
import type { s_notificationStore } from '@/stores/notification'
import { getNotificationWorkflowActions } from '@/api/notifications.workflow'

type TaskAction = Extract<
  NotificationMutation,
  'start-task' | 'complete-task' | 'cancel-task'
>
interface DetailActionContext {
  store: ReturnType<typeof s_notificationStore>
  detail: Ref<NotificationRecord | null>
  busy: Ref<boolean>
  getVersion: () => number
  isCurrent: (version: number, scope: string) => boolean
}
const WORKFLOW_LABELS: Record<NotificationWorkflowAction, string> = {
  approve: '同意',
  reject: '驳回',
  return: '退回修改',
  withdraw: '撤回申请',
}
const TASK_LABELS: Record<TaskAction, string> = {
  'start-task': '开始办理',
  'complete-task': '确认完成待办',
  'cancel-task': '取消待办',
}

/** 意见约束供确认前使用，领域服务仍对同样输入独立校验。 */
const validateOpinion = (
  action: NotificationWorkflowAction,
  comment: string
): string => {
  if (['reject', 'return'].includes(action) && !comment)
    return '驳回或退回前，请填写审批意见'
  return comment.length > 1000 ? '审批意见最多 1000 字' : ''
}

/** 将未知错误转成适合局部警告展示的文案。 */
const failureText = (cause: unknown, fallback: string): string =>
  cause instanceof Error ? cause.message : fallback

/** 详情仅负责表达办理意图，合法状态迁移仍由领域服务独立校验。 */
export function useMessageDetailActions(context: DetailActionContext) {
  const { store, detail, busy, getVersion, isCurrent } = context
  const message = useMessage()
  const dialog = useDialog()
  const workflowComment = ref('')
  const commandError = ref('')
  const syncRequired = ref(false)
  let confirmation: ReturnType<typeof dialog.warning> | undefined
  const workflowActions = computed(() =>
    detail.value && store.capabilities?.workflow && !syncRequired.value
      ? getNotificationWorkflowActions(detail.value)
      : []
  )
  const taskActions = computed<TaskAction[]>(() => {
    const item = detail.value
    if (!item || item.workflow || item.kind !== 'task' || item.archivedAt)
      return []
    if (syncRequired.value) return []
    if (item.taskStatus === 'pending')
      return ['start-task', 'complete-task', 'cancel-task']
    return item.taskStatus === 'in_progress'
      ? ['complete-task', 'cancel-task']
      : []
  })
  /** 确认命令仍适用于当前详情，阻断普通待办越权推进审批。 */
  const canChangeRecord = (
    type: NotificationMutation,
    item: NotificationRecord | null
  ): item is NotificationRecord => {
    if (!item || busy.value || syncRequired.value) return false
    return (
      !type.endsWith('-task') || taskActions.value.includes(type as TaskAction)
    )
  }

  /** 写入已确认后若同步失败，保留正文与已知结果，避免误导用户重复办理。 */
  const refreshAfterCommand = async (
    id: string,
    version: number,
    scope: string
  ): Promise<void> => {
    try {
      const updated = await store.loadDetail(id)
      if (!isCurrent(version, scope)) return
      detail.value = updated
      syncRequired.value = false
      commandError.value = ''
    } catch (cause) {
      if (!isCurrent(version, scope)) return
      syncRequired.value = true
      commandError.value = `操作已提交，详情同步失败：${failureText(cause, '请重试同步')}`
    }
  }

  /** 只同步详情，不重新发出已成功确认的审批或任务命令。 */
  const retryCommandSync = async (): Promise<void> => {
    if (!detail.value || busy.value) return
    const version = getVersion()
    const scope = store.scopeKey
    busy.value = true
    try {
      await refreshAfterCommand(detail.value.id, version, scope)
    } finally {
      if (isCurrent(version, scope)) busy.value = false
    }
  }

  /** 普通消息状态和普通待办分开校验，流程不能通过完成任务绕过审批。 */
  const change = async (type: NotificationMutation): Promise<void> => {
    const item = detail.value
    if (!canChangeRecord(type, item)) return
    const version = getVersion()
    const scope = store.scopeKey
    busy.value = true
    commandError.value = ''
    try {
      await store.mutate(type, [item.id])
      if (!isCurrent(version, scope)) return
      await refreshAfterCommand(item.id, version, scope)
      if (isCurrent(version, scope)) message.success('消息状态已更新')
    } catch (cause) {
      if (!isCurrent(version, scope)) return
      commandError.value = failureText(cause, '更新失败，请重试')
      message.error(commandError.value)
    } finally {
      if (isCurrent(version, scope)) busy.value = false
    }
  }

  /** 确认框与打开时的身份、消息及版本绑定，切换详情后不能提交旧事项。 */
  const confirmTask = (action: TaskAction): void => {
    const item = detail.value
    if (!item || busy.value || !taskActions.value.includes(action)) return
    const version = getVersion()
    const scope = store.scopeKey
    confirmation?.destroy()
    confirmation = dialog.warning({
      title: TASK_LABELS[action],
      content: `${store.mode === 'demo' ? '此操作仅更新本地演示数据。' : ''}${action === 'cancel-task' ? '确认取消此待办？取消后将保留历史记录。' : '请确认相关事项符合本次办理要求。阅读状态与办理状态分别记录。'}`,
      positiveText: {
        'start-task': '确认开始',
        'complete-task': '确认完成',
        'cancel-task': '确认取消',
      }[action],
      negativeText: '返回',
      onPositiveClick: () => {
        if (
          !isCurrent(version, scope) ||
          detail.value?.revision !== item.revision
        )
          return false
        return change(action)
      },
    })
  }
  const confirmComplete = (): void => confirmTask('complete-task')

  /** 一次命令只提交一个版本，失败保留意见与正文供用户判断和重试。 */
  const submitWorkflow = async (
    item: NotificationRecord,
    action: NotificationWorkflowAction,
    comment: string,
    version: number,
    scope: string
  ): Promise<void> => {
    if (busy.value || !isCurrent(version, scope)) return
    if (!workflowActions.value.includes(action)) return
    busy.value = true
    commandError.value = ''
    try {
      const updated = await store.workflowAction({
        recordId: item.id,
        action,
        comment,
        revision: item.revision,
      })
      if (!isCurrent(version, scope)) return
      detail.value = updated
      workflowComment.value = ''
      await refreshAfterCommand(item.id, version, scope)
      if (isCurrent(version, scope))
        message.success(`${WORKFLOW_LABELS[action]}已提交`)
    } catch (cause) {
      if (!isCurrent(version, scope)) return
      commandError.value = failureText(cause, '审批提交失败，请重试')
      message.error(commandError.value)
    } finally {
      if (isCurrent(version, scope)) busy.value = false
    }
  }

  /** 驳回、退回必须填写原因；所有流程写入均经明确确认。 */
  const confirmWorkflow = (action: NotificationWorkflowAction): void => {
    const item = detail.value
    if (!item || busy.value || !workflowActions.value.includes(action)) return
    const comment = workflowComment.value.trim()
    const opinionError = validateOpinion(action, comment)
    if (opinionError) {
      commandError.value = opinionError
      return
    }
    commandError.value = ''
    const version = getVersion()
    const scope = store.scopeKey
    confirmation?.destroy()
    confirmation = dialog.warning({
      title: `确认${WORKFLOW_LABELS[action]}`,
      content: `${store.mode === 'demo' ? '此操作仅推进本地演示审批。' : ''}将对“${item.workflow?.processName || item.title}”执行${WORKFLOW_LABELS[action]}，并记录审批意见与操作历史。`,
      positiveText: `确认${WORKFLOW_LABELS[action]}`,
      negativeText: '返回修改',
      onPositiveClick: () => {
        if (
          !isCurrent(version, scope) ||
          detail.value?.revision !== item.revision
        )
          return false
        return submitWorkflow(item, action, comment, version, scope)
      },
    })
  }

  /** 关闭详情或切换身份立即撤销旧确认框及其局部交互状态。 */
  const resetActions = (): void => {
    confirmation?.destroy()
    confirmation = undefined
    workflowComment.value = ''
    commandError.value = ''
    syncRequired.value = false
    busy.value = false
  }
  return {
    workflowComment,
    workflowActions,
    taskActions,
    commandError,
    syncRequired,
    change,
    confirmComplete,
    confirmTask,
    confirmWorkflow,
    retryCommandSync,
    resetActions,
    WORKFLOW_LABELS,
    TASK_LABELS,
  }
}
