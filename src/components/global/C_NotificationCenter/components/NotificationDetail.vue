<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_NotificationCenter\components\NotificationDetail.vue
 * @Description: 消息详情
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="notification-detail">
    <!-- 返回栏 -->
    <div class="notification-detail__back">
      <NButton
        text
        size="small"
        @click="$emit('back')"
      >
        <template #icon>
          <span class="i-mdi:arrow-left" />
        </template>
        返回列表
      </NButton>
    </div>

    <!-- 消息头部 -->
    <div class="notification-detail__header">
      <h3 class="notification-detail__title">{{ message.title }}</h3>
      <div class="notification-detail__meta">
        <NTag
          :type="categoryTag.color"
          size="tiny"
          :bordered="false"
          round
        >
          <template #icon>
            <span :class="categoryTag.icon" />
          </template>
          {{ categoryTag.label }}
        </NTag>
        <NTag
          v-if="message.priority === 'urgent' || message.priority === 'high'"
          :type="priorityTag.type"
          size="tiny"
          :bordered="false"
          round
        >
          {{ priorityTag.label }}
        </NTag>
        <span class="notification-detail__time">{{ formattedTime }}</span>
      </div>
      <div
        v-if="message.sender"
        class="notification-detail__sender"
      >
        <NAvatar
          v-if="message.sender.avatar"
          :src="message.sender.avatar"
          :size="20"
          round
        />
        <span>{{ message.sender.name }}</span>
      </div>
    </div>

    <!-- 消息内容 -->
    <NScrollbar
      class="notification-detail__content"
      :style="{ maxHeight: `${scrollHeight}px` }"
    >
      <div
        v-if="message.content"
        class="notification-detail__body"
        v-html="message.content"
      />
      <div
        v-else
        class="notification-detail__body"
      >
        {{ message.summary }}
      </div>
    </NScrollbar>

    <!-- 操作区 -->
    <div
      v-if="message.actionUrl"
      class="notification-detail__footer"
    >
      <NButton
        type="primary"
        size="small"
        @click="handleAction"
      >
        {{ message.actionText || '查看详情' }}
        <template #icon>
          <span class="i-mdi:arrow-right" />
        </template>
      </NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { NotificationMessage } from '@/types/modules/notification'
  import { CATEGORY_MAP, PRIORITY_MAP } from '../constants'
  import { useNotificationFormat } from '@/composables/NotificationCenter/useNotificationFormat'

  interface Props {
    /** 消息数据 */
    message: NotificationMessage
    /** 内容滚动区高度 */
    scrollHeight?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    scrollHeight: 320,
  })

  const emit = defineEmits<{
    back: []
    action: [url: string]
    navigate: [url: string]
  }>()
  const { formatRelativeTime } = useNotificationFormat()

  /** 分类标签 */
  const categoryTag = computed(
    () => CATEGORY_MAP[props.message.category] ?? CATEGORY_MAP.system
  )

  /** 优先级标签 */
  const priorityTag = computed(
    () => PRIORITY_MAP[props.message.priority] ?? PRIORITY_MAP.normal
  )

  /** 格式化时间 */
  const formattedTime = computed(() =>
    formatRelativeTime(props.message.timestamp)
  )

  /** 处理操作按钮点击 */
  function handleAction() {
    const url = props.message.actionUrl
    if (!url) return

    emit('action', url)

    if (url.startsWith('http')) {
      window.open(url, '_blank')
    } else {
      emit('navigate', url)
    }
  }
</script>

<style scoped lang="scss">
  .notification-detail {
    display: flex;
    flex-direction: column;
    height: 100%;

    &__back {
      padding: 8px 16px;
      border-bottom: 1px solid var(--app-border-light);
    }

    &__header {
      padding: 16px;
      border-bottom: 1px solid var(--app-border-light);
    }

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--app-text-primary);
      line-height: 1.5;
      margin: 0 0 8px;
    }

    &__meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    &__time {
      font-size: 11px;
      color: var(--app-text-disabled);
    }

    &__sender {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 12px;
      color: var(--app-text-secondary);
    }

    &__content {
      flex: 1;
      min-height: 0;
    }

    &__body {
      padding: 16px;
      font-size: 13px;
      line-height: 1.7;
      color: var(--app-text-primary);
      word-break: break-word;

      :deep(p) {
        margin: 0 0 8px;
      }

      :deep(ul),
      :deep(ol) {
        padding-left: 20px;
        margin: 8px 0;
      }

      :deep(li) {
        margin: 4px 0;
      }

      :deep(strong) {
        font-weight: 600;
        color: var(--app-primary);
      }
    }

    &__footer {
      padding: 12px 16px;
      border-top: 1px solid var(--app-border-light);
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
