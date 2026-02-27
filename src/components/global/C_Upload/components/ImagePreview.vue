<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Upload\components\ImagePreview.vue
 * @Description: 图片预览缩略图组网格
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    v-if="imageFiles.length > 0"
    class="image-preview"
  >
    <div
      v-for="file in imageFiles"
      :key="file.uid"
      class="image-preview__item"
      :class="`image-preview__item--${file.status}`"
    >
      <img
        v-if="file.thumbUrl"
        :src="file.thumbUrl"
        :alt="file.name"
        class="image-preview__img"
      />

      <!-- 遮罩层 -->
      <div class="image-preview__overlay">
        <!-- 上传中进度 -->
        <div
          v-if="file.status === 'uploading' || file.status === 'hashing'"
          class="image-preview__progress"
        >
          <NProgress
            type="circle"
            :percentage="file.percent"
            :stroke-width="3"
            style="width: 40px"
          />
        </div>

        <!-- 状态图标 -->
        <C_Icon
          v-else-if="file.status === 'success' || file.status === 'instant'"
          name="mdi:check-circle"
          class="image-preview__status-icon image-preview__status-icon--success"
        />
        <C_Icon
          v-else-if="file.status === 'error'"
          name="mdi:alert-circle"
          class="image-preview__status-icon image-preview__status-icon--error"
        />

        <!-- 操作 -->
        <div class="image-preview__actions">
          <NButton
            v-if="file.status === 'error'"
            circle
            size="tiny"
            type="warning"
            @click="emit('retry', file.uid)"
          >
            <template #icon>
              <C_Icon name="mdi:refresh" />
            </template>
          </NButton>
          <NButton
            circle
            size="tiny"
            type="error"
            @click="emit('remove', file.uid)"
          >
            <template #icon>
              <C_Icon name="mdi:close" />
            </template>
          </NButton>
        </div>
      </div>

      <!-- 文件名 -->
      <div class="image-preview__name">
        <NEllipsis :line-clamp="1">
          {{ file.name }}
        </NEllipsis>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { UploadFileItem } from '@/types/modules/upload'

  const props = defineProps<{
    /** 文件列表 */
    fileList: UploadFileItem[]
  }>()

  const emit = defineEmits<{
    remove: [uid: string]
    retry: [uid: string]
  }>()

  /** 过滤出图片文件 */
  const imageFiles = computed(() =>
    props.fileList.filter(f => f.type?.startsWith('image/'))
  )
</script>

<style scoped lang="scss">
  .image-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin-top: 12px;

    &__item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      background: var(--body-color);

      &--error {
        border-color: var(--error-color);
      }

      &--success,
      &--instant {
        border-color: color-mix(
          in srgb,
          var(--success-color) 30%,
          var(--border-color)
        );
      }

      &:hover .image-preview__overlay {
        opacity: 1;
      }
    }

    &__img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.45);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    // 上传中始终显示遮罩
    &__item--uploading .image-preview__overlay,
    &__item--hashing .image-preview__overlay,
    &__item--error .image-preview__overlay {
      opacity: 1;
    }

    &__progress {
      :deep(.n-progress) {
        --n-fill-color: #fff;
      }
    }

    &__status-icon {
      font-size: 28px;

      &--success {
        color: var(--success-color);
      }

      &--error {
        color: var(--error-color);
      }
    }

    &__actions {
      display: flex;
      gap: 6px;
    }

    &__name {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2px 6px;
      font-size: 11px;
      color: #fff;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      text-align: center;
    }
  }
</style>
