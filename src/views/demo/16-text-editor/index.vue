<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-16
 * @Description: 富文本编辑器场景，保留草稿与命令式内容操作
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->
<template>
  <div class="editor-demo-page">
    <c_vTitle
      title="富文本编辑器组件演示"
      icon="mdi:text-box-edit"
      description="基于 WangEditor 封装的 Vue3 富文本编辑器组件，支持主题切换、禁用/只读模式、内容获取等配置"
    />

    <div class="demo-content">
      <div class="control-panel">
        <NCard
          title="编辑器控制"
          class="control-card"
        >
          <template #header-extra>
            <i class="i-mdi-settings text-lg"></i>
          </template>

          <div class="control-section">
            <h3 class="section-title">
              <i class="i-mdi-play mr-1"></i>
              基础操作
            </h3>
            <div class="button-group">
              <NButton
                type="primary"
                @click="handleSetContent"
                :disabled="!isEditorReady"
              >
                <template #icon>
                  <i class="i-mdi-document"></i>
                </template>
                设置内容
              </NButton>

              <NButton
                type="info"
                @click="handleGetContent"
                :disabled="!isEditorReady"
              >
                <template #icon>
                  <i class="i-mdi-view-arrow-right-outline"></i>
                </template>
                获取内容
              </NButton>

              <NButton
                type="warning"
                @click="handleClearContent"
                :disabled="!isEditorReady"
              >
                <template #icon>
                  <i class="i-mdi-vacuum-cleaner-outline"></i>
                </template>
                清空内容
              </NButton>
            </div>
          </div>

          <div class="control-section">
            <h3 class="section-title">
              <i class="i-mdi-arrow-decision-outline mr-1"></i>
              状态控制
            </h3>
            <div class="switch-group">
              <div class="switch-item">
                <NSwitch
                  v-model:value="editorConfig.disabled"
                  :disabled="!isEditorReady"
                />
                <span class="switch-label">禁用编辑器</span>
              </div>

              <div class="switch-item">
                <NSwitch
                  v-model:value="editorConfig.readonly"
                  :disabled="!isEditorReady"
                />
                <span class="switch-label">只读模式</span>
              </div>
            </div>
          </div>
        </NCard>

        <NCard
          title="编辑器状态"
          class="status-card"
        >
          <template #header-extra>
            <i class="i-mdi-information text-lg"></i>
          </template>

          <div class="status-item">
            <span class="status-label">初始化状态:</span>
            <NTag :type="isEditorReady ? 'success' : 'warning'">
              <template #icon>
                <i
                  :class="
                    isEditorReady
                      ? 'mdi:check'
                      : 'i-mdi-clock-time-four-outline'
                  "
                ></i>
              </template>
              {{ isEditorReady ? '已就绪' : '初始化中' }}
            </NTag>
          </div>

          <div class="status-item">
            <span class="status-label">内容长度:</span>
            <NTag type="info"> {{ contentLength }} 字符 </NTag>
          </div>

          <div class="status-item">
            <span class="status-label">编辑器ID:</span>
            <NTag type="default">
              {{ editorId }}
            </NTag>
          </div>
        </NCard>
      </div>

      <div class="editor-area">
        <NCard
          title="富文本编辑器"
          class="editor-card"
        >
          <template #header-extra>
            <i class="i-mdi-edit-outline text-lg"></i>
          </template>

          <C_Editor
            ref="editorRef"
            :editor-id="editorId"
            v-model="editorContent"
            v-bind="editorConfig"
            @editor-mounted="handleEditorMounted"
            class="demo-editor"
            :class="{
              'demo-editor--disabled': editorConfig.disabled,
              'demo-editor--readonly': editorConfig.readonly,
            }"
          />
        </NCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTextEditorDemo } from './data'
  defineOptions({ name: 'Demo16TextEditor' })
  const {
    editorRef,
    editorId,
    editorContent,
    isEditorReady,
    editorConfig,
    contentLength,
    handleEditorMounted,
    handleSetContent,
    handleGetContent,
    handleClearContent,
  } = useTextEditorDemo()
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
