<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-16 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_QRCode\index.vue
 * @Description: 二维码组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-qrcode">
    <div
      class="qrcode-wrapper"
      :class="{ 'with-border': showBorder }"
    >
      <!-- Canvas 渲染模式 -->
      <canvas
        v-show="mode === 'canvas'"
        ref="canvasRef"
      />
      <!-- SVG 渲染模式 -->
      <div
        v-if="mode === 'svg'"
        class="qrcode-svg"
        :style="{ width: `${size}px`, height: `${size}px` }"
        v-html="svgHtml"
      />
    </div>
    <div
      v-if="showLabel && label"
      class="qrcode-label"
    >
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useQRCode } from '@/composables/QRCode/useQRCode'
  import type {
    ErrorCorrectionLevel,
    ExportType,
    LogoOptions,
    QRCodeExpose,
    RenderMode,
  } from '@/types/modules/qrcode'

  interface Props {
    /** 二维码内容 */
    value: string
    /** 二维码尺寸（px） */
    size?: number
    /** 前景色 */
    color?: string
    /** 背景色 */
    bgColor?: string
    /** 纠错等级 */
    errorCorrectionLevel?: ErrorCorrectionLevel
    /** 留白边距 */
    margin?: number
    /** 渲染模式 */
    mode?: RenderMode
    /** Logo 配置 */
    logo?: LogoOptions
    /** 是否显示边框 */
    showBorder?: boolean
    /** 标签文本 */
    label?: string
    /** 是否显示标签 */
    showLabel?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 200,
    color: '#000000',
    bgColor: '#FFFFFF',
    errorCorrectionLevel: 'M',
    margin: 2,
    mode: 'canvas',
    logo: undefined,
    showBorder: true,
    label: '',
    showLabel: false,
  })

  const emit = defineEmits<{
    error: [error: Error]
  }>()

  const canvasRef = ref<HTMLCanvasElement | null>(null)

  const { svgHtml, error, render, toDataURL, download } = useQRCode(canvasRef, {
    value: toRef(props, 'value'),
    size: toRef(props, 'size'),
    color: toRef(props, 'color'),
    bgColor: toRef(props, 'bgColor'),
    errorCorrectionLevel: toRef(props, 'errorCorrectionLevel'),
    margin: toRef(props, 'margin'),
    mode: toRef(props, 'mode'),
    logo: toRef(props, 'logo'),
  })

  // 监听错误
  watch(error, e => {
    if (e) emit('error', e)
  })

  // 挂载后首次渲染
  onMounted(() => render())

  defineExpose<QRCodeExpose>({
    toDataURL: (type?: ExportType, quality?: number) =>
      toDataURL(type, quality),
    download: (filename?: string, type?: ExportType) =>
      download(filename, type),
    refresh: () => render(),
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
