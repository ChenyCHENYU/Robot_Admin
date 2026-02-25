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
    <NH1>二维码组件场景示例</NH1>

    <!-- 示例展示 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:qrcode"
          class="title-icon"
        />
        二维码示例
      </h2>
      <p class="section-desc">
        以下展示了常见的二维码应用场景。二维码可以编码网址、WiFi
        信息、电子名片等多种数据格式，扫码即可快速获取信息。
      </p>
      <div class="examples-grid">
        <div
          v-for="(example, index) in QRCODE_EXAMPLES"
          :key="index"
          class="example-card"
        >
          <div class="example-header">
            <C_Icon
              :name="example.icon"
              class="example-icon"
            />
            <h3 class="example-title">{{ example.title }}</h3>
          </div>
          <p class="example-desc">{{ example.description }}</p>
          <div class="example-qrcode">
            <C_QRCode
              :value="example.value"
              :size="160"
              :show-border="false"
              :margin="1"
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
        通过以下配置选项，您可以自定义二维码的内容、颜色、尺寸、Logo
        等属性，实时预览配置效果。
      </p>
      <div class="control-panel">
        <!-- 内容 -->
        <div class="control-row">
          <span class="control-label">内容:</span>
          <div class="control-content">
            <NInput
              v-model:value="customValue"
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
              v-model:value="customMode"
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
              v-model:value="customLevel"
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
              v-model:value="customSize"
              :min="SIZE_OPTIONS.min"
              :max="SIZE_OPTIONS.max"
              :step="SIZE_OPTIONS.step"
              style="width: 160px"
            />
            <span class="slider-label">{{ customSize }}px</span>
            <NSlider
              v-model:value="customMargin"
              :min="MARGIN_OPTIONS.min"
              :max="MARGIN_OPTIONS.max"
              :step="MARGIN_OPTIONS.step"
              style="width: 100px"
            />
            <span class="slider-label">边距: {{ customMargin }}</span>
          </div>
        </div>

        <!-- 颜色 -->
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
                  backgroundColor: preset.bgColor,
                  border: `2px solid ${preset.color}`,
                }"
                :title="preset.label"
                @click="selectColorPreset(index)"
              />
            </div>
            <NColorPicker
              v-model:value="customColor"
              style="margin-left: 12px"
            />
            <span class="hint-text">前景</span>
            <NColorPicker
              v-model:value="customBgColor"
              style="margin-left: 8px"
            />
            <span class="hint-text">背景</span>
          </div>
        </div>

        <!-- Logo -->
        <div class="control-row">
          <span class="control-label">Logo:</span>
          <div class="control-content">
            <NCheckbox v-model:checked="enableLogo">启用 Logo</NCheckbox>
            <template v-if="enableLogo">
              <NInput
                v-model:value="logoSrc"
                placeholder="Logo 图片地址"
                style="width: 200px"
              />
              <NSlider
                v-model:value="logoSize"
                :min="LOGO_SIZE_OPTIONS.min"
                :max="LOGO_SIZE_OPTIONS.max"
                :step="LOGO_SIZE_OPTIONS.step"
                style="width: 100px"
              />
              <span class="slider-label"
                >{{ Math.round(logoSize * 100) }}%</span
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
            :value="customValue"
            :size="customSize"
            :color="customColor"
            :bg-color="customBgColor"
            :error-correction-level="customLevel"
            :margin="customMargin"
            :mode="customMode"
            :logo="logoOptions"
            :show-border="true"
            @error="handleError"
          />
        </div>
        <div class="preview-info">
          <div class="info-item">
            <span class="info-label">模式:</span>
            <span class="info-value">{{
              customMode === 'canvas' ? 'Canvas' : 'SVG'
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">纠错:</span>
            <span class="info-value">{{ customLevel }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">尺寸:</span>
            <span class="info-value">{{ customSize }}px</span>
          </div>
          <div class="info-item">
            <span class="info-label">内容长度:</span>
            <span class="info-value">{{ customValue.length }} 字符</span>
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
  import type { ActionItem } from '@/types/modules/action-bar'
  import type {
    ErrorCorrectionLevel,
    LogoOptions,
    RenderMode,
  } from '@/types/modules/qrcode'
  import {
    QRCODE_EXAMPLES,
    ERROR_LEVELS,
    RENDER_MODES,
    SIZE_OPTIONS,
    MARGIN_OPTIONS,
    COLOR_PRESETS,
    LOGO_SIZE_OPTIONS,
  } from './data'

  const message = useMessage()

  // 二维码组件 ref
  const qrRef = ref()

  // 自定义配置
  const customValue = ref('https://vuejs.org')
  const customMode = ref<RenderMode>('canvas')
  const customLevel = ref<ErrorCorrectionLevel>('M')
  const customSize = ref(SIZE_OPTIONS.default)
  const customMargin = ref(MARGIN_OPTIONS.default)
  const customColor = ref('#000000')
  const customBgColor = ref('#FFFFFF')
  const selectedColorIndex = ref(0)

  // Logo 配置
  const enableLogo = ref(false)
  const logoSrc = ref('/vite.svg')
  const logoSize = ref(LOGO_SIZE_OPTIONS.default)

  const logoOptions = computed<LogoOptions | undefined>(() => {
    if (!enableLogo.value || !logoSrc.value) return undefined
    return {
      src: logoSrc.value,
      size: logoSize.value,
      borderRadius: 4,
      padding: 4,
      bgColor: '#ffffff',
    }
  })

  // 选择颜色预设
  const selectColorPreset = (index: number) => {
    selectedColorIndex.value = index
    const preset = COLOR_PRESETS[index]
    customColor.value = preset.color
    customBgColor.value = preset.bgColor
  }

  // 错误处理
  const handleError = (error: Error) => {
    message.error(`二维码生成失败: ${error.message}`)
  }

  // 下载二维码
  const downloadQRCode = async () => {
    try {
      await qrRef.value?.download('qrcode', 'png')
      message.success('二维码已下载')
    } catch {
      message.error('下载失败')
    }
  }

  // 复制内容
  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(customValue.value)
      message.success('内容已复制到剪贴板')
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  // 重置配置
  const resetConfig = () => {
    customValue.value = 'https://vuejs.org'
    customMode.value = 'canvas'
    customLevel.value = 'M'
    customSize.value = SIZE_OPTIONS.default
    customMargin.value = MARGIN_OPTIONS.default
    customColor.value = '#000000'
    customBgColor.value = '#FFFFFF'
    selectedColorIndex.value = 0
    enableLogo.value = false
    logoSrc.value = '/vite.svg'
    logoSize.value = LOGO_SIZE_OPTIONS.default
    message.success('配置已重置')
  }

  // ================= 操作按钮配置 =================
  const actionButtons: ActionItem[] = [
    {
      key: 'download',
      label: '下载图片',
      icon: 'mdi:download',
      type: 'primary',
      onClick: downloadQRCode,
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
  ]
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
