<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Upload\components\FileList.vue
 * @Description: 文件列表组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <TransitionGroup
    name="file-list"
    tag="div"
    class="file-list"
  >
    <div
      v-for="file in fileList"
      :key="file.uid"
      class="file-list__item"
      :class="`file-list__item--${file.status}`"
    >
      <!-- 缩略图 / 图标 -->
      <div class="file-list__thumb">
        <img
          v-if="showThumbnail && file.thumbUrl"
          :src="file.thumbUrl"
          :alt="file.name"
          class="file-list__thumb-img"
        />
        <C_Icon
          v-else
          :name="getFileIcon(file.type)"
          class="file-list__thumb-icon"
        />
      </div>

      <!-- 文件信息 -->
      <div class="file-list__info">
        <div class="file-list__name">
          <NEllipsis :line-clamp="1">
            {{ file.name }}
          </NEllipsis>
        </div>
        <div class="file-list__meta">
          <span class="file-list__size">{{ formatFileSize(file.size) }}</span>
          <NTag
            :type="(STATUS_TYPE[file.status] as any) || 'default'"
            size="tiny"
            :bordered="false"
          >
            {{ STATUS_TEXT[file.status] || file.status }}
          </NTag>
          <span
            v-if="file.status === 'instant'"
            class="file-list__instant"
          >
            ⚡
          </span>
        </div>

        <!-- 进度条 -->
        <NProgress
          v-if="file.status === 'uploading' || file.status === 'hashing'"
          :percentage="file.status === 'hashing' ? hashProgress : file.percent"
          :height="4"
          :border-radius="2"
          :show-indicator="false"
          :status="file.status === 'hashing' ? 'info' : 'success'"
        />

        <!-- 分片进度描述 -->
        <div
          v-if="file.chunkProgress && file.status === 'uploading'"
          class="file-list__chunk-info"
        >
          分片 {{ file.chunkProgress.uploadedChunks }}/{{
            file.chunkProgress.totalChunks
          }}
        </div>

        <!-- 错误信息 -->
        <div
          v-if="file.status === 'error' && file.error"
          class="file-list__error"
        >
          {{ file.error }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="file-list__actions">
        <NButton
          v-if="file.status === 'error'"
          text
          type="warning"
          size="tiny"
          @click="emit('retry', file.uid)"
        >
          <template #icon>
            <C_Icon name="mdi:refresh" />
          </template>
        </NButton>
        <NButton
          text
          type="error"
          size="tiny"
          @click="emit('remove', file.uid)"
        >
          <template #icon>
            <C_Icon name="mdi:close" />
          </template>
        </NButton>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
  import type { UploadFileItem } from '@/types/modules/upload'
  import {
    STATUS_TEXT,
    STATUS_TYPE,
    getFileIcon,
    formatFileSize,
  } from '../constants'

  defineProps<{
    /** 文件列表 */
    fileList: UploadFileItem[]
    /** 是否显示缩略图 */
    showThumbnail?: boolean
    /** hash 进度（全局共享） */
    hashProgress?: number
  }>()

  const emit = defineEmits<{
    remove: [uid: string]
    retry: [uid: string]
  }>()
</script>

<style scoped lang="scss">
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;

    &__item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--card-color);
      transition: all 0.25s ease;

      &:hover {
        border-color: color-mix(
          in srgb,
          var(--primary-color) 40%,
          var(--border-color)
        );
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
      }

      &--error {
        border-color: var(--error-color);
        background: color-mix(
          in srgb,
          var(--error-color) 4%,
          var(--card-color)
        );
      }

      &--success,
      &--instant {
        border-color: color-mix(
          in srgb,
          var(--success-color) 30%,
          var(--border-color)
        );
      }
    }

    &__thumb {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--body-color);
    }

    &__thumb-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__thumb-icon {
      font-size: 22px;
      color: var(--text-color-3);
    }

    &__info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-color-1);
    }

    &__meta {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 12px;
    }

    &__size {
      color: var(--text-color-3);
    }

    &__instant {
      font-size: 14px;
    }

    &__chunk-info {
      font-size: 11px;
      color: var(--text-color-4);
    }

    &__error {
      font-size: 12px;
      color: var(--error-color);
    }

    &__actions {
      flex-shrink: 0;
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }

  // ─── 过渡动画 ─────────────────────────────────

  .file-list-enter-active,
  .file-list-leave-active {
    transition: all 0.3s ease;
  }

  .file-list-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }

  .file-list-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  .file-list-move {
    transition: transform 0.3s ease;
  }
</style>
