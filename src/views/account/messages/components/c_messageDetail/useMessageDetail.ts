/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 消息中心 useMessageDetail 交互控制器
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { s_notificationStore } from '@/stores/notification'
import type {
  NotificationAttachment,
  NotificationRecord,
} from '@/api/notifications.contract'
import { sanitizeNotificationHtml } from '@/utils/d_notificationHtml'
import { downloadNotificationAttachment } from '@/api/notifications.attachments'
import { CATEGORY_OPTIONS, formatMessageTime, getOptionLabel } from '../../data'
import {
  getNotificationIcon,
  getNotificationTopic,
  getNotificationTopicLabel,
  getNotificationTaskLabel,
  getNotificationTaskTone,
  getNotificationWorkflowLabel,
  getNotificationWorkflowTone,
  getNotificationWorkflowRelationLabel,
  getNotificationPriorityLabel,
  getNotificationPriorityTone,
} from '@/utils/d_notificationPresentation'
import { useMessageDetailActions } from './useMessageDetailActions'

/** 管理当前视图的独立加载、命令与生命周期。 */
export function useMessageDetail(props: Readonly<{ id: string | null }>) {
  const store = s_notificationStore()
  const message = useMessage()
  const detail = ref<NotificationRecord | null>(null)
  const loading = ref(false)
  const busy = ref(false)
  const error = ref('')
  const readError = ref('')
  const readSyncing = ref(false)
  const downloadBusy = ref<string | null>(null)
  let attachmentController = new AbortController()
  let generation = 0

  /** 判断异步结果是否仍属于当前详情与身份。 */
  const isCurrent = (version: number, scope: string): boolean =>
    version === generation && scope === store.scopeKey
  const actions = useMessageDetailActions({
    store,
    detail,
    busy,
    getVersion: () => generation,
    isCurrent,
  })
  const workflow = computed(() => detail.value?.workflow)
  const isOverdue = computed(() => {
    const process = workflow.value
    return (
      !!process &&
      process.status === 'pending' &&
      !!process.dueAt &&
      Date.parse(process.dueAt) < Date.now()
    )
  })
  const taskDescription = computed(() => {
    if (detail.value?.taskStatus === 'done')
      return '此待办已完成。阅读状态与办理状态分别记录。'
    if (detail.value?.taskStatus === 'cancelled')
      return '此待办已取消，保留原始内容供后续查询。'
    if (detail.value?.taskStatus === 'in_progress')
      return '此待办正在办理，完成相关事项后再确认办结。'
    return '此消息需要办理。打开详情仅标记已读，完成办理需单独确认。'
  })
  const historyLabels = {
    submit: '发起申请',
    approve: '同意',
    reject: '驳回',
    return: '退回修改',
    withdraw: '撤回申请',
    cancel: '取消流程',
  } as const

  /** 详情与正文按需查询，作用域或打开目标变化后丢弃旧响应。 */
  const load = async (): Promise<void> => {
    const { id } = props
    const version = ++generation
    const scope = store.scopeKey
    loading.value = false
    detail.value = null
    error.value = ''
    readError.value = ''
    readSyncing.value = false
    if (!id) return
    loading.value = true
    try {
      const item = await store.loadDetail(id)
      if (!isCurrent(version, scope)) return
      detail.value = item
      if (!item.readAt) await syncRead(id, version, scope)
    } catch (cause) {
      if (isCurrent(version, scope))
        error.value =
          cause instanceof Error ? cause.message : '无法加载消息详情'
    } finally {
      if (isCurrent(version, scope)) loading.value = false
    }
  }

  /** 阅读状态同步失败只保留局部警告，不遮蔽已经成功加载的正文。 */
  const syncRead = async (
    id: string,
    version: number,
    scope: string
  ): Promise<void> => {
    if (readSyncing.value) return
    readSyncing.value = true
    readError.value = ''
    try {
      await store.mutate('read', [id])
      const updated = await store.loadDetail(id)
      if (isCurrent(version, scope)) detail.value = updated
    } catch (cause) {
      if (isCurrent(version, scope))
        readError.value =
          cause instanceof Error ? cause.message : '阅读状态同步失败，请重试'
    } finally {
      if (isCurrent(version, scope)) readSyncing.value = false
    }
  }

  /** 重试仅同步当前消息的阅读状态，不重复请求整页或完成待办。 */
  const retryRead = async (): Promise<void> => {
    if (detail.value)
      await syncRead(detail.value.id, generation, store.scopeKey)
  }

  /** 演示附件由本地生成，接口模式使用固定认证端点。 */
  const getAttachmentBlob = (
    record: NotificationRecord,
    attachment: NotificationAttachment
  ): Promise<Blob> =>
    store.mode === 'demo'
      ? Promise.resolve(
          new Blob(
            [
              `Robot Admin 演示附件凭证\n文件：${attachment.name}\n消息：${record.title}\n说明：此文件是本地演示凭证，不包含真实业务附件。`,
            ],
            { type: 'text/plain;charset=utf-8' }
          )
        )
      : downloadNotificationAttachment(
          record.id,
          attachment.id,
          attachmentController.signal
        )

  /** 用户关闭详情或切换身份引起的取消无需错误提示。 */
  const isCancelled = (cause: unknown): boolean =>
    cause instanceof Error && cause.name === 'AbortError'

  /** 附件下载只使用认证接口或本地凭证，不信任消息元数据中的 URL。 */
  const downloadAttachment = async (
    attachment: NotificationAttachment
  ): Promise<void> => {
    if (!detail.value || downloadBusy.value) return
    const version = generation
    const scope = store.scopeKey
    downloadBusy.value = attachment.id
    try {
      const blob = await getAttachmentBlob(detail.value, attachment)
      if (!isCurrent(version, scope)) return
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download =
        store.mode === 'demo' ? `${attachment.name}.demo.txt` : attachment.name
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (cause) {
      if (isCurrent(version, scope) && !isCancelled(cause))
        message.error(
          cause instanceof Error ? cause.message : '附件下载失败，请重试'
        )
    } finally {
      if (isCurrent(version, scope)) downloadBusy.value = null
    }
  }

  watch(
    () => [props.id, store.scopeKey],
    () => {
      attachmentController.abort()
      attachmentController = new AbortController()
      downloadBusy.value = null
      actions.resetActions()
      void load()
    },
    { immediate: true }
  )
  onBeforeUnmount(() => {
    generation++
    actions.resetActions()
    attachmentController.abort()
  })
  return {
    store,
    detail,
    loading,
    busy,
    error,
    readError,
    readSyncing,
    retryRead,
    downloadBusy,
    load,
    ...actions,
    downloadAttachment,
    CATEGORY_OPTIONS,
    formatMessageTime,
    getOptionLabel,
    sanitizeNotificationHtml,
    workflow,
    isOverdue,
    taskDescription,
    historyLabels,
    getNotificationIcon,
    getNotificationTopic,
    getNotificationTopicLabel,
    getNotificationTaskLabel,
    getNotificationTaskTone,
    getNotificationWorkflowLabel,
    getNotificationWorkflowTone,
    getNotificationWorkflowRelationLabel,
    getNotificationPriorityLabel,
    getNotificationPriorityTone,
  }
}
