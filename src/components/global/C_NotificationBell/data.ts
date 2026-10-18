/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\components\global\C_NotificationBell\data.ts
 * @Description: 将共享消息领域投影为组件库控制器，不创建独立请求或轮询
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  NotificationCenterController,
  NotificationMessage,
} from '@robot-admin/naive-ui-components/C_NotificationCenter'
import type { NotificationRecord } from '@/api/notifications.contract'
import { s_notificationStore } from '@/stores/notification'

const toPreviewMessage = (item: NotificationRecord): NotificationMessage => ({
  id: item.id,
  title: item.title,
  summary: item.summary,
  category: item.category,
  priority: item.priority,
  status: item.archivedAt ? 'archived' : item.readAt ? 'read' : 'unread',
  timestamp: item.createdAt,
  sender: { name: item.source },
})

/** 只拥有弹层交互状态；生命周期引用由 Store 协调所有布局与页面。 */
export function useNotificationBell() {
  const store = s_notificationStore()
  const router = useRouter()
  const popoverVisible = ref(false)
  const activeCategory = ref<NotificationMessage['category'] | 'all'>('all')
  const selectedMessage = ref<NotificationMessage | null>(null)
  const pendingIds = ref<string[]>([])
  const pending = ref(0)
  let generation = 0
  const retryAction = shallowRef<(() => Promise<void>) | null>(null)
  const release = store.acquire()
  onScopeDispose(release)

  const messages = computed(() => store.previewItems.map(toPreviewMessage))
  const openInbox = async (id?: string) => {
    popoverVisible.value = false
    await router.push({
      name: 'account-messages',
      query: id ? { message: id } : {},
    })
  }
  const run = async (action: () => Promise<void>, ids: string[] = []) => {
    if (pending.value) throw new Error('消息操作正在进行，请稍后重试')
    const version = generation
    pending.value++
    pendingIds.value = [...ids]
    try {
      await action()
      if (version === generation) retryAction.value = null
    } catch (failure) {
      if (version === generation) retryAction.value = () => run(action, ids)
      throw failure
    } finally {
      if (version === generation) {
        pending.value--
        pendingIds.value = []
      }
    }
  }
  watch(
    () => store.scopeKey,
    () => {
      generation++
      pending.value = 0
      pendingIds.value = []
      popoverVisible.value = false
      activeCategory.value = 'all'
      selectedMessage.value = null
      retryAction.value = null
    }
  )

  const controller: NotificationCenterController = {
    messages,
    activeCategory,
    loading: computed(() => store.loading),
    total: computed(() => store.stats.total),
    page: computed(() => 1),
    selectedMessage,
    popoverVisible,
    wsStatus: computed(() => 'disconnected' as const),
    unreadCount: computed(() => store.stats.unread),
    unreadByCategory: computed(() => store.stats.byCategory),
    filteredMessages: computed(() =>
      messages.value.filter(
        item =>
          activeCategory.value === 'all' ||
          item.category === activeCategory.value
      )
    ),
    // 顶部仅展示最近预览；完整分页和筛选统一由消息中心页面承接。
    hasMore: computed(() => false),
    error: computed(() => store.error || null),
    busy: computed(() => pending.value > 0),
    pendingIds,
    fetchMessages: () => run(() => store.refresh()),
    loadMore: async () => {
      await openInbox()
    },
    markAsRead: ids => run(() => store.mutate('read', ids), ids),
    markAllAsRead: category => {
      const cutoff = store.revision
      return run(() => store.markAllRead(category, cutoff))
    },
    deleteMessages: ids => run(() => store.mutate('delete', ids), ids),
    clearMessages: category => {
      const cutoff = store.revision
      return run(() => store.clearMessages(category, cutoff))
    },
    selectMessage: item => {
      void openInbox(item.id)
    },
    clearSelection: () => {
      selectedMessage.value = null
    },
    switchCategory: category => {
      activeCategory.value = category
    },
    clearError: () => {
      store.error = ''
      retryAction.value = null
    },
    retry: () => retryAction.value?.() ?? run(() => store.refresh()),
    // 传输归领域服务所有；铃铛不自行创建连接或申请浏览器权限。
    connectWS: () => undefined,
    disconnectWS: () => undefined,
    requestDesktopPermission: async () => 'unsupported',
  }
  return { controller, store, openInbox }
}
