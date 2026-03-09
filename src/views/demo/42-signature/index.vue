<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\42-signature\index.vue
 * @Description: 电子签名组件演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="signature-demo-page">
    <NH1>电子签名场景示例</NH1>

    <!-- 基础签名 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SCENARIOS.basic.icon"
          class="title-icon"
        />
        {{ SCENARIOS.basic.title }}
      </h2>
      <div class="section-desc">{{ SCENARIOS.basic.description }}</div>
      <div class="section-content">
        <div class="signature-container">
          <C_Signature
            ref="basicSignatureRef"
            :height="250"
          />
        </div>
        <div class="action-buttons">
          <NButton
            type="primary"
            @click="handleExport(basicSignatureRef, 'basic')"
          >
            <template #icon>
              <Icon icon="mdi:export" />
            </template>
            导出 PNG
          </NButton>
          <NButton @click="handleDownload(basicSignatureRef, 'signature')">
            <template #icon>
              <Icon icon="mdi:download" />
            </template>
            下载签名
          </NButton>
          <NButton @click="handleGetData(basicSignatureRef)">
            <template #icon>
              <Icon icon="mdi:code-json" />
            </template>
            获取数据
          </NButton>
        </div>
        <div
          v-if="exportResults.basic"
          class="result-preview"
        >
          <div class="preview-title">导出结果预览：</div>
          <img
            :src="exportResults.basic"
            alt="签名预览"
            class="preview-image"
          />
        </div>
      </div>
    </div>

    <!-- 自定义配置 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SCENARIOS.custom.icon"
          class="title-icon"
        />
        {{ SCENARIOS.custom.title }}
      </h2>
      <div class="section-desc">{{ SCENARIOS.custom.description }}</div>
      <div class="section-content">
        <NForm
          label-placement="left"
          label-width="100"
          class="config-form"
        >
          <NFormItem label="画笔颜色">
            <NColorPicker
              v-model:value="customConfig.penColor"
              :show-alpha="false"
            />
          </NFormItem>
          <NFormItem label="画笔粗细">
            <NSlider
              v-model:value="customConfig.penWidth"
              :min="1"
              :max="20"
              :step="1"
            />
          </NFormItem>
          <NFormItem label="背景颜色">
            <NColorPicker
              v-model:value="customConfig.bgColor"
              :show-alpha="false"
            />
          </NFormItem>
        </NForm>
        <div class="signature-container">
          <C_Signature
            ref="customSignatureRef"
            :height="250"
            :pen-config="{
              color: customConfig.penColor,
              width: customConfig.penWidth,
            }"
            :background-color="customConfig.bgColor"
          />
        </div>
        <div class="action-buttons">
          <NButton
            type="primary"
            @click="handleExport(customSignatureRef, 'custom')"
          >
            导出预览
          </NButton>
        </div>
        <div
          v-if="exportResults.custom"
          class="result-preview"
        >
          <div class="preview-title">导出结果：</div>
          <img
            :src="exportResults.custom"
            alt="自定义签名"
            class="preview-image"
          />
        </div>
      </div>
    </div>

    <!-- 带水印签名 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SCENARIOS.watermark.icon"
          class="title-icon"
        />
        {{ SCENARIOS.watermark.title }}
      </h2>
      <div class="section-desc">{{ SCENARIOS.watermark.description }}</div>
      <div class="section-content">
        <div class="signature-container">
          <C_Signature
            ref="watermarkSignatureRef"
            :height="250"
            :watermark="{
              show: true,
              text: watermarkText,
              fontSize: 12,
              color: '#999999',
              position: 'bottom-right',
            }"
          />
        </div>
        <div class="action-buttons">
          <NButton
            type="primary"
            @click="
              handleExport(watermarkSignatureRef, 'watermark', {
                includeWatermark: true,
              })
            "
          >
            <template #icon>
              <Icon icon="mdi:export" />
            </template>
            导出（含水印）
          </NButton>
          <NButton
            @click="
              handleExport(watermarkSignatureRef, 'watermark-no', {
                includeWatermark: false,
              })
            "
          >
            导出（不含水印）
          </NButton>
        </div>
        <div
          v-if="exportResults.watermark"
          class="result-preview"
        >
          <div class="preview-title">含水印导出：</div>
          <img
            :src="exportResults.watermark"
            alt="带水印签名"
            class="preview-image"
          />
        </div>
        <div
          v-if="exportResults['watermark-no']"
          class="result-preview"
        >
          <div class="preview-title">不含水印导出：</div>
          <img
            :src="exportResults['watermark-no']"
            alt="不带水印签名"
            class="preview-image"
          />
        </div>
      </div>
    </div>

    <!-- 只读模式 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SCENARIOS.readonly.icon"
          class="title-icon"
        />
        {{ SCENARIOS.readonly.title }}
      </h2>
      <div class="section-desc">{{ SCENARIOS.readonly.description }}</div>
      <div class="section-content">
        <div class="action-buttons">
          <NButton
            type="primary"
            @click="handleLoadSample"
          >
            <template #icon>
              <Icon icon="mdi:upload" />
            </template>
            加载示例签名
          </NButton>
          <NButton @click="handleClearReadonly">
            <template #icon>
              <Icon icon="mdi:delete" />
            </template>
            清空
          </NButton>
        </div>
        <div class="signature-container">
          <C_Signature
            ref="readonlySignatureRef"
            :height="250"
            :readonly="true"
            :show-toolbar="false"
          />
        </div>
        <NAlert
          type="info"
          class="tips-card"
        >
          <template #icon>
            <Icon icon="mdi:information" />
          </template>
          只读模式下签名不可编辑，适合用于展示历史签名记录
        </NAlert>
      </div>
    </div>

    <!-- API 演示 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          :name="SCENARIOS.api.icon"
          class="title-icon"
        />
        {{ SCENARIOS.api.title }}
      </h2>
      <div class="section-desc">{{ SCENARIOS.api.description }}</div>
      <div class="section-content">
        <div class="signature-container">
          <C_Signature
            ref="apiSignatureRef"
            :height="250"
            @change="handleSignatureChange"
          />
        </div>
        <div class="action-buttons">
          <NButton
            type="primary"
            :disabled="!savedData"
            @click="handleSaveSignature"
          >
            <template #icon>
              <Icon icon="mdi:content-save" />
            </template>
            保存签名数据
          </NButton>
          <NButton
            :disabled="!savedData"
            @click="handleRestoreSignature"
          >
            <template #icon>
              <Icon icon="mdi:restore" />
            </template>
            恢复签名
          </NButton>
          <NButton @click="handleClearApi">
            <template #icon>
              <Icon icon="mdi:delete" />
            </template>
            清空
          </NButton>
        </div>
        <div
          v-if="savedData"
          class="result-preview"
        >
          <div class="preview-title">已保存的签名数据（JSON）：</div>
          <div class="preview-text">
            {{ JSON.stringify(savedData, null, 2) }}
          </div>
        </div>
        <NAlert
          type="success"
          class="tips-card"
        >
          <template #icon>
            <Icon icon="mdi:check-circle" />
          </template>
          签名数据可以保存到数据库，支持完整恢复笔画路径
        </NAlert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    SignatureExpose,
    SignatureStroke,
  } from '@robot-admin/naive-ui-components'
  import { SCENARIOS, CUSTOM_CONFIG_DEFAULTS } from './data'

  defineOptions({
    name: 'SignatureDemo',
  })

  const message = useMessage()

  // Refs
  const basicSignatureRef = ref<SignatureExpose>()
  const customSignatureRef = ref<SignatureExpose>()
  const watermarkSignatureRef = ref<SignatureExpose>()
  const readonlySignatureRef = ref<SignatureExpose>()
  const apiSignatureRef = ref<SignatureExpose>()

  // 自定义配置
  const customConfig = reactive({ ...CUSTOM_CONFIG_DEFAULTS })

  // 水印文本
  const watermarkText = computed(() => {
    const now = new Date()
    return `签署时间: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
  })

  // 导出结果
  const exportResults = reactive<Record<string, string>>({})

  // 保存的签名数据
  const savedData = ref<SignatureStroke[] | null>(null)

  /**
   * 导出签名
   */
  const handleExport = async (
    signatureRef: SignatureExpose | undefined,
    key: string,
    options?: any
  ) => {
    if (!signatureRef) return

    if (signatureRef.isEmpty()) {
      message.warning('请先签名')
      return
    }

    try {
      const result = await signatureRef.export(options)
      if (typeof result === 'string') {
        exportResults[key] = result
        message.success('导出成功')
      }
    } catch (error) {
      message.error('导出失败')
      console.error(error)
    }
  }

  /**
   * 下载签名
   */
  const handleDownload = async (
    signatureRef: SignatureExpose | undefined,
    filename: string
  ) => {
    if (!signatureRef) return

    if (signatureRef.isEmpty()) {
      message.warning('请先签名')
      return
    }

    try {
      await signatureRef.download(filename, {
        format: 'png',
        includeBackground: false,
      })
      message.success('下载成功')
    } catch (error) {
      message.error('下载失败')
      console.error(error)
    }
  }

  /**
   * 获取签名数据
   */
  const handleGetData = (signatureRef: SignatureExpose | undefined) => {
    if (!signatureRef) return

    if (signatureRef.isEmpty()) {
      message.warning('请先签名')
      return
    }

    const data = signatureRef.getSignatureData()
    console.log('签名数据:', data)
    message.success(`获取成功，共 ${data.length} 个笔画`)
  }

  /**
   * 加载示例签名
   */
  const handleLoadSample = () => {
    if (!basicSignatureRef.value) return

    // 复制基础签名的数据到只读签名
    const data = basicSignatureRef.value.getSignatureData()
    if (data.length === 0) {
      message.warning('请先在基础签名板上签名')
      return
    }

    readonlySignatureRef.value?.loadSignatureData(data)
    message.success('加载成功')
  }

  /**
   * 清空只读签名
   */
  const handleClearReadonly = () => {
    readonlySignatureRef.value?.clear()
    message.info('已清空')
  }

  /**
   * 保存签名数据
   */
  const handleSaveSignature = () => {
    if (!apiSignatureRef.value) return

    if (apiSignatureRef.value.isEmpty()) {
      message.warning('请先签名')
      return
    }

    savedData.value = apiSignatureRef.value.getSignatureData()
    message.success('签名数据已保存到内存')
  }

  /**
   * 恢复签名
   */
  const handleRestoreSignature = () => {
    if (!savedData.value) {
      message.warning('没有保存的签名数据')
      return
    }

    apiSignatureRef.value?.loadSignatureData(savedData.value)
    message.success('签名已恢复')
  }

  /**
   * 清空 API 演示签名
   */
  const handleClearApi = () => {
    apiSignatureRef.value?.clear()
    message.info('已清空')
  }

  /**
   * 签名变化回调
   */
  const handleSignatureChange = (data: SignatureStroke[]) => {
    console.log('签名变化:', data.length, '个笔画')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
