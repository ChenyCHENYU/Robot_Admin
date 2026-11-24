<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-16 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\39-qrcode\index.vue
 * @Description: 二维码演示页面
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="qrcode-demo">
    <c_vTitle
      title="二维码组件场景示例"
      icon="mdi:qrcode"
      description="支持自定义颜色尺寸、Logo 嵌入、多种纠错等级，适用于网址分享、电子名片等场景"
    />

    <nav
      class="generator-presets"
      aria-label="生成场景"
      ><span>选择用途</span
      ><button
        v-for="example in QRCODE_EXAMPLES"
        :key="example.title"
        type="button"
        :aria-pressed="options.value === example.value"
        @click="options.value = example.value"
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
          通过以下配置选项，您可以自定义二维码的内容、颜色、尺寸、Logo
          等属性，实时预览配置效果。
        </p>
        <div class="control-panel">
          <!-- 内容 -->
          <div class="control-row">
            <span class="control-label">内容:</span>
            <div class="control-content">
              <NInput
                v-model:value="options.value"
                type="textarea"
                placeholder="请输入二维码内容（文本或 URL）"
                :autosize="{ minRows: 1, maxRows: 3 }"
                style="flex: 1"
              />
            </div>
          </div>

          <!-- 渲染模式 & 纠错等级 -->
          <div class="control-row">
            <span class="control-label">模式:</span>
            <div class="control-content">
              <NRadioGroup
                v-model:value="options.mode"
                name="render-mode"
              >
                <NRadioButton
                  v-for="mode in RENDER_MODES"
                  :key="mode.value"
                  :value="mode.value"
                  :label="mode.label"
                />
              </NRadioGroup>
              <NSelect
                v-model:value="options.errorCorrectionLevel"
                :options="ERROR_LEVELS"
                style="width: 130px"
              />
              <span class="hint-text">纠错等级</span>
            </div>
          </div>

          <!-- 尺寸 & 边距 -->
          <div class="control-row">
            <span class="control-label">尺寸:</span>
            <div class="control-content">
              <NSlider
                v-model:value="options.size"
                :min="SIZE_OPTIONS.min"
                :max="SIZE_OPTIONS.max"
                :step="SIZE_OPTIONS.step"
                style="width: 160px"
              />
              <span class="slider-label">{{ options.size }}px</span>
              <NSlider
                v-model:value="options.margin"
                :min="MARGIN_OPTIONS.min"
                :max="MARGIN_OPTIONS.max"
                :step="MARGIN_OPTIONS.step"
                style="width: 100px"
              />
              <span class="slider-label">边距: {{ options.margin }}</span>
            </div>
          </div>

          <!-- 颜色 -->
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
                    backgroundColor: preset.bgColor,
                    border: `2px solid ${preset.color}`,
                  }"
                  :title="preset.label"
                  @click="selectColorPreset(preset)"
                />
              </div>
              <NColorPicker
                v-model:value="options.color"
                :modes="['hex']"
                style="margin-left: 12px"
              />
              <span class="hint-text">前景</span>
              <NColorPicker
                v-model:value="options.bgColor"
                :modes="['hex']"
                style="margin-left: 8px"
              />
              <span class="hint-text">背景</span>
            </div>
          </div>

          <!-- Logo -->
          <div class="control-row">
            <span class="control-label">Logo:</span>
            <div class="control-content">
              <NCheckbox v-model:checked="options.enableLogo"
                >启用 Logo</NCheckbox
              >
              <template v-if="options.enableLogo">
                <NInput
                  v-model:value="options.logoSrc"
                  placeholder="Logo 图片地址"
                  style="width: 200px"
                />
                <NSlider
                  v-model:value="options.logoSize"
                  :min="LOGO_SIZE_OPTIONS.min"
                  :max="LOGO_SIZE_OPTIONS.max"
                  :step="LOGO_SIZE_OPTIONS.step"
                  style="width: 100px"
                />
                <span class="slider-label"
                  >{{ Math.round(options.logoSize * 100) }}%</span
                >
              </template>
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
          <div class="preview-qrcode">
            <C_QRCode
              ref="qrRef"
              :value="options.value"
              :size="options.size"
              :color="options.color"
              :bg-color="options.bgColor"
              :error-correction-level="options.errorCorrectionLevel"
              :margin="options.margin"
              :mode="options.mode"
              :logo="logoOptions"
              :show-border="true"
              @error="handleError"
            />
          </div>
          <div class="preview-info">
            <div class="info-item">
              <span class="info-label">模式:</span>
              <span class="info-value">{{
                options.mode === 'canvas' ? 'Canvas' : 'SVG'
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">纠错:</span>
              <span class="info-value">{{ options.errorCorrectionLevel }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">尺寸:</span>
              <span class="info-value">{{ options.size }}px</span>
            </div>
            <div class="info-item">
              <span class="info-label">内容长度:</span>
              <span class="info-value">{{ options.value.length }} 字符</span>
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
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo39Qrcode' })
  import type {
    LogoOptions,
    QRCodeExpose,
  } from '@robot-admin/naive-ui-components/C_QRCode'
  import type { ActionItem } from '@robot-admin/naive-ui-components/C_ActionBar'
  import {
    QRCODE_EXAMPLES,
    ERROR_LEVELS,
    RENDER_MODES,
    SIZE_OPTIONS,
    MARGIN_OPTIONS,
    COLOR_PRESETS,
    DEFAULT_QRCODE,
    LOGO_SIZE_OPTIONS,
  } from './data'

  const message = useMessage()

  // 二维码组件 ref
  const qrRef = ref<QRCodeExpose | null>(null)

  const options = reactive({ ...DEFAULT_QRCODE })
  const normalizeColor = (color: string) =>
    color.toLowerCase().replace(/^(#[\da-f]{6})ff$/, '$1')
  const selectedColor = computed(() =>
    COLOR_PRESETS.find(
      preset =>
        normalizeColor(options.color) === normalizeColor(preset.color) &&
        normalizeColor(options.bgColor) === normalizeColor(preset.bgColor)
    )
  )

  const logoOptions = computed<LogoOptions | undefined>(() => {
    if (!options.enableLogo || !options.logoSrc) return undefined
    return {
      src: options.logoSrc,
      size: options.logoSize,
      borderRadius: 4,
      padding: 4,
      bgColor: '#ffffff',
    }
  })

  const selectColorPreset = (preset: (typeof COLOR_PRESETS)[number]) => {
    options.color = preset.color
    options.bgColor = preset.bgColor
  }

  // 错误处理
  const handleError = (error: Error) => {
    message.error(`二维码生成失败: ${error.message}`)
  }

  // 下载二维码
  const downloadQRCode = async () => {
    try {
      if (!qrRef.value || !options.value.trim()) return
      await qrRef.value.download('qrcode', 'png')
      message.success('二维码已下载')
    } catch {
      message.error('下载失败')
    }
  }

  // 复制内容
  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(options.value)
      message.success('内容已复制到剪贴板')
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  // 重置配置
  const resetConfig = () => {
    Object.assign(options, DEFAULT_QRCODE)
    message.success('配置已重置')
  }

  // ================= 操作按钮配置 =================
  const actionButtons = computed<ActionItem[]>(() => [
    {
      key: 'download',
      label: '下载图片',
      icon: 'mdi:download',
      type: 'primary',
      onClick: downloadQRCode,
      disabled: !options.value.trim(),
    },
    {
      key: 'copy',
      label: '复制内容',
      icon: 'mdi:content-copy',
      onClick: copyValue,
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
