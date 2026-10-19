<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 文档工作台，选择文件后直接进入预览与阅读
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace document-workspace">
    <header class="workspace-heading"
      ><div
        ><small>DOCUMENT LIBRARY</small><h1>文件预览工作台</h1
        ><p>从文件列表开始，集中阅读文档、表格与 PDF。</p></div
      ><div class="workspace-actions"
        ><NButton
          size="small"
          @click="showLink = true"
          >添加链接</NButton
        ><NButton
          size="small"
          type="primary"
          @click="fileRef?.click()"
          >添加本地文件</NButton
        ></div
      ></header
    >
    <div class="workspace-grid">
      <aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2
            >文件库
            <span class="workspace-hint">{{ documents.length }} 项</span></h2
          ><NInput
            v-model:value="search"
            size="small"
            clearable
            placeholder="搜索文件"
            :input-props="{ 'aria-label': '搜索文件' }"
          /><button
            v-for="item in filtered"
            :key="item.id"
            type="button"
            class="workspace-choice"
            :aria-pressed="selectedId === item.id"
            @click="selectedId = item.id"
            ><span class="workspace-badge">{{ item.kind }}</span
            ><span class="document-name"
              ><strong>{{ item.name }}</strong
              ><small>{{ item.note }}</small></span
            ></button
          ><p
            v-if="!filtered.length"
            class="workspace-hint"
            >没有匹配的文件</p
          ></section
        ><section class="workspace-section"
          ><h2>开箱即可阅读</h2
          ><p
            >内置三份本地示例。添加的文件仅在当前页面会话保留，刷新后会恢复示例文件库。</p
          ><span class="workspace-hint"
            >支持 PDF / DOCX / XLSX / XLS · 单个 ≤ 30 MB</span
          ></section
        ><section class="workspace-section workspace-actions">
          <NButton
            v-if="documents.length"
            size="tiny"
            @click="clearDocuments"
            >清空文件库</NButton
          >
          <NButton
            size="tiny"
            @click="restoreSamples"
            >恢复示例文件</NButton
          >
        </section></aside
      >
      <main class="workspace-panel document-main"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{ selected?.name ?? '选择一份文档' }}</h2
            ><small>{{ selected?.note ?? '从左侧文件库开始' }}</small></div
          ><div
            v-if="selected"
            class="workspace-actions"
            ><NButton
              size="tiny"
              @click="revision++"
              >重新加载</NButton
            ><NButton
              size="tiny"
              @click="download"
              >下载原件</NButton
            ><NButton
              size="tiny"
              @click="removeSelected"
              >移出文件库</NButton
            ></div
          ></header
        ><div class="document-preview"
          ><C_FilePreview
            inline
            :key="revision"
            :file="selected?.file"
            :url="selected?.url"
            :file-name="selected?.name" /></div
        ><footer class="workspace-footer"
          ><span>{{ selected?.kind ?? '文档' }} 预览</span
          ><span>远程链接需允许跨域访问；PDF 使用浏览器阅读器</span></footer
        ></main
      >
    </div>
    <input
      ref="fileRef"
      class="document-file"
      type="file"
      multiple
      accept=".pdf,.docx,.xlsx,.xls"
      aria-label="选择预览文件"
      @change="onFiles"
    />
    <NModal
      v-model:show="showLink"
      preset="card"
      title="添加文档链接"
      :style="{ width: 'min(480px,calc(100vw - 32px))' }"
      ><NInput
        v-model:value="link"
        placeholder="https://…/document.pdf"
        :input-props="{ 'aria-label': '文档链接' }"
        @keyup.enter="addLink"
      /><p class="workspace-hint">支持 PDF、DOCX、XLSX 与 XLS 链接。</p
      ><template #footer
        ><div class="workspace-actions"
          ><NButton
            size="small"
            @click="showLink = false"
            >取消</NButton
          ><NButton
            size="small"
            type="primary"
            @click="addLink"
            >添加到文件库</NButton
          ></div
        ></template
      ></NModal
    >
  </div>
</template>
<script setup lang="ts">
  import { useDocumentWorkspace } from './useDocumentWorkspace'
  defineOptions({ name: 'Demo32FilePreview' })
  const {
    documents,
    selectedId,
    search,
    fileRef,
    showLink,
    link,
    revision,
    selected,
    filtered,
    onFiles,
    addLink,
    removeSelected,
    clearDocuments,
    restoreSamples,
    download,
  } = useDocumentWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
