<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_NotificationCenter\index.vue
 * @Description: 通知中心组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-notification-center">
    <NPopover
      v-model:show="core.popoverVisible.value"
      :width="420"
      trigger="click"
      placement="bottom-end"
      :show-arrow="false"
      content-class="c-notification-center__popover"
      @after-leave="handlePopoverClose"
    >
      <!-- 触发器：角标铃铛 -->
      <template #trigger>
        <NotificationBadge
          :count="core.unreadCount.value"
          :max-count="props.maxBadgeCount"
          :has-urgent="hasUrgentMessage"
          @click="handleBadgeClick"
        />
      </template>

      <!-- 面板内容 -->
      <div class="c-notification-center__panel">
        <!-- 头部标题 -->
        <div class="c-notification-center__header">
          <span class="c-notification-center__title">消息中心</span>
          <div class="c-notification-center__header-extra">
            <!-- WebSocket 连接状态 -->
            <NTooltip
              v-if="props.wsConfig"
              trigger="hover"
              placement="top"
            >
              <template #trigger>
                <span
                  class="c-notification-center__ws-dot"
                  :class="`c-notification-center__ws-dot--${core.wsStatus.value}`"
                />
              </template>
              {{ wsStatusText }}
            </NTooltip>
          </div>
        </div>

        <!-- 列表 / 详情切换 -->
        <Transition
          name="slide-fade"
          mode="out-in"
        >
          <!-- 消息详情 -->
          <NotificationDetail
            v-if="core.selectedMessage.value"
            :key="core.selectedMessage.value.id"
            :message="core.selectedMessage.value"
            @back="core.clearSelection"
            @action="handleAction"
            @navigate="url => emit('navigate', url)"
          />

          <!-- 消息列表 -->
          <NotificationList
            v-else
            :messages="core.filteredMessages.value"
            :active-category="core.activeCategory.value"
            :unread-by-category="core.unreadByCategory.value"
            :unread-count="core.unreadCount.value"
            :loading="core.loading.value"
            :has-more="core.hasMore.value"
            @switch-category="core.switchCategory"
            @item-click="handleItemClick"
            @read="handleRead"
            @delete="handleDelete"
            @mark-all-read="handleMarkAllRead"
            @clear="handleClear"
            @load-more="core.loadMore"
          />
        </Transition>
      </div>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
  import type {
    NotificationCenterProps,
    NotificationCenterExpose,
    NotificationMessage,
    NotificationCategory,
  } from '@/types/modules/notification'
  import { useNotificationCore } from '@/composables/NotificationCenter/useNotificationCore'
  import NotificationBadge from './components/NotificationBadge.vue'
  import NotificationList from './components/NotificationList.vue'
  import NotificationDetail from './components/NotificationDetail.vue'

  defineOptions({ name: 'C_NotificationCenter' })

  const props = withDefaults(defineProps<NotificationCenterProps>(), {
    desktopNotification: false,
    maxBadgeCount: 99,
    pollingInterval: 60_000,
    pageSize: 20,
    storageKey: 'notification_center',
  })

  const emit = defineEmits<{
    itemClick: [message: NotificationMessage]
    read: [ids: string[]]
    allRead: [category?: NotificationCategory]
    delete: [ids: string[]]
    unreadChange: [count: number]
    wsStatusChange: [status: string]
    newMessage: [message: NotificationMessage]
    navigate: [url: string]
  }>()

  const core = useNotificationCore(props)

  // ─── 计算属性 ─────────────────────────────────

  /** 是否有紧急未读消息 */
  const hasUrgentMessage = computed(() =>
    core.messages.value.some(
      m => m.status === 'unread' && m.priority === 'urgent'
    )
  )

  /** WebSocket 状态文本 */
  const wsStatusText = computed(() => {
    const map: Record<string, string> = {
      connected: '已连接',
      connecting: '连接中...',
      disconnected: '未连接',
      reconnecting: '重连中...',
    }
    return map[core.wsStatus.value] ?? '未知'
  })

  // ─── 监听未读数变化 ───────────────────────────

  watch(
    () => core.unreadCount.value,
    count => {
      emit('unreadChange', count)
    }
  )

  // ─── 事件处理 ─────────────────────────────────

  /** 角标点击 */
  function handleBadgeClick() {
    core.popoverVisible.value = !core.popoverVisible.value
  }

  /** 点击消息 */
  function handleItemClick(message: NotificationMessage) {
    core.selectMessage(message)
    emit('itemClick', message)
  }

  /** 标记已读 */
  function handleRead(id: string) {
    core.markAsRead([id])
    emit('read', [id])
  }

  /** 删除消息 */
  function handleDelete(id: string) {
    core.deleteMessages([id])
    emit('delete', [id])
  }

  /** 全部已读 */
  function handleMarkAllRead() {
    const category =
      core.activeCategory.value === 'all'
        ? undefined
        : core.activeCategory.value
    core.markAllAsRead(category)
    emit('allRead', category)
  }

  /** 清空 */
  function handleClear() {
    const category =
      core.activeCategory.value === 'all'
        ? undefined
        : core.activeCategory.value
    core.clearMessages(category)
  }

  /** 操作链接跳转 */
  function handleAction() {
    core.popoverVisible.value = false
  }

  /** Popover 关闭后重置详情 */
  function handlePopoverClose() {
    core.clearSelection()
  }

  // ─── Expose ──────────────────────────────────

  defineExpose<NotificationCenterExpose>({
    refresh: () => core.fetchMessages(true),
    connectWS: () => {
      if (props.wsConfig) core.connectWS(props.wsConfig)
    },
    disconnectWS: core.disconnectWS,
    getUnreadCount: () => core.unreadCount.value,
    getMessages: () => core.messages.value,
    markRead: (ids: string[]) => core.markAsRead(ids),
    markAllAsRead: (category?: NotificationCategory) =>
      core.markAllAsRead(category),
  })
</script>

<style scoped lang="scss">
  .c-notification-center {
    display: inline-flex;
    align-items: center;

    &__popover {
      padding: 0 !important;
      border-radius: 12px !important;
      overflow: hidden;
      box-shadow: var(--app-shadow-lg) !important;
    }

    &__panel {
      display: flex;
      flex-direction: column;
      max-height: 560px;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid var(--app-border-light);
    }

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--app-text-primary);
    }

    &__header-extra {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__ws-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transition: background-color var(--app-transition-fast);

      &--connected {
        background: #52c41a;
        box-shadow: 0 0 4px rgba(82, 196, 26, 0.5);
      }

      &--connecting,
      &--reconnecting {
        background: #faad14;
        animation: status-blink 1s ease-in-out infinite;
      }

      &--disconnected {
        background: var(--app-text-disabled);
      }
    }
  }

  @keyframes status-blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.3;
    }
  }

  // ─── 切换过渡 ─────────────────────────────────

  .slide-fade-enter-active {
    transition: all 0.25s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.2s ease-in;
  }

  .slide-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
</style>
