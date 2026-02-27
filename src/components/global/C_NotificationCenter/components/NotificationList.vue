<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_NotificationCenter\components\NotificationList.vue
 * @Description: 消息列表
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="notification-list">
    <!-- 分类 Tab -->
    <div class="notification-list__tabs">
      <div
        v-for="tab in CATEGORY_TABS"
        :key="tab.key"
        class="notification-list__tab"
        :class="{
          'notification-list__tab--active': activeCategory === tab.key,
        }"
        @click="$emit('switchCategory', tab.key)"
      >
        <span>{{ tab.label }}</span>
        <span
          v-if="getTabCount(tab.key) > 0"
          class="notification-list__tab-count"
        >
          {{ getTabCount(tab.key) }}
        </span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div
      v-if="messages.length > 0"
      class="notification-list__toolbar"
    >
      <NButton
        text
        size="tiny"
        :disabled="currentUnread === 0"
        @click="$emit('markAllRead')"
      >
        <template #icon>
          <span class="i-mdi:check-all" />
        </template>
        全部已读
      </NButton>
      <NButton
        text
        size="tiny"
        @click="$emit('clear')"
      >
        <template #icon>
          <span class="i-mdi:delete-sweep-outline" />
        </template>
        清空
      </NButton>
    </div>

    <!-- 消息列表 -->
    <NScrollbar
      class="notification-list__scroll"
      :style="{ maxHeight: `${scrollHeight}px` }"
    >
      <template v-if="loading && messages.length === 0">
        <!-- 骨架屏 -->
        <div
          v-for="i in 4"
          :key="i"
          class="notification-list__skeleton"
        >
          <NSkeleton
            circle
            :width="36"
            :height="36"
          />
          <div class="notification-list__skeleton-text">
            <NSkeleton
              text
              :width="'60%'"
              :height="14"
            />
            <NSkeleton
              text
              :width="'90%'"
              :height="12"
            />
            <NSkeleton
              text
              :width="'40%'"
              :height="10"
            />
          </div>
        </div>
      </template>

      <template v-else-if="messages.length > 0">
        <div class="notification-list__items">
          <NotificationItem
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
            @click="$emit('itemClick', $event)"
            @read="$emit('read', $event)"
            @delete="$emit('delete', $event)"
          />
        </div>

        <!-- 加载更多 -->
        <div
          v-if="hasMore"
          class="notification-list__load-more"
          @click="$emit('loadMore')"
        >
          <NSpin
            v-if="loading"
            :size="14"
          />
          <span>{{ loading ? '加载中...' : '加载更多' }}</span>
        </div>
      </template>

      <!-- 空状态 -->
      <div
        v-else
        class="notification-list__empty"
      >
        <span class="notification-list__empty-icon i-mdi:bell-off-outline" />
        <span class="notification-list__empty-text">暂无消息</span>
      </div>
    </NScrollbar>
  </div>
</template>

<script setup lang="ts">
  import type {
    NotificationMessage,
    NotificationCategory,
  } from '@/types/modules/notification'
  import { CATEGORY_TABS } from '../constants'
  import NotificationItem from './NotificationItem.vue'

  interface Props {
    /** 消息列表 */
    messages: NotificationMessage[]
    /** 当前分类 */
    activeCategory: NotificationCategory | 'all'
    /** 各分类未读数 */
    unreadByCategory: Record<string, number>
    /** 总未读数 */
    unreadCount: number
    /** 是否加载中 */
    loading: boolean
    /** 是否有更多 */
    hasMore: boolean
    /** 滚动区域高度 */
    scrollHeight?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    scrollHeight: 420,
  })

  defineEmits<{
    switchCategory: [key: NotificationCategory | 'all']
    itemClick: [message: NotificationMessage]
    read: [id: string]
    delete: [id: string]
    markAllRead: []
    clear: []
    loadMore: []
  }>()

  /** 当前分类下的未读数 */
  const currentUnread = computed(() => {
    if (props.activeCategory === 'all') return props.unreadCount
    return props.unreadByCategory[props.activeCategory] ?? 0
  })

  /** 获取 Tab 的未读数 */
  function getTabCount(key: NotificationCategory | 'all'): number {
    if (key === 'all') return props.unreadCount
    return props.unreadByCategory[key] ?? 0
  }
</script>

<style scoped lang="scss">
  .notification-list {
    &__tabs {
      display: flex;
      border-bottom: 1px solid var(--app-border-light);
      padding: 0 4px;
    }

    &__tab {
      position: relative;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 12px;
      font-size: 13px;
      color: var(--app-text-secondary);
      cursor: pointer;
      transition: all var(--app-transition-fast);
      user-select: none;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 12px;
        right: 12px;
        height: 2px;
        background: transparent;
        border-radius: 1px;
        transition: background var(--app-transition-fast);
      }

      &:hover {
        color: var(--app-text-primary);
      }

      &--active {
        color: var(--app-primary);
        font-weight: 500;

        &::after {
          background: var(--app-primary);
        }
      }
    }

    &__tab-count {
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: #f5222d;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      line-height: 16px;
      text-align: center;
    }

    &__toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 6px 16px;
      border-bottom: 1px solid var(--app-border-light);
    }

    &__scroll {
      flex: 1;
    }

    &__skeleton {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
    }

    &__skeleton-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__load-more {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px;
      font-size: 12px;
      color: var(--app-text-secondary);
      cursor: pointer;
      transition: color var(--app-transition-fast);

      &:hover {
        color: var(--app-primary);
      }
    }

    &__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      gap: 12px;
    }

    &__empty-icon {
      width: 48px;
      height: 48px;
      color: var(--app-text-disabled);
      opacity: 0.5;
    }

    &__empty-text {
      font-size: 13px;
      color: var(--app-text-disabled);
    }
  }
</style>
