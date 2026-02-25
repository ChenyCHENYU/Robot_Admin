<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\45-image-cropper\index.vue
 * @Description: 图片裁剪组件演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="image-cropper-demo-page">
    <NH1>图片裁剪场景示例</NH1>

    <!-- 基础裁剪 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:crop"
          class="title-icon"
        />
        基础裁剪
      </h2>
      <div class="section-desc">
        最简单的图片裁剪，支持拖拽、缩放、旋转。工具栏提供常用比例预设和操作按钮
      </div>
      <div class="section-content">
        <C_ImageCropper
          ref="basicRef"
          :src="DEMO_IMAGE"
          height="400px"
        />
        <NSpace
          :size="8"
          style="margin-top: 12px"
        >
          <NButton
            type="primary"
            @click="handleBasicCrop"
          >
            <template #icon>
              <C_Icon name="mdi:content-cut" />
            </template>
            裁剪
          </NButton>
        </NSpace>
        <div
          v-if="basicResult"
          class="demo-result"
        >
          <img
            :src="basicResult.base64"
            alt="裁剪结果"
          />
          <div class="demo-info">
            <NTag
              size="small"
              type="info"
            >
              {{ basicResult.width }} × {{ basicResult.height }}
            </NTag>
            <NTag
              size="small"
              type="success"
            >
              {{ basicResult.format.toUpperCase() }}
            </NTag>
            <NText depth="3">
              {{ (basicResult.blob.size / 1024).toFixed(1) }} KB
            </NText>
          </div>
        </div>
      </div>
    </div>

    <!-- 头像裁剪 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:account-circle-outline"
          class="title-icon"
        />
        头像裁剪（圆形）
      </h2>
      <div class="section-desc">
        设置 <code>circular</code> + <code>aspect-ratio="1"</code>
        实现圆形头像裁剪，预览面板同步显示圆形效果
      </div>
      <div class="section-content">
        <C_ImageCropper
          ref="avatarRef"
          :src="DEMO_AVATAR"
          :aspect-ratio="1"
          :circular="true"
          height="350px"
        />
        <NSpace
          :size="8"
          style="margin-top: 12px"
        >
          <NButton
            type="primary"
            @click="handleAvatarCrop"
          >
            <template #icon>
              <C_Icon name="mdi:check" />
            </template>
            裁剪头像
          </NButton>
        </NSpace>
        <div
          v-if="avatarResult"
          class="demo-result demo-result__circular"
        >
          <img
            :src="avatarResult.base64"
            alt="头像结果"
          />
        </div>
      </div>
    </div>

    <!-- 输出配置 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:tune-variant"
          class="title-icon"
        />
        输出格式 & 质量
      </h2>
      <div class="section-desc">
        支持 PNG / JPEG / WebP 输出，可调节质量和限制最大尺寸
      </div>
      <div class="section-content">
        <div class="output-config">
          <NFormItem
            label="格式"
            label-placement="left"
          >
            <NSelect
              v-model:value="outputFormat"
              :options="formatOptions"
              style="width: 120px"
              size="small"
            />
          </NFormItem>
          <NFormItem
            label="质量"
            label-placement="left"
          >
            <NSelect
              v-model:value="outputQuality"
              :options="qualityOptions"
              style="width: 140px"
              size="small"
            />
          </NFormItem>
          <NFormItem
            label="最大宽度"
            label-placement="left"
          >
            <NInputNumber
              v-model:value="maxWidth"
              :min="0"
              :step="100"
              placeholder="0=不限"
              style="width: 120px"
              size="small"
            />
          </NFormItem>
        </div>
        <C_ImageCropper
          ref="configRef"
          :src="DEMO_IMAGE"
          :output-format="outputFormat"
          :output-quality="outputQuality"
          :max-output-width="maxWidth"
          height="350px"
        />
        <NSpace
          :size="8"
          style="margin-top: 12px"
        >
          <NButton
            type="primary"
            @click="handleConfigCrop"
          >
            导出
          </NButton>
        </NSpace>
        <div
          v-if="configResult"
          class="demo-result"
        >
          <img
            :src="configResult.base64"
            alt="配置结果"
          />
          <div class="demo-info">
            <NTag
              size="small"
              type="info"
            >
              {{ configResult.width }} × {{ configResult.height }}
            </NTag>
            <NTag
              size="small"
              type="success"
            >
              {{ configResult.format.toUpperCase() }}
            </NTag>
            <NText depth="3">
              {{ (configResult.blob.size / 1024).toFixed(1) }} KB
            </NText>
          </div>
        </div>
      </div>
    </div>

    <!-- 本地上传裁剪 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:upload"
          class="title-icon"
        />
        本地文件裁剪
      </h2>
      <div class="section-desc">
        点击选取本地图片，裁剪后导出。适合上传场景
      </div>
      <div class="section-content">
        <div
          v-if="!uploadSrc"
          class="demo-upload-area"
          @click="triggerUpload"
        >
          <C_Icon
            name="mdi:cloud-upload-outline"
            style="font-size: 36px; opacity: 0.4"
          />
          <NText depth="3">点击选择图片</NText>
        </div>
        <template v-else>
          <C_ImageCropper
            ref="uploadRef"
            :src="uploadSrc"
            height="350px"
          />
          <NSpace
            :size="8"
            style="margin-top: 12px"
          >
            <NButton @click="triggerUpload">重新选择</NButton>
            <NButton
              type="primary"
              @click="handleUploadCrop"
            >
              裁剪
            </NButton>
          </NSpace>
          <div
            v-if="uploadResult"
            class="demo-result"
          >
            <img
              :src="uploadResult.base64"
              alt="上传裁剪结果"
            />
          </div>
        </template>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          hidden
          @change="handleFileChange"
        />
      </div>
    </div>

    <!-- 弹窗模式 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:window-maximize"
          class="title-icon"
        />
        弹窗模式
      </h2>
      <div class="section-desc">
        设置 <code>modal</code>
        属性以弹窗形式打开裁剪器，适配上传后二次裁剪场景
      </div>
      <div class="section-content">
        <NButton
          type="primary"
          @click="modalRef?.open(DEMO_IMAGE)"
        >
          <template #icon>
            <C_Icon name="mdi:crop" />
          </template>
          打开裁剪弹窗
        </NButton>
        <C_ImageCropper
          ref="modalRef"
          :modal="true"
          modal-title="裁剪 Banner"
          :aspect-ratio="16 / 9"
          @confirm="onModalConfirm"
        />
        <div
          v-if="modalResult"
          class="demo-result"
        >
          <img
            :src="modalResult.base64"
            alt="弹窗裁剪结果"
          />
          <div class="demo-info">
            <NTag
              size="small"
              type="info"
            >
              {{ modalResult.width }} × {{ modalResult.height }}
            </NTag>
          </div>
        </div>
      </div>
    </div>

    <!-- 编程控制 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:code-braces"
          class="title-icon"
        />
        编程控制
      </h2>
      <div class="section-desc">
        通过 <code>ref</code> 调用旋转、缩放、翻转、设置比例等方法
      </div>
      <div class="section-content">
        <NSpace
          :size="8"
          style="margin-bottom: 12px"
        >
          <NButton
            size="small"
            @click="apiRef?.rotate(-90)"
          >
            逆时针 90°
          </NButton>
          <NButton
            size="small"
            @click="apiRef?.rotate(90)"
          >
            顺时针 90°
          </NButton>
          <NButton
            size="small"
            @click="apiRef?.zoom(0.2)"
          >
            放大
          </NButton>
          <NButton
            size="small"
            @click="apiRef?.zoom(-0.2)"
          >
            缩小
          </NButton>
          <NButton
            size="small"
            @click="apiRef?.flipX()"
          >
            水平翻转
          </NButton>
          <NButton
            size="small"
            @click="apiRef?.flipY()"
          >
            垂直翻转
          </NButton>
          <NButton
            size="small"
            @click="apiRef?.setAspectRatio(16 / 9)"
          >
            16:9
          </NButton>
          <NButton
            size="small"
            @click="apiRef?.setAspectRatio(0)"
          >
            自由
          </NButton>
          <NButton
            size="small"
            type="warning"
            @click="apiRef?.reset()"
          >
            重置
          </NButton>
        </NSpace>
        <C_ImageCropper
          ref="apiRef"
          :src="DEMO_IMAGE"
          :show-toolbar="false"
          :show-preview="false"
          height="350px"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    CropOutputFormat,
    CropResult,
  } from '@/types/modules/image-cropper'
  import {
    DEMO_AVATAR,
    DEMO_IMAGE,
    formatOptions,
    qualityOptions,
  } from './data'

  const message = useMessage()

  // ─── Refs ──────────────────────────────────────
  const basicRef = ref()
  const avatarRef = ref()
  const configRef = ref()
  const uploadRef = ref()
  const modalRef = ref()
  const apiRef = ref()
  const fileInputRef = ref<HTMLInputElement | null>(null)

  // ─── 基础裁剪 ──────────────────────────────────
  const basicResult = ref<CropResult>()

  /** 基础裁剪 */
  async function handleBasicCrop() {
    try {
      basicResult.value = await basicRef.value?.getCropResult()
      message.success('裁剪成功')
    } catch {
      message.error('裁剪失败')
    }
  }

  // ─── 头像裁剪 ──────────────────────────────────
  const avatarResult = ref<CropResult>()

  /** 头像裁剪 */
  async function handleAvatarCrop() {
    try {
      avatarResult.value = await avatarRef.value?.getCropResult()
      message.success('头像裁剪成功')
    } catch {
      message.error('裁剪失败')
    }
  }

  // ─── 输出配置 ──────────────────────────────────
  const outputFormat = ref<CropOutputFormat>('png')
  const outputQuality = ref(0.92)
  const maxWidth = ref(0)
  const configResult = ref<CropResult>()

  /** 配置导出 */
  async function handleConfigCrop() {
    try {
      configResult.value = await configRef.value?.getCropResult()
      message.success('导出成功')
    } catch {
      message.error('导出失败')
    }
  }

  // ─── 本地上传 ──────────────────────────────────
  const uploadSrc = ref('')
  const uploadResult = ref<CropResult>()

  /** 触发文件选择 */
  function triggerUpload() {
    fileInputRef.value?.click()
  }

  /** 文件选取回调 */
  function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      uploadSrc.value = ev.target?.result as string
      uploadResult.value = undefined
    }
    reader.readAsDataURL(file)
  }

  /** 上传裁剪 */
  async function handleUploadCrop() {
    try {
      uploadResult.value = await uploadRef.value?.getCropResult()
      message.success('裁剪成功')
    } catch {
      message.error('裁剪失败')
    }
  }

  // ─── 弹窗模式 ──────────────────────────────────
  const modalResult = ref<CropResult>()

  /** 弹窗裁剪确认 */
  function onModalConfirm(result: CropResult) {
    modalResult.value = result
    message.success('弹窗裁剪确认')
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
