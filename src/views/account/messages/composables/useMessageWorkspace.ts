/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @Description: 企业消息工作台激活、权限、业务入口与演示控制
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationRecord,
  NotificationStatus,
} from '@/api/notifications.contract'
import { useMessageInbox } from './useMessageInbox'
import { CATEGORY_OPTIONS, INBOX_TABS, PRIORITY_OPTIONS } from '../data'
import { s_permissionStore } from '@/stores/permission'
import { resolveNotificationTarget } from '@/utils/d_notificationTarget'

/** 工作台组合收件控制器，并管理页面缓存生命周期。 */
export function useMessageWorkspace() {
  const {
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
  } = useMessageInbox()
  const router = useRouter()
  const route = useRoute()
  const message = useMessage()
  const dialog = useDialog()
  const permission = s_permissionStore()
  const section = ref<'inbox' | 'sending' | 'templates' | 'preferences'>(
    'inbox'
  )
  const demoBusy = ref(false)
  const failureOperation = ref('mutation')
  const failureOptions = [
    { label: '下一次状态操作', value: 'mutation' },
    { label: '下一次查询', value: 'query' },
    { label: '下一次草稿或发送', value: 'dispatch' },
    { label: '下一次投递', value: 'delivery' },
  ]
  let release: (() => void) | undefined
  let detailRequest = 0
  const statCards = computed(() => [
    {
      key: 'unread',
      label: '未读消息',
      value: store.stats.unread,
      status: 'unread' as const,
      icon: 'i-mdi-email-outline',
    },
    {
      key: 'todo',
      label: '待办理事项',
      value: store.stats.todo,
      status: 'todo' as const,
      icon: 'i-mdi-clipboard-check-outline',
    },
    {
      key: 'starred',
      label: '星标关注',
      value: store.stats.starred,
      status: 'starred' as const,
      icon: 'i-mdi-star-outline',
    },
    {
      key: 'all',
      label: '全部消息',
      value: store.stats.total,
      status: 'all' as const,
      icon: 'i-mdi-inbox-outline',
    },
  ])

  /** 概览与状态页签使用同一个领域查询。 */
  const selectStat = async (status: NotificationStatus): Promise<void> => {
    section.value = 'inbox'
    await changeStatus(status)
  }
  /** 表格勾选仅保留当前页稳定 ID。 */
  const selectionChange = (keys: (string | number)[]): void => {
    selectedIds.value = keys.map(String)
  }
  /** 演示故障与数据生成同样执行异步锁和可见反馈。 */
  const demoOperation = async (
    operation: () => Promise<unknown>,
    text: string
  ): Promise<void> => {
    if (demoBusy.value) return
    demoBusy.value = true
    try {
      await run(operation, text)
    } finally {
      demoBusy.value = false
    }
  }
  /** 手动连接状态只影响当前演示服务。 */
  const toggleOnline = (): void => {
    store.setOnline(!store.connected)
    message.info(
      store.connected ? '正在恢复消息同步' : '已模拟离线，恢复连接后将补齐消息'
    )
  }
  /** 注入一次明确故障，便于验证错误和重试流程。 */
  const injectFailure = (): void => {
    try {
      store.simulateFailure(failureOperation.value)
      message.info('已设置下一次对应操作失败，失败后可再次重试')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '设置失败')
    }
  }
  /** 重置只针对当前身份作用域，其他用户和公司保持隔离。 */
  const confirmReset = (): void => {
    dialog.warning({
      title: '重置当前消息演示',
      content:
        '将删除本账户、本公司在当前浏览器中的消息、草稿、模板修改、偏好与审计，并重新生成演示数据。确认继续？',
      positiveText: '重置演示',
      negativeText: '取消',
      onPositiveClick: () =>
        demoOperation(() => store.resetDemo(), '当前作用域演示数据已重置'),
    })
  }
  /** 业务消息仅跳转应用已注册且当前有权限匹配的站内路由。 */
  const openBusiness = async (record: NotificationRecord): Promise<void> => {
    const path =
      record.target?.type === 'route' ? record.target.path : undefined
    const resolved = resolveNotificationTarget(path, router, candidate =>
      permission.hasRoutePermission(candidate)
    )
    if ('error' in resolved) {
      message.warning(resolved.error)
      return
    }
    detailId.value = null
    await router.push(resolved.path)
  }
  /** 页面缓存激活时获取引用，离开后释放轮询和监听所有权。 */
  const activate = (): void => {
    release ??= store.acquire()
  }
  /** 页面本身不销毁共享消息 Store，顶部铃铛可以继续同步。 */
  const deactivate = (): void => {
    release?.()
    release = undefined
    detailId.value = null
    detailRequest++
  }
  onMounted(activate)
  onActivated(activate)
  onDeactivated(deactivate)
  onScopeDispose(deactivate)
  watch(
    () => [section.value, store.scopeKey, store.capabilities.manage],
    async () => {
      if (
        ['sending', 'templates'].includes(section.value) &&
        store.scopeKey &&
        store.capabilities.manage
      )
        await run(() => store.refreshGovernance())
    }
  )
  watch(
    () => [route.query.message, store.scopeKey],
    async ([value]) => {
      const request = ++detailRequest
      if (typeof value !== 'string') return
      try {
        await store.initialize()
        if (request !== detailRequest || !store.scopeKey) return
        section.value = 'inbox'
        detailId.value = value
      } catch {
        /* 连接错误由统一状态区展示。 */
      }
    },
    { immediate: true }
  )
  watch(
    () => store.capabilities.manage,
    allowed => {
      if (!allowed && ['sending', 'templates'].includes(section.value))
        section.value = 'inbox'
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
    section,
    demoBusy,
    failureOperation,
    failureOptions,
    statCards,
    selectStat,
    selectionChange,
    demoOperation,
    toggleOnline,
    injectFailure,
    confirmReset,
    openBusiness,
    CATEGORY_OPTIONS,
    INBOX_TABS,
    PRIORITY_OPTIONS,
  }
}
