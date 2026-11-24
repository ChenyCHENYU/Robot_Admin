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
          @click="showAttachments = true"
          ><template #icon><span class="i-mdi-paperclip" /></template
          >查看附件清单</NButton
        ><NButton
          size="small"
          @click="page.showLink = true"
          >添加链接</NButton
        ><NButton
          size="small"
          type="primary"
          @click="page.fileRef?.click()"
          >添加本地文件</NButton
        ></div
      ></header
    >
    <div class="workspace-grid">
      <aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2
            >文件库
            <span class="workspace-hint"
              >{{ page.documents.length }} 项</span
            ></h2
          ><NInput
            v-model:value="page.search"
            size="small"
            clearable
            placeholder="搜索文件"
            :input-props="{ 'aria-label': '搜索文件' }"
          /><button
            v-for="item in page.filtered"
            :key="item.id"
            type="button"
            class="workspace-choice"
            :aria-pressed="page.selectedId === item.id"
            @click="page.selectedId = item.id"
            ><span class="workspace-badge">{{ item.kind }}</span
            ><span class="document-name"
              ><strong>{{ item.name }}</strong
              ><small>{{ item.note }}</small></span
            ></button
          ><p
            v-if="!page.filtered.length"
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
            v-if="page.documents.length"
            size="tiny"
            @click="page.clearDocuments"
            >清空文件库</NButton
          >
          <NButton
            size="tiny"
            @click="page.restoreSamples"
            >恢复示例文件</NButton
          >
        </section></aside
      >
      <main class="workspace-panel document-main"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{ page.selected?.name ?? '选择一份文档' }}</h2
            ><small>{{ page.selected?.note ?? '从左侧文件库开始' }}</small></div
          ><div
            v-if="page.selected"
            class="workspace-actions"
            ><NButton
              size="tiny"
              @click="page.revision++"
              >重新加载</NButton
            ><NButton
              size="tiny"
              @click="page.download"
              >下载原件</NButton
            ><NButton
              size="tiny"
              @click="page.removeSelected"
              >移出文件库</NButton
            ></div
          ></header
        ><div class="document-preview"
          ><PdfReader
            v-if="page.selected?.kind === 'PDF'"
            :key="`${page.selected.id}-${page.revision}`"
            :file="page.selected.file"
            :url="page.selected.url"
            :name="page.selected.name" /><C_FilePreview
            v-else
            inline
            :key="page.revision"
            :file="page.selected?.file"
            :url="page.selected?.url"
            :file-name="page.selected?.name" /></div
        ><footer class="workspace-footer"
          ><span>{{ page.selected?.kind ?? '文档' }} 预览</span
          ><span>远程链接需允许跨域访问；PDF 在本机渲染</span></footer
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
      @change="page.onFiles"
    />
    <NModal
      v-model:show="showAttachments"
      preset="card"
      title="项目附件"
      class="document-attachments"
    >
      <C_Attachments
        v-if="showAttachments"
        :items="attachmentItems"
        title="资料清单"
        downloadable
        @download="page.downloadFile"
      />
    </NModal>
    <NModal
      v-model:show="page.showLink"
      preset="card"
      title="添加文档链接"
      :style="{ width: 'min(480px,calc(100vw - 32px))' }"
      ><NInput
        v-model:value="page.link"
        placeholder="https://…/document.pdf"
        :input-props="{ 'aria-label': '文档链接' }"
        @keyup.enter="page.addLink"
      /><p class="workspace-hint">支持 PDF、DOCX、XLSX 与 XLS 链接。</p
      ><template #footer
        ><div class="workspace-actions"
          ><NButton
            size="small"
            @click="page.showLink = false"
            >取消</NButton
          ><NButton
            size="small"
            type="primary"
            @click="page.addLink"
            >添加到文件库</NButton
          ></div
        ></template
      ></NModal
    >
  </div>
</template>
<script setup lang="ts">
  import { SUPPLEMENTAL_ATTACHMENTS } from './data'
  import { useDocumentWorkspace } from './useDocumentWorkspace'

  const PdfReader = defineAsyncComponent(
    () => import('./components/PdfReader/index.vue')
  )
  defineOptions({ name: 'Demo32FilePreview' })
  const showAttachments = ref(false)
  const controller = useDocumentWorkspace()
  const page = proxyRefs(controller)
  const { fileRef } = controller
  const attachmentItems = computed(() => [
    ...controller.documents.value.map(item => ({
      ...item,
      category: '文档',
      description: item.note,
    })),
    ...SUPPLEMENTAL_ATTACHMENTS,
  ])
  onDeactivated(() => {
    showAttachments.value = false
  })
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
