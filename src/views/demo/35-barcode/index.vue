<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 09:13:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-02 14:25:18
 * @FilePath: \Robot_Admin\src\views\demo\35-barcode\index.vue
 * @Description: 条形码演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="barcode-demo">
    <NH1>条形码组件场景示例</NH1>

    <!-- 示例展示 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:barcode"
          class="title-icon"
        />
        条形码示例
      </h2>
      <p class="section-desc">
        以下是常见的条形码格式示例，展示了不同应用场景下的条形码效果。CODE128是最通用的格式，支持所有ASCII字符；EAN13是商品条码的标准格式。
      </p>
      <div class="examples-grid">
        <div
          v-for="(example, index) in BARCODE_EXAMPLES"
          :key="index"
          class="example-card"
        >
          <h3 class="example-title">{{ example.title }}</h3>
          <p class="example-desc">{{ example.description }}</p>
          <div class="example-barcode">
            <C_Barcode
              :value="example.value"
              :format="example.format"
              :label="example.label"
              :show-label="true"
              :show-border="false"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义配置 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:cog"
          class="title-icon"
        />
        自定义配置
      </h2>
      <p class="section-desc">
        通过以下配置选项，您可以自定义条形码的外观和行为。实时预览您的配置效果。
      </p>
      <div class="control-panel">
        <div class="control-row">
          <span class="control-label">条形码值:</span>
          <div class="control-content">
            <NInput
              v-model:value="customValue"
              placeholder="请输入条形码值"
              style="width: 200px"
            />
            <NSelect
              v-model:value="customFormat"
              :options="BARCODE_FORMATS"
              style="width: 150px"
            />
          </div>
        </div>

        <div class="control-row">
          <span class="control-label">尺寸:</span>
          <div class="control-content">
            <NSlider
              v-model:value="customWidth"
              :min="CONFIG_OPTIONS.width.min"
              :max="CONFIG_OPTIONS.width.max"
              :step="CONFIG_OPTIONS.width.step"
              style="width: 120px"
            />
            <span class="slider-label">宽: {{ customWidth }}</span>
            <NSlider
              v-model:value="customHeight"
              :min="CONFIG_OPTIONS.height.min"
              :max="CONFIG_OPTIONS.height.max"
              :step="CONFIG_OPTIONS.height.step"
              style="width: 120px"
            />
            <span class="slider-label">高: {{ customHeight }}</span>
          </div>
        </div>

        <div class="control-row">
          <span class="control-label">文本:</span>
          <div class="control-content">
            <NSlider
              v-model:value="customFontSize"
              :min="CONFIG_OPTIONS.fontSize.min"
              :max="CONFIG_OPTIONS.fontSize.max"
              :step="CONFIG_OPTIONS.fontSize.step"
              style="width: 120px"
            />
            <span class="slider-label">字号: {{ customFontSize }}</span>
            <NSelect
              v-model:value="customTextPosition"
              :options="TEXT_POSITIONS"
              style="width: 100px"
            />
            <NCheckbox v-model:checked="customShowText">显示文本</NCheckbox>
          </div>
        </div>

        <div class="control-row">
          <span class="control-label">颜色:</span>
          <div class="control-content">
            <div class="color-presets">
              <div
                v-for="(preset, index) in COLOR_PRESETS"
                :key="index"
                class="color-preset"
                :class="{ active: selectedColorIndex === index }"
                :style="{
                  backgroundColor: preset.background,
                  border: `2px solid ${preset.value}`,
                }"
                @click="selectColorPreset(index)"
              />
            </div>
            <NColorPicker
              v-model:value="customLineColor"
              style="margin-left: 12px"
            />
            <span>线条</span>
            <NColorPicker
              v-model:value="customBackground"
              style="margin-left: 8px"
            />
            <span>背景</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时预览 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:eye"
          class="title-icon"
        />
        实时预览
      </h2>
      <div class="preview-section">
        <h3 class="preview-title">条形码预览效果</h3>
        <div class="preview-barcode">
          <C_Barcode
            :value="customValue"
            :format="customFormat"
            :width="customWidth"
            :height="customHeight"
            :show-text="customShowText"
            :font-size="customFontSize"
            :text-position="customTextPosition"
            :line-color="customLineColor"
            :background="customBackground"
            :show-border="false"
            @error="handleBarcodeError"
          />
        </div>
        <div class="preview-info">
          <div class="info-item">
            <span class="info-label">格式:</span>
            <span class="info-value">{{ customFormat }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">值:</span>
            <span class="info-value">{{ customValue || '空' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">尺寸:</span>
            <span class="info-value"
              >{{ customWidth }} × {{ customHeight }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <C_ActionBar
      :actions="actionButtons"
      :config="{ align: 'center', gap: 12, wrap: true }"
      class="action-buttons"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { ActionItem } from '@/types/modules/action-bar'
  import {
    BARCODE_FORMATS,
    BARCODE_EXAMPLES,
    CONFIG_OPTIONS,
    COLOR_PRESETS,
    TEXT_POSITIONS,
    type BarcodeFormat,
    type TextPosition,
  } from './data'

  // message 是自动导入的
  declare const message: {
    error: (msg: string) => void
    info: (msg: string) => void
    success: (msg: string) => void
  }

  // 自定义配置
  const customValue = ref('DEMO-BARCODE-2025')
  const customFormat = ref<BarcodeFormat>('CODE128')
  const customWidth = ref(CONFIG_OPTIONS.width.default)
  const customHeight = ref(CONFIG_OPTIONS.height.default)
  const customFontSize = ref(CONFIG_OPTIONS.fontSize.default)
  const customTextPosition = ref<TextPosition>('bottom')
  const customShowText = ref(true)
  const customLineColor = ref('#000000')
  const customBackground = ref('#FFFFFF')
  const selectedColorIndex = ref(0)

  // 选择颜色预设
  const selectColorPreset = (index: number) => {
    selectedColorIndex.value = index
    const preset = COLOR_PRESETS[index]
    customLineColor.value = preset.value
    customBackground.value = preset.background
  }

  // 条形码错误处理
  const handleBarcodeError = (error: Error) => {
    message.error(`条形码生成失败: ${error.message}`)
  }

  // 导出条形码
  const exportBarcode = () => {
    // 这里可以实现导出功能
    message.info('导出功能开发中...')
  }

  // 复制条形码值
  const copyBarcodeValue = async () => {
    try {
      await navigator.clipboard.writeText(customValue.value)
      message.success('条形码值已复制到剪贴板')
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  // 重置配置
  const resetConfig = () => {
    customValue.value = 'DEMO-BARCODE-2025'
    customFormat.value = 'CODE128'
    customWidth.value = CONFIG_OPTIONS.width.default
    customHeight.value = CONFIG_OPTIONS.height.default
    customFontSize.value = CONFIG_OPTIONS.fontSize.default
    customTextPosition.value = 'bottom'
    customShowText.value = true
    customLineColor.value = '#000000'
    customBackground.value = '#FFFFFF'
    selectedColorIndex.value = 0
    message.success('配置已重置')
  }

  // ================= 操作按钮配置 =================
  const actionButtons: ActionItem[] = [
    {
      key: 'export',
      label: '导出图片',
      icon: 'mdi:download',
      type: 'primary',
      onClick: exportBarcode,
    },
    {
      key: 'copy',
      label: '复制值',
      icon: 'mdi:content-copy',
      onClick: copyBarcodeValue,
    },
    {
      key: 'reset',
      label: '重置配置',
      icon: 'mdi:refresh',
      onClick: resetConfig,
    },
  ]
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
