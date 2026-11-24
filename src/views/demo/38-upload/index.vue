<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 单队列上传工作台，明确演示传输状态和恢复路径
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace upload-workspace">
    <header class="workspace-heading"
      ><div
        ><small>TRANSFER CENTER</small><h1>上传工作台</h1
        ><p>一个队列，完成文件选择、传输进度与失败恢复。</p></div
      ><NTag
        size="small"
        :bordered="false"
        type="info"
        >本地演示 · 不上传至服务器</NTag
      ></header
    >
    <div class="workspace-grid"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>上传场景</h2
          ><button
            v-for="item in UPLOAD_SCENES"
            :key="item.value"
            type="button"
            class="workspace-choice"
            :aria-pressed="page.scene === item.value"
            :disabled="page.files.length > 0"
            @click="page.scene = item.value"
            ><span class="workspace-badge">{{
              item.value === 'images'
                ? 'IMG'
                : item.value === 'chunked'
                  ? '2MB'
                  : item.value === 'directory'
                    ? 'DIR'
                    : 'FILE'
            }}</span
            ><span
              ><strong>{{ item.label }}</strong
              ><small>{{ item.note }}</small></span
            ></button
          ><p class="workspace-hint"
            >清空队列后可切换场景，避免传输中改变分片或校验规则。</p
          ></section
        ><section class="workspace-section"
          ><h2>体验设置</h2
          ><NCheckbox v-model:checked="page.pasteable">允许粘贴文件</NCheckbox
          ><label class="workspace-label"
            ><NCheckbox
              v-model:checked="page.failFirst"
              :disabled="page.busy"
              >模拟首次失败</NCheckbox
            ></label
          ><p
            >开启后，新文件首次传输会失败；点击重试即可完成。已触发过失败的同名文件不再重复失败。</p
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>传输队列</h2
            ><small
              >{{ page.files.length }} 个文件 · {{ page.successful }} 已完成 ·
              {{ page.errors }} 失败</small
            ></div
          ><div class="workspace-actions"
            ><NButton
              size="tiny"
              :disabled="!page.busy"
              @click="page.uploadRef?.pauseAll()"
              >全部暂停</NButton
            ><NButton
              size="tiny"
              :disabled="!page.paused"
              @click="page.uploadRef?.resumeAll()"
              >继续传输</NButton
            ><NButton
              size="tiny"
              :disabled="!page.errors"
              @click="page.retryErrors"
              >重试失败项</NButton
            ></div
          ></header
        >
        <div class="upload-entry"
          ><C_Upload
            ref="uploadRef"
            multiple
            :directory="page.scene === 'directory'"
            :accept="page.currentScene.accept"
            :pasteable="page.pasteable"
            :chunked="page.scene === 'chunked'"
            :chunk-size="2 * 1024 * 1024"
            :concurrency="3"
            :max-count="MAX_QUEUE_FILES"
            :max-size="page.currentScene.maxSize"
            :custom-request="page.customRequest"
            :show-file-list="false"
            :show-thumbnail="false"
            :tip="`单个文件不超过 ${fileSize(page.currentScene.maxSize)}，队列最多 ${MAX_QUEUE_FILES} 项`"
            @change="page.updateFiles"
            @exceed="page.onExceed"
        /></div>
        <div class="upload-list-heading"
          ><NSelect
            v-model:value="page.filter"
            size="small"
            :options="FILTER_OPTIONS"
            aria-label="队列状态"
          /><div class="workspace-actions"
            ><NButton
              size="tiny"
              :disabled="!page.successful"
              @click="page.clearCompleted"
              >清理已完成</NButton
            ><NButton
              size="tiny"
              :disabled="!page.files.length"
              @click="page.clearQueue"
              >清空队列</NButton
            ></div
          ></div
        >
        <div
          class="upload-queue"
          aria-live="polite"
          ><article
            v-for="file in page.visibleFiles"
            :key="file.uid"
            class="upload-row"
            ><span class="workspace-badge">{{
              file.name.split('.').at(-1)?.slice(0, 4).toUpperCase() || 'FILE'
            }}</span
            ><div class="upload-file"
              ><strong>{{ file.name }}</strong
              ><div
                ><small
                  >{{ fileSize(file.size) }} ·
                  {{ STATUS_LABELS[file.status] }}</small
                ><b>{{ Math.round(file.percent) }}%</b></div
              ><NProgress
                v-if="file.status !== 'success' && file.status !== 'instant'"
                type="line"
                :percentage="file.percent"
                :show-indicator="false"
                :status="file.status === 'error' ? 'error' : 'default'"
                :height="3"
              /><p v-if="file.error">{{ file.error }}</p></div
            ><div class="workspace-actions"
              ><NButton
                v-if="file.status === 'error'"
                size="tiny"
                @click="page.uploadRef?.retryFile(file.uid)"
                >重试</NButton
              ><NButton
                size="tiny"
                :aria-label="`移除 ${file.name}`"
                @click="page.uploadRef?.removeFile(file.uid)"
                >移除</NButton
              ></div
            ></article
          ><div
            v-if="!page.visibleFiles.length"
            class="workspace-empty"
            >{{
              page.files.length
                ? '当前筛选下没有文件'
                : '拖入文件，即可体验完整传输流程'
            }}</div
          ></div
        >
        <footer class="workspace-footer"
          ><span>文件与传输结果仅保留在当前页面</span
          ><span>暂停后继续；失败后重试</span></footer
        >
      </main></div
    >
  </div>
</template>
<script setup lang="ts">
  import {
    MAX_QUEUE_FILES,
    UPLOAD_SCENES,
    STATUS_LABELS,
    fileSize,
  } from './data'
  import { useUploadWorkspace } from './useUploadWorkspace'
  defineOptions({ name: 'Demo38Upload' })
  const controller = useUploadWorkspace()
  const page = proxyRefs(controller)
  const { uploadRef } = controller
  const FILTER_OPTIONS = [
    { label: '全部文件', value: 'all' },
    { label: '已完成', value: 'done' },
    { label: '传输中', value: 'uploading' },
    { label: '已暂停', value: 'paused' },
    { label: '失败项', value: 'error' },
  ]
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
