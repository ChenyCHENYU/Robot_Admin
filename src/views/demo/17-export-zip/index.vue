<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-23 10:28:14
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-23 14:16:39
 * @FilePath: \Robot_Admin\src\views\demo\17-export-zip\index.vue
 * @Description: 导出zip 场景示例
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="jszip-demo">
    <c_vTitle
      title="导出 Zip - [useJsZip] 场景示例"
      icon="mdi:folder-zip"
      description="JSZip Hooks 配置驱动的文件压缩导出工具，支持代码项目、数据报表、媒体资源、模板库等多种导出场景"
    />

    <!-- 全局进度 -->
    <NCard
      v-if="jszip.state.value.loading"
      class="progress-card"
    >
      <div class="flex items-center gap-4">
        <NSpin size="small" />
        <div class="flex-1">
          <div class="text-sm text-gray-600 mb-1">
            {{ jszip.state.value.currentFile || '准备中...' }}
          </div>
          <NProgress
            :percentage="jszip.state.value.progress"
            :show-indicator="false"
          />
        </div>
        <div class="text-lg font-bold">
          {{ Math.round(jszip.state.value.progress) }}%
        </div>
      </div>
    </NCard>

    <!-- 代码项目导出 -->
    <NCard
      title="📝 代码项目导出"
      class="section"
    >
      <div class="form-row">
        <NInput
          v-model:value="codeConfig.projectName"
          placeholder="项目名称"
        />
        <NSelect
          v-model:value="codeConfig.framework"
          :options="frameworkOptions"
          placeholder="框架"
        />
        <NCheckbox v-model:checked="codeConfig.includeConfig"
          >配置文件</NCheckbox
        >
        <NCheckbox v-model:checked="codeConfig.includeReadme">README</NCheckbox>
      </div>

      <NInput
        v-model:value="codeContent"
        type="textarea"
        placeholder="输入代码内容..."
        :rows="6"
        class="mt-4"
      />

      <div class="actions">
        <NButton
          type="primary"
          :loading="jszip.state.value.loading"
          @click="handleCodeExport"
        >
          <template #icon>
            <div class="i-mdi:download"></div>
          </template>
          导出项目
        </NButton>
      </div>
    </NCard>

    <!-- 数据报表导出 -->
    <NCard
      title="📊 数据报表导出"
      class="section"
    >
      <div class="form-row">
        <NInput
          v-model:value="reportConfig.title"
          placeholder="报表标题"
        />
        <NSelect
          v-model:value="reportConfig.format"
          :options="formatOptions"
          placeholder="格式"
        />
        <NDatePicker
          v-model:value="reportConfig.dateRange"
          type="daterange"
          clearable
        />
        <NCheckbox v-model:checked="reportConfig.includeSummary"
          >数据摘要</NCheckbox
        >
      </div>

      <div class="data-preview">
        <div class="preview-header">预览数据 ({{ mockData.length }} 条)</div>
        <div class="preview-grid">
          <div
            v-for="item in mockData.slice(0, 3)"
            :key="item.id"
            class="preview-row"
          >
            <span>{{ item.id }}</span>
            <span>{{ item.name }}</span>
            <span>{{ item.value }}</span>
            <span>{{ item.date }}</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <NButton
          type="success"
          :loading="jszip.state.value.loading"
          @click="handleReportExport"
        >
          <template #icon>
            <div class="i-mdi:table-arrow-down"></div>
          </template>
          导出报表
        </NButton>
      </div>
    </NCard>

    <!-- 媒体资源导出 -->
    <NCard
      title="🖼️ 媒体资源导出"
      class="section"
    >
      <div class="form-row">
        <NInput
          v-model:value="mediaConfig.packageName"
          placeholder="资源包名称"
        />
        <NInputNumber
          v-model:value="mediaConfig.maxFileSize"
          placeholder="最大文件(MB)"
          :min="1"
          :max="100"
        />
        <NCheckbox v-model:checked="mediaConfig.organizeByCategory"
          >按类别分组</NCheckbox
        >
        <NCheckbox v-model:checked="mediaConfig.includeMetadata"
          >包含元数据</NCheckbox
        >
      </div>

      <NUpload
        v-model:file-list="mediaFiles"
        multiple
        list-type="image-card"
        accept="image/*,video/*,audio/*"
        class="mt-4"
      >
        <NButton>
          <template #icon>
            <div class="i-mdi:upload"></div>
          </template>
          上传文件
        </NButton>
      </NUpload>

      <div class="actions">
        <NButton
          type="warning"
          :loading="jszip.state.value.loading"
          :disabled="!mediaFiles.length"
          @click="handleMediaExport"
        >
          <template #icon>
            <div class="i-mdi:image-multiple"></div>
          </template>
          导出媒体包 ({{ mediaFiles.length }})
        </NButton>
      </div>
    </NCard>

    <!-- 模板库导出 -->
    <NCard
      title="🚀 模板库导出"
      class="section"
    >
      <div class="form-row">
        <NInput
          v-model:value="templateConfig.libraryName"
          placeholder="模板库名称"
        />
        <NSelect
          v-model:value="templateConfig.bundleMode"
          :options="bundleModeOptions"
          placeholder="打包模式"
        />
        <NCheckbox v-model:checked="templateConfig.includeDocumentation"
          >包含文档</NCheckbox
        >
      </div>

      <div class="template-selection">
        <div class="selection-header">选择模板:</div>
        <div class="template-grid">
          <div
            v-for="template in availableTemplates"
            :key="template.id"
            class="template-card"
            :class="{ active: selectedTemplates.includes(template.id) }"
            @click="toggleTemplate(template.id)"
          >
            <div class="i-mdi:code-braces text-xl text-blue-500"></div>
            <div>
              <div class="font-semibold">{{ template.name }}</div>
              <div class="text-xs text-gray-500">{{ template.category }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <NButton
          type="info"
          :loading="jszip.state.value.loading"
          :disabled="!selectedTemplates.length"
          @click="handleTemplateExport"
        >
          <template #icon>
            <div class="i-mdi:package-down"></div>
          </template>
          导出模板库 ({{ selectedTemplates.length }})
        </NButton>
      </div>
    </NCard>

    <NMessageProvider />
  </div>
</template>

<script setup lang="ts">
  import {
    useJSZip,
    type CodeProjectConfig,
    type ReportConfig,
    type MediaConfig,
    type TemplateConfig,
  } from '@robot-admin/file-utils'
  import type { UploadFileInfo } from 'naive-ui/es/upload'
  import {
    type FrameworkType,
    type BundleModeType,
    type TemplateId,
    type MediaConfigExtended,
    type ReportConfigExtended,
    frameworkOptions,
    formatOptions,
    bundleModeOptions,
    availableTemplates,
    mockDataList,
    defaultCodeContent,
    getTemplateFiles,
    getFileCategory,
    isValidUploadFile,
  } from './data'

  const jszip = useJSZip()

  const codeConfig = ref<CodeProjectConfig>({
    projectName: 'my-awesome-app',
    framework: 'vue' as FrameworkType,
    includeConfig: true,
    includeReadme: true,
    files: [],
  })

  const reportConfig = ref<ReportConfigExtended>({
    title: 'sales-report',
    format: 'excel',
    dateRange: null,
    includeSummary: true,
  })

  const mediaConfig = ref<MediaConfigExtended>({
    packageName: 'media-resources',
    organizeByCategory: true,
    includeMetadata: true,
    maxFileSize: 10,
  })

  const templateConfig = ref<TemplateConfig>({
    libraryName: 'my-template-library',
    bundleMode: 'separate' as BundleModeType,
    includeDocumentation: true,
    templates: [],
  })

  const codeContent = ref(defaultCodeContent)
  const mockData = ref(mockDataList)
  const mediaFiles = ref<UploadFileInfo[]>([])
  const selectedTemplates = ref<TemplateId[]>([
    'vue-component',
    'typescript-utils',
  ])

  const toggleTemplate = (templateId: TemplateId) => {
    const index = selectedTemplates.value.indexOf(templateId)
    if (index > -1) {
      selectedTemplates.value.splice(index, 1)
    } else {
      selectedTemplates.value.push(templateId)
    }
  }

  const handleCodeExport = async () => {
    const files = [
      { path: 'App.vue', content: codeContent.value },
      {
        path: 'main.ts',
        content:
          "import { createApp } from 'vue'\nimport App from './App.vue'\n\ncreateApp(App).mount('#app')",
      },
    ]

    const config: CodeProjectConfig = {
      ...codeConfig.value,
      files,
    }

    await jszip.exportCodeProject(config)
  }

  const handleReportExport = async () => {
    const config: ReportConfig = {
      title: reportConfig.value.title,
      format: reportConfig.value.format,
      includeSummary: reportConfig.value.includeSummary,
      data: mockData.value,
    }

    await jszip.exportReport(config)
  }

  const handleMediaExport = async () => {
    const validFiles = mediaFiles.value.filter(isValidUploadFile)

    const files = validFiles.map(fileItem => ({
      name: fileItem.name,
      file: fileItem.file,
      category: getFileCategory(fileItem.file.type || ''),
    }))

    const config: MediaConfig = {
      packageName: mediaConfig.value.packageName,
      organizeByCategory: mediaConfig.value.organizeByCategory,
      includeMetadata: mediaConfig.value.includeMetadata,
      files,
    }

    await jszip.exportMedia(config)
  }

  const handleTemplateExport = async () => {
    const templates = availableTemplates
      .filter(t => selectedTemplates.value.includes(t.id))
      .map(t => ({
        id: t.id,
        name: t.name,
        files: getTemplateFiles(t.id),
      }))

    const config: TemplateConfig = {
      ...templateConfig.value,
      templates,
    }

    await jszip.exportTemplates(config)
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
