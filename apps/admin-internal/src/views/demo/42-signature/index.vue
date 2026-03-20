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
    <c_vTitle
      title="电子签名场景示例"
      icon="mdi:signature-freehand"
      description="支持画笔配置、水印、只读模式、数据保存恢复等特性，适用于合同签署、审批确认等场景"
    />

    <div class="demo-grid">
      <!-- 基础签名 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ SCENARIOS.basic.title }}</h3>
            <NTag
              type="info"
              size="small"
              round
              >默认</NTag
            >
          </div>
          <p class="card-desc">{{ SCENARIOS.basic.description }}</p>
        </template>
        <C_Signature
          ref="basicSignatureRef"
          :height="200"
        />
        <div class="action-bar">
          <NButton
            type="primary"
            size="small"
            @click="handleExport(basicSignatureRef, 'basic')"
          >
            <template #icon><C_Icon name="mdi:export" /></template>
            导出
          </NButton>
          <NButton
            size="small"
            @click="handleDownload(basicSignatureRef, 'signature')"
          >
            <template #icon><C_Icon name="mdi:download" /></template>
            下载
          </NButton>
          <NButton
            size="small"
            @click="handleGetData(basicSignatureRef)"
          >
            <template #icon><C_Icon name="mdi:code-json" /></template>
            数据
          </NButton>
        </div>
        <div
          v-if="exportResults.basic"
          class="result-preview"
        >
          <img
            :src="exportResults.basic"
            alt="签名预览"
          />
        </div>
      </NCard>

      <!-- 自定义配置 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ SCENARIOS.custom.title }}</h3>
            <NTag
              type="warning"
              size="small"
              round
              >配置</NTag
            >
          </div>
          <p class="card-desc">{{ SCENARIOS.custom.description }}</p>
        </template>
        <div class="config-row">
          <span class="config-label">背景颜色</span>
          <NColorPicker
            v-model:value="customConfig.bgColor"
            :show-alpha="true"
            size="small"
            style="width: 100px"
          />
          <NCheckbox v-model:checked="customConfig.showToolbar">
            显示工具栏
          </NCheckbox>
        </div>
        <C_Signature
          ref="customSignatureRef"
          :height="200"
          :background-color="customConfig.bgColor"
          :show-toolbar="customConfig.showToolbar"
        />
        <div class="action-bar">
          <NButton
            type="primary"
            size="small"
            @click="handleExport(customSignatureRef, 'custom')"
          >
            导出预览
          </NButton>
        </div>
        <div
          v-if="exportResults.custom"
          class="result-preview"
        >
          <img
            :src="exportResults.custom"
            alt="自定义签名"
          />
        </div>
      </NCard>

      <!-- 带水印签名 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ SCENARIOS.watermark.title }}</h3>
            <NTag
              type="success"
              size="small"
              round
              >水印</NTag
            >
          </div>
          <p class="card-desc">{{ SCENARIOS.watermark.description }}</p>
        </template>
        <C_Signature
          ref="watermarkSignatureRef"
          :height="200"
          :watermark="{
            show: true,
            text: watermarkText,
            fontSize: 12,
            color: '#999999',
            position: 'bottom-right',
          }"
        />
        <div class="action-bar">
          <NButton
            type="primary"
            size="small"
            @click="handleWatermarkExport(true)"
          >
            <template #icon><C_Icon name="mdi:export" /></template>
            含水印
          </NButton>
          <NButton
            size="small"
            @click="handleWatermarkExport(false)"
          >
            不含水印
          </NButton>
          <NButton
            size="small"
            @click="handleClearWatermark"
          >
            <template #icon><C_Icon name="mdi:delete" /></template>
            清空
          </NButton>
        </div>
        <div
          v-if="exportResults.watermark"
          class="result-preview"
        >
          <img
            :src="exportResults.watermark"
            alt="带水印签名"
          />
        </div>
      </NCard>

      <!-- 只读模式 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ SCENARIOS.readonly.title }}</h3>
            <NTag
              size="small"
              round
              >只读</NTag
            >
          </div>
          <p class="card-desc">{{ SCENARIOS.readonly.description }}</p>
        </template>
        <C_Signature
          ref="readonlySignatureRef"
          :height="200"
          :readonly="true"
          :show-toolbar="false"
          :disabled="true"
        />
        <div class="action-bar">
          <NButton
            type="primary"
            size="small"
            @click="handleLoadSample"
          >
            <template #icon><C_Icon name="mdi:upload" /></template>
            加载示例
          </NButton>
          <NButton
            size="small"
            @click="handleClearReadonly"
          >
            <template #icon><C_Icon name="mdi:delete" /></template>
            清空
          </NButton>
        </div>
        <NAlert
          type="info"
          size="small"
          class="tips-card"
        >
          只读模式下签名不可编辑，适合展示历史签名
        </NAlert>
      </NCard>

      <!-- API 演示 - 全宽 -->
      <NCard
        class="demo-card full-width"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>{{ SCENARIOS.api.title }}</h3>
            <NTag
              type="error"
              size="small"
              round
              >API</NTag
            >
          </div>
          <p class="card-desc">{{ SCENARIOS.api.description }}</p>
        </template>
        <div class="api-demo">
          <div class="api-left">
            <C_Signature
              ref="apiSignatureRef"
              :height="180"
              @change="handleSignatureChange"
            />
            <div class="action-bar">
              <NButton
                type="primary"
                size="small"
                :disabled="!savedData"
                @click="handleSaveSignature"
              >
                <template #icon><C_Icon name="mdi:content-save" /></template>
                保存
              </NButton>
              <NButton
                size="small"
                :disabled="!savedData"
                @click="handleRestoreSignature"
              >
                <template #icon><C_Icon name="mdi:restore" /></template>
                恢复
              </NButton>
              <NButton
                size="small"
                @click="handleClearApi"
              >
                <template #icon><C_Icon name="mdi:delete" /></template>
                清空
              </NButton>
            </div>
          </div>
          <div
            v-if="savedData"
            class="api-right"
          >
            <div class="data-title">签名数据（JSON）</div>
            <pre class="data-preview">{{
              JSON.stringify(savedData, null, 2)
            }}</pre>
          </div>
        </div>
        <NAlert
          type="success"
          size="small"
          class="tips-card"
        >
          签名数据可保存到数据库，支持完整恢复笔画路径
        </NAlert>
      </NCard>
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
   * 清空水印签名并清除导出结果
   */
  const handleClearWatermark = () => {
    watermarkSignatureRef.value?.clear()
    // 清除所有水印相关的导出结果
    delete exportResults.watermark
    delete exportResults['watermark-no']
    message.info('已清空')
  }

  /**
   * 处理水印导出
   */
  const handleWatermarkExport = async (includeWatermark: boolean) => {
    if (!watermarkSignatureRef.value) return

    if (watermarkSignatureRef.value.isEmpty()) {
      message.warning('请先签名')
      return
    }

    try {
      const key = includeWatermark ? 'watermark' : 'watermark-no'
      const result = await watermarkSignatureRef.value.export({
        includeWatermark,
      })
      if (typeof result === 'string') {
        exportResults[key] = result
        message.success(
          includeWatermark ? '含水印导出成功' : '不含水印导出成功'
        )
      }
    } catch (error) {
      message.error('导出失败')
      console.error(error)
    }
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
