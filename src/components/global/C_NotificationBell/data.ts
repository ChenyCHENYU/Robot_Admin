/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\components\global\C_NotificationBell\data.ts
 * @Description: 共享消息领域的顶部业务预览，仅管理弹层与筛选交互
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationStatus,
  NotificationTopic,
} from '@/api/notifications.contract'
import { s_notificationStore } from '@/stores/notification'
import {
  getNotificationIcon,
  getNotificationPriorityLabel,
  getNotificationPriorityTone,
  getNotificationRelativeTime,
  getNotificationSourceLabel,
  getNotificationTaskLabel,
  getNotificationTaskTone,
  getNotificationWorkflowLabel,
  getNotificationWorkflowRelationLabel,
  getNotificationWorkflowTone,
  notificationStatusOptions,
  notificationTopicOptions,
} from '@/utils/d_notificationPresentation'

/** 只拥有弹层交互状态；生命周期引用由 Store 协调所有布局与页面。 */
export function useNotificationBell() {
  const store = s_notificationStore()
  const router = useRouter()
  const panelId = `notification-preview-${useId()}`
  const triggerRef = ref<HTMLButtonElement | null>(null)
  const popoverVisible = ref(false)
  const popoverX = ref(0)
  const popoverY = ref(0)
  const release = store.acquire()
  onScopeDispose(release)

  const activeTopic = computed(() => store.previewQuery.topic ?? 'all')
  const activeStatus = computed(() => store.previewQuery.status)
  const previewRows = computed(() =>
    store.previewItems.slice(0, 20).map((record, index) => ({
      record,
      number: String(index + 1).padStart(2, '0'),
      icon: getNotificationIcon(record),
      source: getNotificationSourceLabel(record),
      time: getNotificationRelativeTime(record.createdAt),
      taskLabel: getNotificationTaskLabel(record.taskStatus),
      taskTone: getNotificationTaskTone(record.taskStatus),
      workflowLabel: record.workflow
        ? getNotificationWorkflowLabel(record.workflow.status)
        : '',
      workflowTone: record.workflow
        ? getNotificationWorkflowTone(record.workflow.status)
        : ('default' as const),
      relationshipLabel: record.workflow
        ? getNotificationWorkflowRelationLabel(record.workflow.relationship)
        : '',
      priorityLabel: getNotificationPriorityLabel(record.priority),
      priorityTone: getNotificationPriorityTone(record.priority),
    }))
  )
  const filterDescription = computed(() => {
    const topic = notificationTopicOptions.find(
      item => item.value === activeTopic.value
    )?.label
    const status = notificationStatusOptions.find(
      item => item.value === activeStatus.value
    )?.label
    return `${topic ?? '全部'} · ${status ?? '全部'}`
  })
  const closePreview = () => {
    if (!popoverVisible.value) return
    popoverVisible.value = false
    triggerRef.value?.focus({ preventScroll: true })
  }
  const openInbox = async (id?: string) => {
    closePreview()
    await router.push({
      name: 'account-messages',
      query: {
        ...(activeTopic.value === 'all' ? {} : { topic: activeTopic.value }),
        status: activeStatus.value,
        ...(id ? { message: id } : {}),
      },
    })
  }
  const refreshPreview = () => {
    void store.refreshPreview().catch(() => undefined)
  }
  const updatePreviewVisibility = (visible: boolean) => {
    if (visible) {
      const rect = triggerRef.value?.getBoundingClientRect()
      const panelWidth = Math.min(500, window.innerWidth - 24)
      // Naive Popover 只有翻转没有横向平移；将锚点夹在视口安全边界内。
      popoverX.value = Math.min(
        window.innerWidth - 12,
        Math.max(panelWidth + 12, rect?.right ?? window.innerWidth - 12)
      )
      popoverY.value = rect?.bottom ?? 40
    }
    popoverVisible.value = visible
    if (visible) {
      if (!store.previewLoading) refreshPreview()
      void nextTick(() => {
        if (popoverVisible.value)
          document.getElementById(panelId)?.focus({ preventScroll: true })
      })
    }
  }
  const togglePreview = () => updatePreviewVisibility(!popoverVisible.value)
  const handlePreviewOutside = (event: MouseEvent) => {
    if (
      event.target instanceof Node &&
      triggerRef.value?.contains(event.target)
    )
      return
    updatePreviewVisibility(false)
  }
  const selectTopic = (value: NotificationTopic | 'all') => {
    void store
      .setPreviewQuery({ topic: value === 'all' ? undefined : value })
      .catch(() => undefined)
  }
  const selectStatus = (status: NotificationStatus) => {
    void store.setPreviewQuery({ status }).catch(() => undefined)
  }
  watch(() => store.scopeKey, closePreview)
  onMounted(() => {
    window.addEventListener('resize', closePreview)
    window.addEventListener('scroll', closePreview, { passive: true })
  })
  onScopeDispose(() => {
    window.removeEventListener('resize', closePreview)
    window.removeEventListener('scroll', closePreview)
  })
  return {
    store,
    panelId,
    triggerRef,
    openInbox,
    popoverVisible,
    popoverX,
    popoverY,
    togglePreview,
    handlePreviewOutside,
    activeTopic,
    activeStatus,
    previewRows,
    filterDescription,
    closePreview,
    refreshPreview,
    updatePreviewVisibility,
    selectTopic,
    selectStatus,
    notificationTopicOptions,
    notificationStatusOptions,
  }
}
