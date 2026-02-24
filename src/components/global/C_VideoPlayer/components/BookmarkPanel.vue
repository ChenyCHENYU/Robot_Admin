<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\components\BookmarkPanel.vue
 * @Description: 书签面板
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="vp-bookmark-panel">
    <!-- 添加书签按钮 -->
    <NButton
      quaternary
      size="small"
      class="vp-bookmark-add-btn"
      @click="handleAdd"
    >
      <template #icon>
        <span>🔖</span>
      </template>
      书签
    </NButton>

    <!-- 书签列表弹窗 -->
    <NPopover
      v-if="bookmarks.length"
      trigger="click"
      placement="top-start"
      :show-arrow="false"
      style="max-height: 300px; overflow-y: auto"
    >
      <template #trigger>
        <NBadge
          :value="bookmarks.length"
          :max="99"
          type="info"
        >
          <NButton
            quaternary
            size="small"
            class="vp-bookmark-list-btn"
          >
            列表
          </NButton>
        </NBadge>
      </template>

      <div class="vp-bookmark-list">
        <div
          v-for="bm in bookmarks"
          :key="bm.id"
          class="vp-bookmark-item"
        >
          <span
            class="vp-bookmark-time"
            @click="$emit('goTo', bm.id)"
          >
            {{ formatTime(bm.time) }}
          </span>

          <span class="vp-bookmark-note">
            {{ bm.note || '无备注' }}
          </span>

          <NButton
            quaternary
            size="tiny"
            type="error"
            @click="$emit('remove', bm.id)"
          >
            ✕
          </NButton>
        </div>
      </div>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
  import type { Bookmark } from '../types'

  interface Props {
    bookmarks: Bookmark[]
  }

  defineProps<Props>()

  const emit = defineEmits<{
    add: [note: string]
    remove: [id: string]
    goTo: [id: string]
  }>()

  /** 添加书签 */
  function handleAdd() {
    emit('add', '')
  }

  /** 格式化时间为 mm:ss */
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
</script>

<style scoped lang="scss">
  .vp-bookmark-panel {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .vp-bookmark-add-btn,
  .vp-bookmark-list-btn {
    color: #fff;
    font-size: 12px;
  }

  .vp-bookmark-list {
    display: flex;
    flex-direction: column;
    min-width: 220px;
    gap: 2px;
  }

  .vp-bookmark-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 13px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }

  .vp-bookmark-time {
    color: var(--primary-color, #18a058);
    cursor: pointer;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }

  .vp-bookmark-note {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.7;
  }
</style>
