<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\components\ThumbnailPreview.vue
 * @Description: 缩略图预览（xgplayer 内置支持，此组件为扩展预留）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    v-if="visible"
    class="vp-thumbnail-preview"
    :style="positionStyle"
  >
    <div
      class="vp-thumbnail-image"
      :style="imageStyle"
    />
    <div class="vp-thumbnail-time">
      {{ formattedTime }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    /** 是否显示 */
    visible?: boolean
    /** 缩略图 URL */
    imageUrl?: string
    /** 在雪碧图中的 X 偏移 */
    offsetX?: number
    /** 在雪碧图中的 Y 偏移 */
    offsetY?: number
    /** 缩略图宽度 */
    width?: number
    /** 缩略图高度 */
    height?: number
    /** 水平位置（百分比） */
    positionX?: number
    /** 对应的时间（秒） */
    time?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    imageUrl: '',
    offsetX: 0,
    offsetY: 0,
    width: 160,
    height: 90,
    positionX: 0,
    time: 0,
  })

  /** 定位样式 */
  const positionStyle = computed(() => ({
    left: `${props.positionX}%`,
    transform: 'translateX(-50%)',
    width: `${props.width}px`,
  }))

  /** 雪碧图裁切样式 */
  const imageStyle = computed(() => ({
    width: `${props.width}px`,
    height: `${props.height}px`,
    backgroundImage: `url(${props.imageUrl})`,
    backgroundPosition: `-${props.offsetX}px -${props.offsetY}px`,
    backgroundSize: 'auto',
  }))

  /** 格式化时间 */
  const formattedTime = computed(() => {
    const m = Math.floor(props.time / 60)
    const s = Math.floor(props.time % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  })
</script>

<style scoped lang="scss">
  .vp-thumbnail-preview {
    position: absolute;
    bottom: 100%;
    margin-bottom: 8px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    z-index: 20;
  }

  .vp-thumbnail-image {
    background-repeat: no-repeat;
  }

  .vp-thumbnail-time {
    text-align: center;
    font-size: 12px;
    color: #fff;
    background: rgba(0, 0, 0, 0.7);
    padding: 2px 0;
    font-variant-numeric: tabular-nums;
  }
</style>
