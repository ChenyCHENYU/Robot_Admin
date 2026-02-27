/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\composables\NotificationCenter\useNotificationCore.ts
 * @Description: 通知中心核心状态管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  NotificationMessage,
  NotificationCategory,
  NotificationCenterProps,
  WSNotificationPayload,
  WSConnectionStatus,
} from '@/types/modules/notification'
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_POLLING_INTERVAL,
  DEFAULT_STORAGE_KEY,
  MOCK_MESSAGES,
} from '@/components/global/C_NotificationCenter/constants'
import { useNotificationWS } from './useNotificationWS'
import { setItem, getItem } from '@/hooks/useStorage'

/** 缓存数据结构 */
interface CachedState {
  unreadIds: string[]
  lastFetchTime: number
}

/** 防抖持久化延迟（ms） */
const PERSIST_DEBOUNCE = 300

/**
 * 通知中心核心状态管理
 *
 * 统一管理消息列表、未读数、分类过滤、已读标记、
 * API 交互、WebSocket 桥接、轮询调度和本地缓存。
 */
export function useNotificationCore(props: NotificationCenterProps) {
  // ─── 响应式状态 ───────────────────────────────

  /** 消息列表 */
  const messages = ref<NotificationMessage[]>([])
  /** 当前选中分类 */
  const activeCategory = ref<NotificationCategory | 'all'>('all')
  /** 是否正在加载 */
  const loading = ref(false)
  /** 总条数 */
  const total = ref(0)
  /** 当前页码 */
  const page = ref(1)
  /** 选中的消息（详情展示） */
  const selectedMessage = ref<NotificationMessage | null>(null)
  /** Popover 展开状态 */
  const popoverVisible = ref(false)
  /** WebSocket 连接状态 */
  const wsStatus = ref<WSConnectionStatus>('disconnected')

  // ─── 计算属性 ─────────────────────────────────

  /** 未读消息总数 */
  const unreadCount = computed(
    () => messages.value.filter(m => m.status === 'unread').length
  )

  /** 各分类未读数 */
  const unreadByCategory = computed(() => {
    const counts: Record<string, number> = { system: 0, business: 0, alarm: 0 }
    for (const m of messages.value) {
      if (m.status === 'unread' && m.category in counts) {
        counts[m.category]++
      }
    }
    return counts
  })

  /** 当前分类下的消息列表 */
  const filteredMessages = computed(() => {
    if (activeCategory.value === 'all') return messages.value
    return messages.value.filter(m => m.category === activeCategory.value)
  })

  /** 是否有更多消息可加载 */
  const hasMore = computed(() => messages.value.length < total.value)

  // ─── 缓存管理 ─────────────────────────────────

  /** 缓存 key */
  const storageKey = computed(() => props.storageKey ?? DEFAULT_STORAGE_KEY)

  /**
   * 从缓存恢复未读状态
   */
  function restoreFromCache() {
    const cached = getItem<CachedState>(storageKey.value)
    if (cached?.unreadIds) {
      const idSet = new Set(cached.unreadIds)
      for (const msg of messages.value) {
        if (idSet.has(msg.id)) {
          msg.status = 'unread'
        }
      }
    }
  }

  /** 防抖持久化定时器 */
  let persistTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 持久化未读状态到本地缓存（防抖）
   */
  function persistToCache() {
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      const unreadIds = messages.value
        .filter(m => m.status === 'unread')
        .map(m => m.id)
      setItem<CachedState>(storageKey.value, {
        unreadIds,
        lastFetchTime: Date.now(),
      })
      persistTimer = null
    }, PERSIST_DEBOUNCE)
  }

  // ─── API 交互 ─────────────────────────────────

  /**
   * 拉取消息列表
   */
  async function fetchMessages(reset = false) {
    if (reset) {
      page.value = 1
    }

    loading.value = true
    try {
      if (props.fetchNotifications) {
        const categoryParam =
          activeCategory.value === 'all' ? undefined : activeCategory.value
        const pageSize = props.pageSize ?? DEFAULT_PAGE_SIZE
        const result = await props.fetchNotifications({
          category: categoryParam,
          page: page.value,
          pageSize,
        })
        if (reset) {
          messages.value = result.list
        } else {
          messages.value.push(...result.list)
        }
        total.value = result.total
      } else {
        // 未配置 API 接口 → 使用模拟数据（全量加载，客户端过滤）
        loadMockData()
      }

      restoreFromCache()
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载模拟数据（全量加载，filteredMessages 负责客户端过滤）
   */
  function loadMockData() {
    messages.value = MOCK_MESSAGES.map(m => ({ ...m }))
    total.value = MOCK_MESSAGES.length
  }

  /**
   * 加载更多
   */
  async function loadMore() {
    if (!hasMore.value || loading.value) return
    page.value++
    await fetchMessages()
  }

  /**
   * 标记指定消息为已读
   */
  async function markAsRead(ids: string[]) {
    const idSet = new Set(ids)

    // 乐观更新
    for (const msg of messages.value) {
      if (idSet.has(msg.id)) {
        msg.status = 'read'
      }
    }
    persistToCache()

    // 如果配置了 API → 同步到服务端
    if (props.markAsRead) {
      try {
        await props.markAsRead(ids)
      } catch {
        // 回滚
        for (const msg of messages.value) {
          if (idSet.has(msg.id)) {
            msg.status = 'unread'
          }
        }
        persistToCache()
      }
    }
  }

  /**
   * 标记全部已读
   */
  async function markAllAsRead(category?: NotificationCategory) {
    const targetMessages = category
      ? messages.value.filter(
          m => m.category === category && m.status === 'unread'
        )
      : messages.value.filter(m => m.status === 'unread')

    // 乐观更新
    for (const msg of targetMessages) {
      msg.status = 'read'
    }
    persistToCache()

    if (props.markAllRead) {
      try {
        await props.markAllRead(category)
      } catch {
        // 回滚
        for (const msg of targetMessages) {
          msg.status = 'unread'
        }
        persistToCache()
      }
    }
  }

  /**
   * 删除消息
   */
  async function deleteMessages(ids: string[]) {
    const idSet = new Set(ids)
    const backup = [...messages.value]

    // 乐观更新
    messages.value = messages.value.filter(m => !idSet.has(m.id))
    total.value = Math.max(0, total.value - ids.length)
    persistToCache()

    if (props.deleteNotification) {
      try {
        await props.deleteNotification(ids)
      } catch {
        messages.value = backup
        total.value += ids.length
        persistToCache()
      }
    }
  }

  /**
   * 清空消息
   */
  async function clearMessages(category?: NotificationCategory) {
    const backup = [...messages.value]
    const backupTotal = total.value

    if (category) {
      messages.value = messages.value.filter(m => m.category !== category)
    } else {
      messages.value = []
    }
    total.value = messages.value.length
    persistToCache()

    if (props.clearNotifications) {
      try {
        await props.clearNotifications(category)
      } catch {
        messages.value = backup
        total.value = backupTotal
        persistToCache()
      }
    }
  }

  // ─── WebSocket 桥接 ────────────────────────────

  /**
   * 处理 WebSocket 推送消息
   */
  function handleWSMessage(payload: WSNotificationPayload) {
    switch (payload.type) {
      case 'new_message': {
        const msg = payload.data as NotificationMessage
        // 去重后插入到列表头部
        if (!messages.value.some(m => m.id === msg.id)) {
          messages.value.unshift(msg)
          total.value++
          persistToCache()
          showDesktopNotification(msg)
        }
        break
      }
      case 'read_sync': {
        const syncMessages = payload.data as NotificationMessage[]
        const readIds = new Set(syncMessages.map(m => m.id))
        for (const msg of messages.value) {
          if (readIds.has(msg.id)) msg.status = 'read'
        }
        persistToCache()
        break
      }
      case 'count_update': {
        // 服务端推送的未读数可用于校准
        break
      }
    }
  }

  /** WebSocket 连接状态变更回调 */
  function handleWSStatusChange(s: WSConnectionStatus) {
    wsStatus.value = s
  }

  const { connect: wsConnect, disconnect: wsDisconnect } = useNotificationWS(
    handleWSMessage,
    handleWSStatusChange
  )

  // ─── 桌面通知 ──────────────────────────────────

  /**
   * 发送桌面通知
   */
  function showDesktopNotification(msg: NotificationMessage) {
    if (!props.desktopNotification) return
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      createDesktopNotification(msg)
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          createDesktopNotification(msg)
        }
      })
    }
  }

  /**
   * 创建桌面通知实例
   */
  function createDesktopNotification(msg: NotificationMessage) {
    const n = new Notification(msg.title, {
      body: msg.summary,
      icon: msg.sender?.avatar || '/robot-avatar.png',
      tag: msg.id,
    })

    n.addEventListener('click', () => {
      window.focus()
      selectMessage(msg)
      n.close()
    })

    // 5 秒后自动关闭
    setTimeout(() => n.close(), 5000)
  }

  // ─── 轮询 ─────────────────────────────────────

  let pollingTimer: ReturnType<typeof setInterval> | null = null

  /**
   * 启动轮询
   */
  function startPolling() {
    stopPolling()
    const interval = props.pollingInterval ?? DEFAULT_POLLING_INTERVAL
    if (interval <= 0) return

    pollingTimer = setInterval(() => {
      fetchMessages(true)
    }, interval)
  }

  /**
   * 停止轮询
   */
  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  // ─── 交互 ─────────────────────────────────────

  /**
   * 选中/查看消息
   */
  function selectMessage(msg: NotificationMessage) {
    selectedMessage.value = msg
    // 自动标记为已读
    if (msg.status === 'unread') {
      markAsRead([msg.id])
    }
  }

  /**
   * 返回列表
   */
  function clearSelection() {
    selectedMessage.value = null
  }

  /**
   * 切换分类
   *
   * 纯客户端过滤（Mock / 已加载数据）直接切换，
   * API 模式则重新拉取对应分类数据。
   */
  function switchCategory(category: NotificationCategory | 'all') {
    activeCategory.value = category
    selectedMessage.value = null

    // 仅 API 模式需要重新拉取
    if (props.fetchNotifications) {
      fetchMessages(true)
    }
  }

  // ─── 初始化 & 清理 ────────────────────────────

  /**
   * 初始化
   */
  function init() {
    fetchMessages(true)
    startPolling()

    // 如果配置了 WebSocket → 建连
    if (props.wsConfig) wsConnect(props.wsConfig)
  }

  /**
   * 销毁
   */
  function destroy() {
    stopPolling()
    wsDisconnect()
    if (persistTimer) {
      clearTimeout(persistTimer)
      persistTimer = null
    }
  }

  onMounted(init)
  onBeforeUnmount(destroy)

  return {
    // 状态
    messages,
    activeCategory,
    loading,
    total,
    page,
    selectedMessage,
    popoverVisible,
    wsStatus,

    // 计算
    unreadCount,
    unreadByCategory,
    filteredMessages,
    hasMore,

    // 操作
    fetchMessages,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteMessages,
    clearMessages,
    selectMessage,
    clearSelection,
    switchCategory,

    // WebSocket
    connectWS: wsConnect,
    disconnectWS: wsDisconnect,
  }
}
