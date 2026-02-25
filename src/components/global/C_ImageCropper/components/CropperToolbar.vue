<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_ImageCropper\components\CropperToolbar.vue
 * @Description: 裁剪工具栏
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="cropper-toolbar">
    <!-- 裁剪比例 -->
    <NButtonGroup size="small">
      <NButton
        v-for="item in ratioPresets"
        :key="item.value"
        :type="currentRatio === item.value ? 'primary' : 'default'"
        @click="$emit('ratio', item.value)"
      >
        {{ item.label }}
      </NButton>
    </NButtonGroup>

    <NDivider vertical />

    <!-- 旋转 -->
    <NTooltip>
      <template #trigger>
        <NButton
          size="small"
          quaternary
          @click="$emit('rotate', -90)"
        >
          <template #icon>
            <C_Icon name="mdi:rotate-left" />
          </template>
        </NButton>
      </template>
      逆时针旋转 90°
    </NTooltip>
    <NTooltip>
      <template #trigger>
        <NButton
          size="small"
          quaternary
          @click="$emit('rotate', 90)"
        >
          <template #icon>
            <C_Icon name="mdi:rotate-right" />
          </template>
        </NButton>
      </template>
      顺时针旋转 90°
    </NTooltip>

    <NDivider vertical />

    <!-- 翻转 -->
    <NTooltip>
      <template #trigger>
        <NButton
          size="small"
          quaternary
          @click="$emit('flipX')"
        >
          <template #icon>
            <C_Icon name="mdi:flip-horizontal" />
          </template>
        </NButton>
      </template>
      水平翻转
    </NTooltip>
    <NTooltip>
      <template #trigger>
        <NButton
          size="small"
          quaternary
          @click="$emit('flipY')"
        >
          <template #icon>
            <C_Icon name="mdi:flip-vertical" />
          </template>
        </NButton>
      </template>
      垂直翻转
    </NTooltip>

    <NDivider vertical />

    <!-- 缩放 -->
    <NTooltip>
      <template #trigger>
        <NButton
          size="small"
          quaternary
          @click="$emit('zoom', 0.1)"
        >
          <template #icon>
            <C_Icon name="mdi:magnify-plus-outline" />
          </template>
        </NButton>
      </template>
      放大
    </NTooltip>
    <NTooltip>
      <template #trigger>
        <NButton
          size="small"
          quaternary
          @click="$emit('zoom', -0.1)"
        >
          <template #icon>
            <C_Icon name="mdi:magnify-minus-outline" />
          </template>
        </NButton>
      </template>
      缩小
    </NTooltip>

    <NDivider vertical />

    <!-- 重置 -->
    <NTooltip>
      <template #trigger>
        <NButton
          size="small"
          quaternary
          @click="$emit('reset')"
        >
          <template #icon>
            <C_Icon name="mdi:refresh" />
          </template>
        </NButton>
      </template>
      重置
    </NTooltip>
  </div>
</template>

<script setup lang="ts">
  import type { AspectRatioPreset } from '@/types/modules/image-cropper'

  defineProps<{
    currentRatio: number
    ratioPresets: AspectRatioPreset[]
  }>()

  defineEmits<{
    ratio: [value: number]
    rotate: [angle: number]
    flipX: []
    flipY: []
    zoom: [scale: number]
    reset: []
  }>()
</script>

<style lang="scss" scoped>
  .cropper-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    padding: 8px 0;
  }
</style>
