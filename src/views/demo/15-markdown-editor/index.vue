<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: Markdown 文档工作台，文档切换、阅读模式与本机保存
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="plugin-workspace markdown-demo-page"
    ><header class="workspace-heading"
      ><div
        ><small>WRITING WORKSPACE</small><h1>Markdown 文档工作台</h1
        ><p>从笔记到发布说明，让编辑、阅读和留存形成连续流程。</p></div
      ><div class="workspace-actions"
        ><NButton
          size="small"
          @click="fileRef?.click()"
          >导入到当前文档</NButton
        ><NButton
          size="small"
          :disabled="!content"
          @click="exportFile"
          >导出 Markdown</NButton
        ><NButton
          size="small"
          type="primary"
          @click="save(true)"
          >保存到本机</NButton
        ></div
      ></header
    >
    <div class="workspace-grid"
      ><aside class="workspace-panel"
        ><section class="workspace-section"
          ><h2>文档</h2
          ><button
            v-for="item in WORKSPACE_DOCUMENTS"
            :key="item.id"
            type="button"
            class="workspace-choice"
            :aria-pressed="selectedId === item.id"
            @click="selectedId = item.id"
            ><span class="workspace-badge">MD</span
            ><span
              ><strong>{{ item.name }}</strong
              ><small>{{ drafts[item.id].length }} 字符</small></span
            ></button
          ></section
        ><section class="workspace-section"
          ><h2>草稿与留存</h2
          ><NCheckbox v-model:checked="autoSave">自动保存到本机</NCheckbox
          ><p
            >每份文档单独保留修改。保存使用当前浏览器，跨设备分享请导出 Markdown
            文件。</p
          ><NButton
            size="tiny"
            @click="restore"
            >恢复当前示例</NButton
          ></section
        ></aside
      >
      <main class="workspace-panel"
        ><header class="workspace-toolbar"
          ><div
            ><h2>{{ current.name }}</h2
            ><small
              >{{ content.split('\n').length }} 行 ·
              {{ content.length }} 字符</small
            ></div
          ><NRadioGroup
            v-model:value="mode"
            size="small"
            ><NRadioButton value="edit">专注编辑</NRadioButton
            ><NRadioButton value="editable">编辑与预览</NRadioButton
            ><NRadioButton value="preview">阅读</NRadioButton></NRadioGroup
          ></header
        ><div class="markdown-stage"
          ><C_Markdown
            v-model="content"
            editor-id="robot-document-workspace"
            :mode="mode"
            height="640px"
            :is-dark="themeStore.isDark"
            :auto-save="false"
            :max-length="100000"
            :show-word-count="true"
            @save="() => save(true)" /></div
        ><footer class="workspace-footer"
          ><span>{{ dirty ? '有尚未保存的修改' : savedState }}</span
          ><span>支持同步预览与全屏 · 文本不超过 100000 字符</span></footer
        ></main
      ></div
    ><input
      ref="fileRef"
      type="file"
      accept=".md,.markdown,.txt"
      class="markdown-file"
      aria-label="选择 Markdown 文件"
      @change="importFile"
    />
  </div>
</template>
<script setup lang="ts">
  import { s_themeStore } from '@/stores/theme'
  import { useMarkdownWorkspace } from './useMarkdownWorkspace'
  defineOptions({ name: 'Demo15MarkdownEditor' })
  const themeStore = s_themeStore()
  const {
    WORKSPACE_DOCUMENTS,
    drafts,
    selectedId,
    mode,
    autoSave,
    fileRef,
    savedState,
    current,
    content,
    dirty,
    save,
    exportFile,
    importFile,
    restore,
  } = useMarkdownWorkspace()
</script>
<style lang="scss" scoped>
  @use './index.scss';
</style>
