<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\38-upload\index.vue
 * @Description: 增强型上传组件演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="upload-demo-page">
    <c_vTitle
      title="增强型上传组件"
      icon="mdi:cloud-upload-outline"
      description="支持单文件/多文件/目录上传、拖拽上传、粘贴上传、分片上传、断点续传、秒传校验、并发控制等特性"
    />

    <div class="demo-grid">
      <!-- 1. 基础上传 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>基础上传</h3>
            <NTag
              type="info"
              size="small"
              round
              >默认</NTag
            >
          </div>
          <p class="card-desc"
            >最基本的文件上传，支持多选、拖拽。点击上传区域或直接将文件拖入框内。</p
          >
        </template>
        <div class="config-bar">
          <span class="config-label">类型</span>
          <NSelect
            v-model:value="basicAccept"
            :options="FILE_TYPE_OPTIONS"
            size="small"
            style="width: 120px"
          />
          <NCheckbox v-model:checked="basicMultiple">多选</NCheckbox>
          <NCheckbox v-model:checked="basicPaste">粘贴上传</NCheckbox>
        </div>
        <C_Upload
          ref="basicRef"
          :accept="basicAccept"
          :multiple="basicMultiple"
          :pasteable="basicPaste"
          :custom-request="mockUploadRequest"
          :max-size="50 * 1024 * 1024"
          :max-count="10"
          tip="支持任意文件，单文件最大 50MB，最多 10 个"
          show-file-list
          show-thumbnail
          @change="handleBasicChange"
          @success="handleSuccess"
          @error="handleError"
          @exceed="handleExceed"
        />
        <div class="action-bar">
          <NButton
            size="small"
            @click="basicRef?.clearAll()"
          >
            清空
          </NButton>
          <NTag
            type="info"
            size="small"
          >
            {{ basicCount }} 个文件
          </NTag>
        </div>
      </NCard>

      <!-- 2. 图片上传 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>图片上传</h3>
            <NTag
              type="success"
              size="small"
              round
              >预览</NTag
            >
          </div>
          <p class="card-desc"
            >设置 list-type="image" 开启图片预览网格模式，自动生成缩略图。</p
          >
        </template>
        <C_Upload
          ref="imageRef"
          accept="image/*"
          multiple
          list-type="image"
          :custom-request="mockUploadRequest"
          :max-count="9"
          :max-size="10 * 1024 * 1024"
          tip="仅支持图片，单张最大 10MB，最多 9 张"
          @change="handleImageChange"
        />
        <div class="action-bar">
          <NButton
            size="small"
            @click="imageRef?.clearAll()"
          >
            清空
          </NButton>
          <NTag
            type="info"
            size="small"
          >
            {{ imageCount }} 张图片
          </NTag>
        </div>
      </NCard>

      <!-- 3. 分片上传 - 全宽 -->
      <NCard
        class="demo-card full-width"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>分片上传（大文件）</h3>
            <NTag
              type="warning"
              size="small"
              round
              >分片</NTag
            >
          </div>
          <p class="card-desc"
            >开启 chunked
            属性后，大文件自动分片上传。支持断点续传和秒传检测。</p
          >
        </template>
        <div class="config-bar">
          <span class="config-label">分片大小</span>
          <NSelect
            v-model:value="chunkSize"
            :options="CHUNK_SIZE_OPTIONS"
            size="small"
            style="width: 100px"
          />
          <span class="config-label">并发数</span>
          <NSelect
            v-model:value="chunkConcurrency"
            :options="CONCURRENCY_OPTIONS"
            size="small"
            style="width: 70px"
          />
          <NCheckbox v-model:checked="enableInstantCheck">秒传检测</NCheckbox>
        </div>
        <C_Upload
          ref="chunkRef"
          multiple
          chunked
          :chunk-size="chunkSize"
          :concurrency="chunkConcurrency"
          :custom-request="mockUploadRequest"
          :instant-check="enableInstantCheck ? mockInstantCheck : undefined"
          :max-size="500 * 1024 * 1024"
          tip="支持大文件分片上传，单文件最大 500MB"
          show-file-list
          show-thumbnail
          @change="handleChunkChange"
          @success="handleSuccess"
          @error="handleError"
        />
        <div class="action-bar">
          <NButton
            type="primary"
            size="small"
            @click="chunkRef?.pauseAll()"
          >
            全部暂停
          </NButton>
          <NButton
            size="small"
            @click="chunkRef?.resumeAll()"
          >
            全部恢复
          </NButton>
          <NButton
            size="small"
            @click="chunkRef?.clearAll()"
          >
            清空
          </NButton>
          <NTag
            type="info"
            size="small"
          >
            {{ chunkCount }} 个文件
          </NTag>
        </div>
      </NCard>

      <!-- 4. 编程控制 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>编程控制</h3>
            <NTag
              size="small"
              round
              >API</NTag
            >
          </div>
          <p class="card-desc"
            >通过 ref 获取组件实例，调用
            selectFiles()、startUpload()、clearAll() 等方法。</p
          >
        </template>
        <div class="api-buttons">
          <NButton
            type="primary"
            size="small"
            block
            @click="basicRef?.selectFiles()"
          >
            <template #icon><C_Icon name="mdi:file-plus-outline" /></template>
            手动选择文件
          </NButton>
          <NButton
            size="small"
            block
            @click="handleGetSuccessList"
          >
            <template #icon
              ><C_Icon name="mdi:check-circle-outline"
            /></template>
            获取成功列表
          </NButton>
          <NButton
            size="small"
            block
            @click="basicRef?.clearAll()"
          >
            <template #icon><C_Icon name="mdi:delete-outline" /></template>
            清空全部
          </NButton>
        </div>
      </NCard>

      <!-- 5. 功能特性 -->
      <NCard
        class="demo-card"
        :bordered="false"
      >
        <template #header>
          <div class="card-header">
            <h3>功能特性</h3>
            <NTag
              type="info"
              size="small"
              round
              >总览</NTag
            >
          </div>
          <p class="card-desc">C_Upload 组件的核心功能特性一览。</p>
        </template>
        <div class="feature-list">
          <div class="feature-item">
            <C_Icon
              name="mdi:file-multiple-outline"
              class="feature-icon"
            />
            <span>多模式上传（单/多文件、拖拽、粘贴）</span>
          </div>
          <div class="feature-item">
            <C_Icon
              name="mdi:puzzle-outline"
              class="feature-icon"
            />
            <span>分片上传（大文件自动切片）</span>
          </div>
          <div class="feature-item">
            <C_Icon
              name="mdi:lightning-bolt"
              class="feature-icon"
            />
            <span>秒传 & 断点续传（MD5 校验）</span>
          </div>
          <div class="feature-item">
            <C_Icon
              name="mdi:tune-vertical"
              class="feature-icon"
            />
            <span>并发控制（队列自动调度）</span>
          </div>
          <div class="feature-item">
            <C_Icon
              name="mdi:progress-check"
              class="feature-icon"
            />
            <span>进度跟踪（实时状态展示）</span>
          </div>
          <div class="feature-item">
            <C_Icon
              name="mdi:cloud-cog-outline"
              class="feature-icon"
            />
            <span>自定义上传（OSS、七牛等）</span>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    UploadFileItem,
    UploadExpose,
  } from '@robot-admin/naive-ui-components'
  import {
    FILE_TYPE_OPTIONS,
    CHUNK_SIZE_OPTIONS,
    CONCURRENCY_OPTIONS,
    mockUploadRequest,
  } from './data'

  const message = useMessage()

  // ─── 1. 基础上传 ──────────────────────────────

  const basicRef = ref<UploadExpose>()
  const basicAccept = ref('')
  const basicMultiple = ref(true)
  const basicPaste = ref(false)
  const basicCount = ref(0)

  /** 基础上传文件列表变化 */
  function handleBasicChange(list: UploadFileItem[]) {
    basicCount.value = list.length
  }

  /** 上传成功回调 */
  function handleSuccess(file: UploadFileItem) {
    message.success(`${file.name} 上传成功`)
  }

  /** 上传失败回调 */
  function handleError(file: UploadFileItem) {
    message.error(`${file.name} 上传失败：${file.error}`)
  }

  /** 超出文件数限制回调 */
  function handleExceed(files: File[]) {
    message.warning(`超出最大文件数限制，${files.length} 个文件被忽略`)
  }

  // ─── 2. 图片上传 ──────────────────────────────

  const imageRef = ref<UploadExpose>()
  const imageCount = ref(0)

  /** 图片上传文件列表变化 */
  function handleImageChange(list: UploadFileItem[]) {
    imageCount.value = list.length
  }

  // ─── 3. 分片上传 ──────────────────────────────

  const chunkRef = ref<UploadExpose>()
  const chunkSize = ref(2 * 1024 * 1024)
  const chunkConcurrency = ref(3)
  const enableInstantCheck = ref(true)
  const chunkCount = ref(0)

  /** 分片上传文件列表变化 */
  function handleChunkChange(list: UploadFileItem[]) {
    chunkCount.value = list.length
  }

  /** 模拟秒传检查 */
  async function mockInstantCheck(hash: string, filename: string) {
    await new Promise(r => setTimeout(r, 300))
    // 模拟：10% 概率命中秒传
    if (Math.random() < 0.1) {
      message.info(`${filename} 秒传命中 ⚡`)
      return { exists: true, url: `https://example.com/files/${hash}` }
    }
    return { exists: false }
  }

  // ─── 4. 编程控制 ──────────────────────────────

  /** 获取上传成功列表 */
  function handleGetSuccessList() {
    const list = basicRef.value?.getSuccessList() ?? []
    if (list.length === 0) {
      message.info('暂无已上传成功的文件')
    } else {
      message.success(
        `共 ${list.length} 个文件上传成功：${list.map(f => f.name).join('、')}`
      )
    }
  }
</script>

<style scoped lang="scss">
  @use './index.scss';
</style>
