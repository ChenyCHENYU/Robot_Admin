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
    <NH1>增强型上传组件</NH1>
    <div class="demo-intro">
      C_Upload
      是一个功能完善的增强型上传组件，支持单文件/多文件/目录上传、拖拽上传、
      粘贴上传（Ctrl+V）、分片上传、断点续传、秒传校验、并发控制等特性。 使用
      spark-md5 进行文件哈希计算，通过 Web Worker 在后台线程运行，不阻塞 UI。
    </div>

    <!-- 1. 基础上传 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:cloud-upload-outline"
          class="title-icon"
        />
        基础上传
      </h2>
      <div class="section-desc">
        最基本的文件上传，支持多选、拖拽。点击上传区域或直接将文件拖入框内。
        文件类型默认不限制，可通过 <code>accept</code> 属性设置。
      </div>
      <div class="section-content">
        <div class="demo-toolbar">
          <div class="toolbar-item">
            <span>文件类型：</span>
            <NSelect
              v-model:value="basicAccept"
              :options="FILE_TYPE_OPTIONS"
              size="small"
              style="width: 130px"
            />
          </div>
          <div class="toolbar-item">
            <NSwitch
              v-model:value="basicMultiple"
              size="small"
            />
            <span>多选</span>
          </div>
          <div class="toolbar-item">
            <NSwitch
              v-model:value="basicPaste"
              size="small"
            />
            <span>粘贴上传</span>
          </div>
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

        <div class="demo-actions">
          <NButton
            size="small"
            @click="basicRef?.clearAll()"
          >
            清空全部
          </NButton>
          <NTag
            type="info"
            size="small"
          >
            文件数：{{ basicCount }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- 2. 图片上传（图片预览模式） -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:image-multiple-outline"
          class="title-icon"
        />
        图片上传（预览模式）
      </h2>
      <div class="section-desc">
        设置 <code>list-type="image"</code> 开启图片预览网格模式，
        自动生成缩略图。适合头像上传、图片库管理等场景。
      </div>
      <div class="section-content">
        <C_Upload
          ref="imageRef"
          accept="image/*"
          multiple
          list-type="image"
          :custom-request="mockUploadRequest"
          :max-count="9"
          :max-size="10 * 1024 * 1024"
          tip="仅支持图片文件，单张最大 10MB，最多 9 张"
          @change="handleImageChange"
        />

        <div class="demo-actions">
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
            图片数：{{ imageCount }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- 3. 分片上传 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:puzzle-outline"
          class="title-icon"
        />
        分片上传（大文件）
      </h2>
      <div class="section-desc">
        开启 <code>chunked</code> 属性后，大文件会自动分片上传。 可配置
        <code>chunk-size</code>（分片大小）和
        <code>concurrency</code>（并发数）。 支持
        <strong>断点续传</strong>（通过
        <code>uploadedChunksQuery</code> 查询已传分片） 和
        <strong>秒传</strong>（通过 <code>instantCheck</code> 校验文件 hash）。
      </div>
      <div class="section-content">
        <div class="demo-toolbar">
          <div class="toolbar-item">
            <span>分片大小：</span>
            <NSelect
              v-model:value="chunkSize"
              :options="CHUNK_SIZE_OPTIONS"
              size="small"
              style="width: 100px"
            />
          </div>
          <div class="toolbar-item">
            <span>并发数：</span>
            <NSelect
              v-model:value="chunkConcurrency"
              :options="CONCURRENCY_OPTIONS"
              size="small"
              style="width: 80px"
            />
          </div>
          <div class="toolbar-item">
            <NSwitch
              v-model:value="enableInstantCheck"
              size="small"
            />
            <span>秒传检测</span>
          </div>
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

        <div class="demo-actions">
          <NButton
            type="primary"
            size="small"
            @click="chunkRef?.pauseAll()"
          >
            全部暂停
          </NButton>
          <NButton
            type="info"
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
            文件数：{{ chunkCount }}
          </NTag>
        </div>
      </div>
    </div>

    <!-- 4. 编程控制 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:code-braces"
          class="title-icon"
        />
        编程控制（Expose API）
      </h2>
      <div class="section-desc">
        通过 <code>ref</code> 获取组件实例，调用
        <code>selectFiles()</code> 手动打开文件选择、
        <code>startUpload()</code> 手动开始上传、 <code>clearAll()</code> 清空、
        <code>getSuccessList()</code> 获取已上传列表。
      </div>
      <div class="section-content">
        <NSpace
          :size="8"
          style="margin-bottom: 12px"
        >
          <NButton
            type="primary"
            size="small"
            @click="basicRef?.selectFiles()"
          >
            手动选择文件
          </NButton>
          <NButton
            size="small"
            @click="handleGetSuccessList"
          >
            获取成功列表
          </NButton>
        </NSpace>
      </div>
    </div>

    <!-- 5. 功能特性总览 -->
    <div class="demo-section">
      <h2 class="section-title">
        <C_Icon
          name="mdi:view-grid-outline"
          class="title-icon"
        />
        功能特性总览
      </h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-card__title">
            <C_Icon
              name="mdi:file-multiple-outline"
              class="feature-card__icon"
            />
            多模式上传
          </div>
          <div class="feature-card__desc">
            单文件 / 多文件 / 目录上传，拖拽上传 + Ctrl+V 粘贴上传。
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-card__title">
            <C_Icon
              name="mdi:puzzle-outline"
              class="feature-card__icon"
            />
            分片上传
          </div>
          <div class="feature-card__desc">
            大文件自动切片，可配置分片大小，并发控制上传。
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-card__title">
            <C_Icon
              name="mdi:lightning-bolt"
              class="feature-card__icon"
            />
            秒传 & 断点续传
          </div>
          <div class="feature-card__desc">
            spark-md5 计算文件 hash（Web
            Worker），相同文件秒传，中断后断点续传。
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-card__title">
            <C_Icon
              name="mdi:tune-vertical"
              class="feature-card__icon"
            />
            并发控制
          </div>
          <div class="feature-card__desc">
            可配最大并发数，队列管理自动调度，避免服务端过载。
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-card__title">
            <C_Icon
              name="mdi:progress-check"
              class="feature-card__icon"
            />
            进度跟踪
          </div>
          <div class="feature-card__desc">
            单文件进度 + 分片进度 + 总体进度，实时展示上传状态。
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-card__title">
            <C_Icon
              name="mdi:cloud-cog-outline"
              class="feature-card__icon"
            />
            自定义上传
          </div>
          <div class="feature-card__desc">
            自定义上传函数，支持 OSS 直传、七牛上传等自定义协议。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { UploadFileItem, UploadExpose } from '@/types/modules/upload'
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
