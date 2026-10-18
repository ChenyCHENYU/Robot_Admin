/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\views\account\messages\composables\useMessageInbox.ts
 * @Description: 消息收件箱查询、选择与命令交互
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
import type {
  TableColumn,
  TableInstance,
} from '@robot-admin/naive-ui-components/C_Table'
import type {
  NotificationMutation,
  NotificationRecord,
  NotificationStatus,
} from '@/api/notifications.contract'
import { s_notificationStore } from '@/stores/notification'
import {
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  formatMessageTime,
  getMessageState,
  getOptionLabel,
} from '../data'

/** 消息列表仅消费领域 Store，查询表单和当前页选择保留在视图。 */
export function useMessageInbox() {
  const store = s_notificationStore()
  const message = useMessage()
  const dialog = useDialog()
  const tableRef = ref<TableInstance<NotificationRecord> | null>(null)
  const selectedIds = ref<string[]>([])
  const detailId = ref<string | null>(null)
  const filters = reactive({
    keyword: '',
    category: null as string | null,
    source: '',
    priority: null as string | null,
    dateRange: null as [number, number] | null,
  })
  const commandLoading = ref(false)

  /** 命令边界展示错误，失败时保留选择便于重试。 */
  const run = async (
    operation: () => Promise<unknown>,
    success?: string
  ): Promise<boolean> => {
    try {
      await operation()
      if (success) message.success(success)
      return true
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败，请重试')
      return false
    }
  }

  /** 清空真实表格勾选与当前页 ID。 */
  const clearSelection = (): void => {
    selectedIds.value = []
    tableRef.value?.clearSelection()
  }

  /** 使用完整筛选条件查询第一页，日期按当地自然日包含结束日。 */
  const search = async (): Promise<void> => {
    clearSelection()
    const [start, end] = filters.dateRange ?? []
    const endDate = end === undefined ? undefined : new Date(end)
    endDate?.setHours(23, 59, 59, 999)
    await run(() =>
      store.search({
        keyword: filters.keyword.trim(),
        category: (filters.category || undefined) as
          NotificationRecord['category'] | undefined,
        priority: (filters.priority || undefined) as
          NotificationRecord['priority'] | undefined,
        source: filters.source.trim() || undefined,
        dateFrom:
          start === undefined ? undefined : new Date(start).toISOString(),
        dateTo: endDate?.toISOString(),
        page: 1,
      })
    )
  }

  /** 重置筛选保留当前收件箱页签。 */
  const resetFilters = async (): Promise<void> => {
    Object.assign(filters, {
      keyword: '',
      category: null,
      source: '',
      priority: null,
      dateRange: null,
    })
    await search()
  }

  /** 状态切换始终重新查询第一页。 */
  const changeStatus = async (status: NotificationStatus): Promise<void> => {
    clearSelection()
    await run(() => store.search({ status, page: 1 }))
  }

  /** 翻页前清理当前页选择，远端总数由领域服务提供。 */
  const changePage = async (page: number, pageSize: number): Promise<void> => {
    clearSelection()
    await run(() => store.changePage(page, pageSize))
  }

  /** 基于稳定 ID 提交单条或批量命令。 */
  const mutate = async (
    type: NotificationMutation,
    ids = selectedIds.value
  ): Promise<void> => {
    if (!ids.length || commandLoading.value) return
    commandLoading.value = true
    const snapshot = [...ids]
    try {
      if (await run(() => store.mutate(type, snapshot), '消息状态已更新'))
        clearSelection()
    } finally {
      commandLoading.value = false
    }
  }

  /** 删除属于不可恢复动作，确认后再执行。 */
  const confirmDelete = (): void => {
    if (!selectedIds.value.length) return
    const ids = [...selectedIds.value]
    dialog.warning({
      title: '删除消息',
      content: `确认删除选中的 ${ids.length} 条消息？删除后无法恢复。`,
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: () => mutate('delete', ids),
    })
  }

  /** 全部已读明确按当前分类及调用时的收件边界执行。 */
  const markAllRead = (): void => {
    const category = (filters.category || undefined) as
      NotificationRecord['category'] | undefined
    dialog.info({
      title: '全部标为已读',
      content: `将${category ? getOptionLabel(CATEGORY_OPTIONS, category) : '所有分类'}当前已收到的消息标为已读，之后收到的新消息仍保持未读。`,
      positiveText: '标为已读',
      negativeText: '取消',
      onPositiveClick: () =>
        run(() => store.markAllRead(category), '已标记为已读'),
    })
  }

  const columns = computed<TableColumn<NotificationRecord>[]>(() => [
    { type: 'selection', width: 46 },
    {
      key: 'title',
      title: '消息',
      minWidth: 270,
      render: row =>
        h('div', { class: 'message-title-cell' }, [
          h(
            NButton,
            {
              text: true,
              type: row.readAt ? 'default' : 'primary',
              onClick: () => {
                detailId.value = row.id
              },
            },
            { default: () => row.title }
          ),
          h('div', { class: 'message-summary' }, row.summary),
        ]),
    },
    {
      key: 'category',
      title: '分类 / 来源',
      width: 160,
      render: row =>
        h('div', [
          h('div', getOptionLabel(CATEGORY_OPTIONS, row.category)),
          h('small', { class: 'message-summary' }, row.source),
        ]),
    },
    {
      key: 'priority',
      title: '优先级',
      width: 92,
      render: row =>
        h(
          NTag,
          {
            size: 'small',
            bordered: false,
            type:
              row.priority === 'urgent'
                ? 'error'
                : row.priority === 'high'
                  ? 'warning'
                  : 'default',
          },
          { default: () => getOptionLabel(PRIORITY_OPTIONS, row.priority) }
        ),
    },
    {
      key: 'readAt',
      title: '状态',
      width: 100,
      render: row =>
        h(
          NTag,
          {
            size: 'small',
            bordered: false,
            type:
              row.taskStatus === 'pending'
                ? 'warning'
                : row.readAt
                  ? 'default'
                  : 'info',
          },
          { default: () => getMessageState(row) }
        ),
    },
    {
      key: 'createdAt',
      title: '收到时间',
      width: 176,
      render: row => formatMessageTime(row.createdAt),
    },
    {
      key: 'starred',
      title: '星标',
      width: 68,
      render: row =>
        h(
          NButton,
          {
            text: true,
            type: row.starred ? 'warning' : 'default',
            disabled: commandLoading.value,
            'aria-label': row.starred ? '取消星标' : '添加星标',
            onClick: () => mutate(row.starred ? 'unstar' : 'star', [row.id]),
          },
          { default: () => (row.starred ? '★' : '☆') }
        ),
    },
  ])
  const actions = computed<ActionItem[]>(() => [
    {
      key: 'read',
      label: '标为已读',
      icon: 'mdi:email-open-outline',
      disabled: !selectedIds.value.length || commandLoading.value,
      onClick: () => mutate('read'),
    },
    {
      key: 'unread',
      label: '标为未读',
      icon: 'mdi:email-outline',
      disabled: !selectedIds.value.length || commandLoading.value,
      onClick: () => mutate('unread'),
    },
    {
      key: 'archive',
      label: store.query.status === 'archived' ? '移回收件箱' : '归档',
      icon: 'mdi:archive-outline',
      disabled: !selectedIds.value.length || commandLoading.value,
      onClick: () =>
        mutate(store.query.status === 'archived' ? 'unarchive' : 'archive'),
    },
    {
      key: 'delete',
      label: '删除',
      type: 'error',
      disabled: !selectedIds.value.length || commandLoading.value,
      onClick: confirmDelete,
    },
  ])
  const pagination = computed(() => ({
    page: store.query.page,
    pageSize: store.query.pageSize,
    total: store.total,
    remote: true,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
  }))
  watch(
    () => store.scopeKey,
    () => {
      clearSelection()
      detailId.value = null
    }
  )
  return {
    store,
    tableRef,
    selectedIds,
    detailId,
    filters,
    commandLoading,
    columns,
    actions,
    pagination,
    run,
    search,
    resetFilters,
    changeStatus,
    changePage,
    markAllRead,
    clearSelection,
  }
}
