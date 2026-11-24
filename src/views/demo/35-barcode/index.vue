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
    <c_vTitle
      title="条形码组件场景示例"
      icon="mdi:barcode"
      description="支持 CODE128、EAN13 等多种格式，自定义尺寸颜色，适用于商品编码、物流追踪等场景"
    />

    <nav
      class="generator-presets"
      aria-label="生成场景"
      ><span>选择用途</span
      ><button
        v-for="example in BARCODE_EXAMPLES"
        :key="example.title"
        type="button"
        :aria-pressed="options.value === example.value"
        @click="applyExample(example)"
        ><strong>{{ example.title }}</strong
        ><small>{{ example.description }}</small></button
      ></nav
    >
    <div class="generator-grid">
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
                v-model:value="options.value"
                placeholder="请输入条形码值"
                style="width: 200px"
              />
              <NSelect
                v-model:value="options.format"
                :options="BARCODE_FORMATS"
                style="width: 150px"
              />
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">尺寸:</span>
            <div class="control-content">
              <NSlider
                v-model:value="options.width"
                :min="CONFIG_OPTIONS.width.min"
                :max="CONFIG_OPTIONS.width.max"
                :step="CONFIG_OPTIONS.width.step"
                style="width: 120px"
              />
              <span class="slider-label">宽: {{ options.width }}</span>
              <NSlider
                v-model:value="options.height"
                :min="CONFIG_OPTIONS.height.min"
                :max="CONFIG_OPTIONS.height.max"
                :step="CONFIG_OPTIONS.height.step"
                style="width: 120px"
              />
              <span class="slider-label">高: {{ options.height }}</span>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">文本:</span>
            <div class="control-content">
              <NSlider
                v-model:value="options.fontSize"
                :min="CONFIG_OPTIONS.fontSize.min"
                :max="CONFIG_OPTIONS.fontSize.max"
                :step="CONFIG_OPTIONS.fontSize.step"
                style="width: 120px"
              />
              <span class="slider-label">字号: {{ options.fontSize }}</span>
              <NSelect
                v-model:value="options.textPosition"
                :options="TEXT_POSITIONS"
                style="width: 100px"
              />
              <NCheckbox v-model:checked="options.showText">显示文本</NCheckbox>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">颜色:</span>
            <div class="control-content">
              <div class="color-presets">
                <button
                  v-for="preset in COLOR_PRESETS"
                  :key="preset.label"
                  type="button"
                  class="color-preset"
                  :aria-label="preset.label"
                  :aria-pressed="selectedColor === preset"
                  :style="{
                    backgroundColor: preset.background,
                    border: `2px solid ${preset.value}`,
                  }"
                  @click="selectColorPreset(preset)"
                />
              </div>
              <NColorPicker
                v-model:value="options.lineColor"
                :modes="['hex']"
                style="margin-left: 12px"
              />
              <span>线条</span>
              <NColorPicker
                v-model:value="options.background"
                :modes="['hex']"
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
          <NAlert
            v-if="validationError"
            type="warning"
            :bordered="false"
            >{{ validationError }}</NAlert
          >
          <div
            ref="previewRef"
            class="preview-barcode"
          >
            <C_Barcode
              v-if="!validationError"
              v-bind="options"
              :show-border="false"
              @error="handleBarcodeError"
            />
          </div>
          <div class="preview-info">
            <div class="info-item">
              <span class="info-label">格式:</span>
              <span class="info-value">{{ options.format }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">值:</span>
              <span class="info-value">{{ options.value || '空' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">尺寸:</span>
              <span class="info-value"
                >{{ options.width }} × {{ options.height }}</span
              >
            </div>
          </div>
        </div>
        <C_ActionBar
          :actions="actionButtons"
          :config="{ align: 'center', gap: 12, wrap: true }"
          class="action-buttons"
        />
      </div>
    </div>
    <section
      class="demo-section barcode-reader"
      aria-labelledby="barcode-reader-title"
    >
      <h2
        id="barcode-reader-title"
        class="section-title"
      >
        <C_Icon name="mdi:barcode-scan" />
        扫码录入
      </h2>
      <p class="section-desc"
        >用扫码枪或键盘录入后按回车，也可以先填入示例编号。编码按原字符串保存。</p
      >
      <C_ScanInput
        v-model="scanValue"
        camera
        photo
        @submit="recordScan"
        @scan="recordDetectedScan"
      />
      <div class="barcode-reader__result">
        <NButton
          size="small"
          @click="scanValue = SCAN_EXAMPLE"
        >
          <template #icon><span class="i-mdi-magnify" /></template>
          填入示例编码
        </NButton>
        <output
          aria-live="polite"
          data-testid="barcode-scan-result"
        >
          {{ submittedScan ? `已录入 ${submittedScan}` : '等待录入' }}
        </output>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo35Barcode' })
  import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
  import type { ScanResult } from '@robot-admin/naive-ui-components/C_ScanInput'
  import {
    BARCODE_FORMATS,
    BARCODE_EXAMPLES,
    CONFIG_OPTIONS,
    COLOR_PRESETS,
    DEFAULT_BARCODE,
    SCAN_EXAMPLE,
    TEXT_POSITIONS,
    validateBarcodeValue,
  } from './data'

  const message = useMessage()
  const scanValue = ref('')
  const submittedScan = ref('')

  /** 条码按字符串记录，保留编号前导零。 */
  const recordScan = (value: string) => {
    submittedScan.value = value
  }

  /** 相机和照片识别复用扫码枪的录入结果。 */
  const recordDetectedScan = (result: ScanResult) => recordScan(result.value)

  const previewRef = ref<HTMLElement | null>(null)
  const renderError = ref('')
  const options = reactive({ ...DEFAULT_BARCODE })
  const normalizeColor = (color: string) =>
    color.toLowerCase().replace(/^(#[\da-f]{6})ff$/, '$1')
  const selectedColor = computed(() =>
    COLOR_PRESETS.find(
      preset =>
        normalizeColor(options.lineColor) === normalizeColor(preset.value) &&
        normalizeColor(options.background) === normalizeColor(preset.background)
    )
  )

  const validationError = computed(
    () =>
      renderError.value || validateBarcodeValue(options.value, options.format)
  )
  watch(
    options,
    () => {
      renderError.value = ''
    },
    { flush: 'sync' }
  )

  const applyExample = (example: (typeof BARCODE_EXAMPLES)[number]) => {
    options.value = example.value
    options.format = example.format
  }

  const selectColorPreset = (preset: (typeof COLOR_PRESETS)[number]) => {
    options.lineColor = preset.value
    options.background = preset.background
  }

  // 条形码错误处理
  const handleBarcodeError = (error: Error) => {
    renderError.value = error.message || '条形码无法生成，请检查内容与格式'
  }

  // 下载当前真实绘制结果，空值和无效输入不能导出旧结果。
  const exportBarcode = () => {
    if (validationError.value) return
    const svg = previewRef.value?.querySelector('svg')
    const canvas = previewRef.value?.querySelector('canvas')
    let url: string
    if (svg)
      url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(svg)], {
          type: 'image/svg+xml',
        })
      )
    else if (canvas) url = canvas.toDataURL('image/png')
    else {
      message.warning('条形码尚未生成')
      return
    }
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `barcode-${options.format}.${svg ? 'svg' : 'png'}`
    anchor.click()
    if (svg) setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // 复制条形码值
  const copyBarcodeValue = async () => {
    try {
      await navigator.clipboard.writeText(options.value)
      message.success('条形码值已复制到剪贴板')
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  // 重置配置
  const resetConfig = () => {
    Object.assign(options, DEFAULT_BARCODE)
    message.success('配置已重置')
  }

  // ================= 操作按钮配置 =================
  const actionButtons = computed<ActionItem[]>(() => [
    {
      key: 'export',
      label: '导出图片',
      icon: 'mdi:download',
      type: 'primary',
      onClick: exportBarcode,
      disabled: Boolean(validationError.value),
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
  ])
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
