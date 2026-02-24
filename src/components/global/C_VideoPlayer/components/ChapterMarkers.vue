<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\components\ChapterMarkers.vue
 * @Description: 章节标记 UI
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    v-if="chapters.length"
    class="vp-chapter-markers"
  >
    <!-- 当前章节信息 -->
    <div
      v-if="currentChapter"
      class="vp-chapter-current"
    >
      <span class="vp-chapter-index"
        >{{ currentIndex + 1 }}/{{ chapters.length }}</span
      >
      <span class="vp-chapter-title">{{ currentChapter.title }}</span>
    </div>

    <!-- 章节列表面板 -->
    <NPopover
      trigger="click"
      placement="top-start"
      :show-arrow="false"
      style="max-height: 300px; overflow-y: auto"
    >
      <template #trigger>
        <NButton
          quaternary
          size="small"
          class="vp-chapter-trigger"
        >
          <template #icon>
            <span class="vp-chapter-icon">☰</span>
          </template>
          章节
        </NButton>
      </template>

      <div class="vp-chapter-list">
        <div
          v-for="(chapter, idx) in chapters"
          :key="chapter.id"
          class="vp-chapter-item"
          :class="{ 'is-active': chapter.id === currentChapter?.id }"
          @click="$emit('goTo', chapter.id)"
        >
          <span class="vp-chapter-item-index">{{ idx + 1 }}</span>
          <span class="vp-chapter-item-title">{{ chapter.title }}</span>
          <span class="vp-chapter-item-time">{{
            formatTime(chapter.startTime)
          }}</span>
        </div>
      </div>
    </NPopover>
  </div>
</template>

<script setup lang="ts">
  import type { Chapter } from '../types'

  interface Props {
    chapters: Chapter[]
    currentChapter: Chapter | null
    currentIndex: number
  }

  defineProps<Props>()

  defineEmits<{
    goTo: [chapterId: string]
  }>()

  /** 格式化时间为 mm:ss */
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
</script>

<style scoped lang="scss">
  .vp-chapter-markers {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .vp-chapter-current {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #fff;
    font-size: 12px;
  }

  .vp-chapter-index {
    opacity: 0.7;
  }

  .vp-chapter-trigger {
    color: #fff;
    font-size: 12px;
  }

  .vp-chapter-icon {
    font-size: 14px;
  }

  .vp-chapter-list {
    display: flex;
    flex-direction: column;
    min-width: 240px;
  }

  .vp-chapter-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 13px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &.is-active {
      color: var(--primary-color, #18a058);
      font-weight: 600;
    }

    &-index {
      width: 20px;
      text-align: center;
      opacity: 0.5;
      font-size: 12px;
    }

    &-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-time {
      opacity: 0.5;
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
  }
</style>
