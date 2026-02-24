<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Signature\index.vue
 * @Description: 电子签名组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-signature">
    <!-- 工具栏 -->
    <div
      v-if="showToolbar"
      class="signature-toolbar"
    >
      <!-- 画笔/橡皮擦切换 -->
      <div class="toolbar-section">
        <NButtonGroup>
          <NButton
            :type="currentMode === 'pen' ? 'primary' : 'default'"
            size="small"
            @click="currentMode = 'pen'"
          >
            <template #icon>
              <Icon icon="mdi:draw" />
            </template>
            画笔
          </NButton>
          <NButton
            :type="currentMode === 'eraser' ? 'primary' : 'default'"
            size="small"
            @click="currentMode = 'eraser'"
          >
            <template #icon>
              <Icon icon="mdi:eraser" />
            </template>
            橡皮擦
          </NButton>
        </NButtonGroup>
      </div>

      <div class="toolbar-section divider" />

      <!-- 画笔颜色 -->
      <div
        v-if="currentMode === 'pen'"
        class="toolbar-section"
      >
        <span class="section-label">颜色</span>
        <NColorPicker
          v-model:value="currentPenConfig.color"
          :show-alpha="false"
          size="small"
          :swatches="PRESET_COLORS"
        />
      </div>

      <!-- 画笔粗细 -->
      <div
        v-if="currentMode === 'pen'"
        class="toolbar-section"
      >
        <span class="section-label">粗细</span>
        <NInputNumber
          v-model:value="currentPenConfig.width"
          :min="1"
          :max="20"
          size="small"
          style="width: 80px"
        />
      </div>

      <div class="toolbar-section divider" />

      <!-- 撤销/重做 -->
      <div class="toolbar-section">
        <NButton
          size="small"
          :disabled="!canUndo"
          @click="handleUndo"
        >
          <template #icon>
            <Icon icon="mdi:undo" />
          </template>
          撤销
        </NButton>
        <NButton
          size="small"
          :disabled="!canRedo"
          @click="handleRedo"
        >
          <template #icon>
            <Icon icon="mdi:redo" />
          </template>
          重做
        </NButton>
      </div>

      <div class="toolbar-section divider" />

      <!-- 清空 -->
      <div class="toolbar-section">
        <NButton
          size="small"
          type="error"
          :disabled="isEmpty"
          @click="handleClear"
        >
          <template #icon>
            <Icon icon="mdi:delete-outline" />
          </template>
          清空
        </NButton>
      </div>
    </div>

    <!-- 画布 -->
    <div
      class="signature-canvas-wrapper"
      :class="{ disabled, readonly }"
      :style="{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: backgroundColor || 'transparent',
      }"
    >
      <canvas
        ref="canvasRef"
        class="signature-canvas"
        :class="{ disabled, readonly }"
      />
      <div
        v-if="isEmpty && !disabled && !readonly"
        class="canvas-placeholder"
      >
        请在此处签名
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSignatureCanvas } from '@/composables/Signature/useSignatureCanvas'
  import { useSignatureHistory } from '@/composables/Signature/useSignatureHistory'
  import { useSignatureExport } from '@/composables/Signature/useSignatureExport'
  import {
    DEFAULT_PEN_CONFIG,
    DEFAULT_WATERMARK_CONFIG,
    PRESET_COLORS,
  } from './data'
  import type {
    ExportOptions,
    PenConfig,
    PenMode,
    SignatureExpose,
    SignaturePoint,
    SignatureProps,
    SignatureStroke,
    WatermarkConfig,
  } from '@/types/modules/signature'

  defineOptions({
    name: 'C_Signature',
  })

  const props = withDefaults(defineProps<SignatureProps>(), {
    width: '100%',
    height: 300,
    disabled: false,
    readonly: false,
    showToolbar: true,
    maxHistory: 50,
  })

  const emit = defineEmits<{
    'start-draw': []
    drawing: [point: SignaturePoint]
    'end-draw': [stroke: SignatureStroke]
    clear: []
    undo: []
    redo: []
    change: [data: SignatureStroke[]]
  }>()

  // Canvas 引用
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  // 当前模式和配置
  const currentMode = ref<PenMode>('pen')
  const currentPenConfig = reactive<PenConfig>({
    ...DEFAULT_PEN_CONFIG,
    ...props.penConfig,
  })
  // const currentEraserConfig = reactive({
  //   ...DEFAULT_ERASER_CONFIG,
  //   ...props.eraserConfig,
  // })
  const currentWatermark = reactive<WatermarkConfig>({
    ...DEFAULT_WATERMARK_CONFIG,
    ...props.watermark,
  })

  // 历史管理
  const {
    strokes,
    canUndo,
    canRedo,
    isEmpty,
    addStroke,
    undo,
    redo,
    clear,
    loadData,
  } = useSignatureHistory({
    maxHistory: props.maxHistory,
    onChange: data => {
      canvasInstance.redrawStrokes(data as SignatureStroke[])
      emit('change', data as SignatureStroke[])
    },
  })

  // Canvas 绘制
  const canvasInstance = useSignatureCanvas({
    canvasRef,
    penConfig: toRef(currentPenConfig),
    mode: currentMode,
    disabled: toRef(props, 'disabled'),
    onStrokeComplete: (stroke: SignatureStroke) => {
      addStroke(stroke)
      emit('end-draw', stroke)
    },
    onDrawStart: () => {
      emit('start-draw')
    },
    onDrawing: (point: SignaturePoint) => {
      emit('drawing', point)
    },
  })

  // 导出功能
  const exportInstance = useSignatureExport({
    canvasRef,
    watermark: toRef(currentWatermark),
  })

  /**
   * 处理撤销
   */
  const handleUndo = (): boolean => {
    const result = undo()
    if (result) {
      emit('undo')
    }
    return result
  }

  /**
   * 处理重做
   */
  const handleRedo = (): boolean => {
    const result = redo()
    if (result) {
      emit('redo')
    }
    return result
  }

  /**
   * 处理清空
   */
  const handleClear = () => {
    clear()
    canvasInstance.clearCanvas()
    emit('clear')
  }

  /**
   * 导出签名
   */
  const exportSignature = async (
    options?: ExportOptions
  ): Promise<string | Blob> => {
    return exportInstance.exportSignature(options)
  }

  /**
   * 下载签名
   */
  const download = async (
    filename?: string,
    options?: ExportOptions
  ): Promise<void> => {
    return exportInstance.download(filename, options)
  }

  /**
   * 加载签名图片
   */
  const loadImage = async (imageUrl: string): Promise<void> => {
    await exportInstance.loadImage(imageUrl)
    clear()
  }

  /**
   * 获取签名数据
   */
  const getSignatureData = (): SignatureStroke[] => {
    return strokes.value as SignatureStroke[]
  }

  /**
   * 加载签名数据
   */
  const loadSignatureData = (data: SignatureStroke[]): void => {
    loadData(data)
  }

  /**
   * 判断是否为空
   */
  const isSignatureEmpty = (): boolean => {
    return isEmpty.value
  }

  // 初始化
  onMounted(() => {
    canvasInstance.initCanvas()
    canvasInstance.bindEvents()

    // 如果有背景图片，加载它
    if (props.backgroundImage) {
      loadImage(props.backgroundImage)
    }
  })

  // 清理
  onUnmounted(() => {
    canvasInstance.unbindEvents()
  })

  // 暴露方法
  defineExpose<SignatureExpose>({
    clear: handleClear,
    undo: handleUndo,
    redo: handleRedo,
    export: exportSignature,
    download,
    loadImage,
    getSignatureData,
    loadSignatureData,
    isEmpty: isSignatureEmpty,
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
