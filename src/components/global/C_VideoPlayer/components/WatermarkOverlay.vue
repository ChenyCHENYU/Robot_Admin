<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\components\WatermarkOverlay.vue
 * @Description: 动态水印
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div
    v-if="visible && text"
    class="vp-watermark"
    :style="containerStyle"
  >
    <span
      v-for="n in repeatCount"
      :key="n"
      class="vp-watermark-item"
      :style="itemStyle"
    >
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { WATERMARK_DEFAULT_STYLE } from '../constants'

  interface Props {
    /** 是否显示水印 */
    visible?: boolean
    /** 水印文本 */
    text?: string
    /** 字体大小 */
    fontSize?: number
    /** 文字颜色 */
    color?: string
    /** 旋转角度 */
    rotate?: number
    /** 水印间距 */
    gap?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: true,
    text: '',
    fontSize: WATERMARK_DEFAULT_STYLE.fontSize,
    color: WATERMARK_DEFAULT_STYLE.color,
    rotate: WATERMARK_DEFAULT_STYLE.rotate,
    gap: WATERMARK_DEFAULT_STYLE.gap,
  })

  /** 重复次数：根据间距简单估算 */
  const repeatCount = computed(() => {
    const area = 1920 * 1080
    const itemArea = props.gap * props.gap
    return Math.ceil(area / itemArea)
  })

  /** 容器样式 */
  const containerStyle = computed(() => ({
    position: 'absolute' as const,
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none' as const,
    zIndex: 50,
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignContent: 'flex-start',
    gap: `${props.gap}px`,
    padding: `${props.gap / 2}px`,
  }))

  /** 水印文字样式 */
  const itemStyle = computed(() => ({
    fontSize: `${props.fontSize}px`,
    color: props.color,
    transform: `rotate(${props.rotate}deg)`,
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
    lineHeight: 1,
  }))
</script>

<style scoped lang="scss">
  .vp-watermark {
    // 通过 CSS 阻止截图（基础防护）
    -webkit-user-select: none;
    user-select: none;
  }
</style>
