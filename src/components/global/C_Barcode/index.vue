<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 09:13:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-02 14:24:16
 * @FilePath: \Robot_Admin\src\components\global\C_Barcode\index.vue
 * @Description: 条形码组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-barcode">
    <div
      class="barcode-wrapper"
      :class="{ 'with-border': showBorder }"
    >
      <VueBarcode
        v-bind="barcodeProps"
        @error="handleError"
      />
    </div>
    <div
      v-if="showLabel && label"
      class="barcode-label"
    >
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import VueBarcode from '@chenfengyuan/vue-barcode'

  interface Props {
    /** 条形码值 */
    value: string
    /** 条形码格式 */
    format?:
      | 'CODE128'
      | 'CODE39'
      | 'EAN13'
      | 'EAN8'
      | 'UPC'
      | 'ITF14'
      | 'MSI'
      | 'pharmacode'
    /** 条形码宽度 */
    width?: number
    /** 条形码高度 */
    height?: number
    /** 是否显示文本值 */
    showText?: boolean
    /** 文本字体大小 */
    fontSize?: number
    /** 文本位置 */
    textPosition?: 'bottom' | 'top'
    /** 条形码颜色 */
    lineColor?: string
    /** 背景颜色 */
    background?: string
    /** 是否显示边框 */
    showBorder?: boolean
    /** 标签文本 */
    label?: string
    /** 是否显示标签 */
    showLabel?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    format: 'CODE128',
    width: 2,
    height: 80,
    showText: true,
    fontSize: 20,
    textPosition: 'bottom',
    lineColor: '#000000',
    background: '#FFFFFF',
    showBorder: true,
    label: '',
    showLabel: false,
  })

  const emit = defineEmits<{
    error: [error: Error]
  }>()

  const barcodeProps = computed(() => ({
    value: props.value,
    format: props.format,
    width: props.width,
    height: props.height,
    displayValue: props.showText,
    fontSize: props.fontSize,
    textPosition: props.textPosition,
    lineColor: props.lineColor,
    background: props.background,
  }))

  const handleError = (error: Error) => {
    console.error('条形码生成失败:', error)
    emit('error', error)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
