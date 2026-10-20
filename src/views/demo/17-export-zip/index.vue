<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-23 10:28:14
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-09-02
 * @FilePath: \Robot_Admin\src\views\demo\17-export-zip\index.vue
 * @Description: 导出zip 场景示例
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="plugin-workspace jszip-demo">
    <header class="workspace-heading"
      ><div
        ><small>ARCHIVE BUILDER</small><h1>ZIP 打包工作台</h1
        ><p>选择内容、核对清单，再生成一份清晰的交付包。</p></div
      ><NTag
        size="small"
        :bordered="false"
        >本机生成 · 文件不会上传</NTag
      ></header
    >
    <nav
      class="file-tool-tabs"
      aria-label="打包场景"
      ><button
        v-for="item in EXPORT_SCENARIOS"
        :key="item.id"
        type="button"
        :aria-pressed="activeExport === item.id"
        :disabled="jszip.state.value.loading"
        @click="activeExport = item.id"
        ><span :class="item.icon" /><span
          ><strong>{{ item.name }}</strong
          ><small>{{ item.note }}</small></span
        ></button
      ></nav
    >
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

    <div class="file-tool-layout"
      ><div class="file-tool-main">
        <!-- 代码项目导出 -->
        <NCard
          v-show="activeExport === 'code'"
          title="代码项目"
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
            <NCheckbox v-model:checked="codeConfig.includeReadme"
              >README</NCheckbox
            >
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
                <div class="i-mdi-download"></div>
              </template>
              导出项目
            </NButton>
          </div>
        </NCard>

        <!-- 数据报表导出 -->
        <NCard
          v-show="activeExport === 'report'"
          title="数据报表"
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
            <div class="preview-header"
              >预览数据 ({{ reportRows.length }} 条)</div
            >
            <div class="preview-grid">
              <div
                v-for="item in reportRows.slice(0, 3)"
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
                <div class="i-mdi-table-arrow-down"></div>
              </template>
              导出报表
            </NButton>
          </div>
        </NCard>

        <!-- 媒体资源导出 -->
        <NCard
          v-show="activeExport === 'media'"
          title="媒体资源"
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
            :default-upload="false"
            multiple
            list-type="image-card"
            accept="image/*,video/*,audio/*"
            class="mt-4"
          >
            <NButton>
              <template #icon>
                <div class="i-mdi-upload"></div>
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
                <div class="i-mdi-image-multiple"></div>
              </template>
              导出媒体包 ({{ mediaFiles.length }})
            </NButton>
          </div>
        </NCard>

        <!-- 模板库导出 -->
        <NCard
          v-show="activeExport === 'template'"
          title="模板库"
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
              <button
                type="button"
                v-for="template in availableTemplates"
                :key="template.id"
                class="template-card"
                :class="{ active: selectedTemplates.includes(template.id) }"
                :aria-pressed="selectedTemplates.includes(template.id)"
                @click="toggleTemplate(template.id)"
              >
                <div class="i-mdi-code-braces text-xl text-blue-500"></div>
                <div>
                  <div class="font-semibold">{{ template.name }}</div>
                  <div class="text-xs text-gray-500">{{
                    template.category
                  }}</div>
                </div>
              </button>
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
                <div class="i-mdi-package-down"></div>
              </template>
              导出模板库 ({{ selectedTemplates.length }})
            </NButton>
          </div>
        </NCard> </div
      ><aside class="file-output"
        ><h2>即将生成</h2
        ><span class="file-output__icon i-mdi-folder-zip-outline" /><h3
          >{{ outputName }}.zip</h3
        ><small>{{ outputFiles.length }} 项内容 · 按当前配置生成</small
        ><ul
          ><li
            v-for="file in outputFiles"
            :key="file"
            ><span class="i-mdi:file-document-outline" />{{ file }}</li
          ><li v-if="!outputFiles.length"
            >添加文件或选择模板后即可打包。</li
          ></ul
        ><p
          >导出会生成真实 ZIP
          文件，浏览器下载记录中可找到。报表数据为内置示例。</p
        ></aside
      ></div
    >
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Demo17ExportZip' })
  import { setupFileUtils } from '@/plugins/file-utils'
  import {
    useJSZip,
    type CodeProjectConfig,
    type ReportConfig,
    type MediaConfig,
    type TemplateConfig,
  } from '@robot-admin/file-utils'

  import type { UploadFileInfo } from 'naive-ui/es/upload'
  import {
    EXPORT_SCENARIOS,
    CODE_ENTRIES,
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

  setupFileUtils()

  const jszip = useJSZip()
  const message = useMessage()
  const activeExport = ref('code')

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
  const codeDrafts: Partial<Record<FrameworkType, string>> = {}
  watch(
    () => codeConfig.value.framework,
    (value, previous) => {
      if (previous) codeDrafts[previous] = codeContent.value
      codeContent.value =
        codeDrafts[value ?? 'vue'] ?? CODE_ENTRIES[value ?? 'vue'].sample
    }
  )
  const mockData = ref(mockDataList)
  const mediaFiles = ref<UploadFileInfo[]>([])
  const selectedTemplates = ref<TemplateId[]>([
    'vue-component',
    'typescript-utils',
  ])

  const reportRows = computed(() => {
    const range = reportConfig.value.dateRange
    return range
      ? mockData.value.filter(item => {
          const time = new Date(`${item.date}T00:00:00`).getTime()
          return time >= range[0] && time <= range[1] + 86_399_999
        })
      : mockData.value
  })
  const outputName = computed(
    () =>
      ({
        code: codeConfig.value.projectName,
        report: `${reportConfig.value.title}_report`,
        media: mediaConfig.value.packageName,
        template: templateConfig.value.libraryName,
      })[activeExport.value] ?? 'archive'
  )
  const codeOutputFiles = computed(() => {
    const entry = CODE_ENTRIES[codeConfig.value.framework ?? 'vue']
    return [
      `src/${entry.file}`,
      ...(entry.entry ? [`src/${entry.entry}`] : []),
      ...(codeConfig.value.includeConfig ? ['package.json'] : []),
      ...(codeConfig.value.includeReadme ? ['README.md'] : []),
    ]
  })
  const outputFiles = computed(() => {
    if (activeExport.value === 'code') return codeOutputFiles.value
    if (activeExport.value === 'report')
      return [
        `${reportConfig.value.title}.${reportConfig.value.format === 'excel' ? 'xlsx' : reportConfig.value.format}`,
        ...(reportConfig.value.includeSummary ? ['summary.json'] : []),
      ]
    if (activeExport.value === 'media')
      return mediaFiles.value.map(item => item.name)
    return availableTemplates
      .filter(item => selectedTemplates.value.includes(item.id))
      .flatMap(item =>
        Object.keys(getTemplateFiles(item.id)).map(
          file => `${item.name}/${file}`
        )
      )
  })
  /**
   * * @description: 执行 ZIP 导出并消费 file-utils 已通知过的异常，避免事件处理器产生未处理拒绝
   */
  const safelyExport = async (task: () => Promise<unknown>) => {
    try {
      await task()
    } catch {
      // file-utils 已更新导出状态并显示错误消息；页面只需消费异常。
    }
  }

  const toggleTemplate = (templateId: TemplateId) => {
    const index = selectedTemplates.value.indexOf(templateId)
    if (index > -1) {
      selectedTemplates.value.splice(index, 1)
    } else {
      selectedTemplates.value.push(templateId)
    }
  }

  const handleCodeExport = async () => {
    const source = CODE_ENTRIES[codeConfig.value.framework ?? 'vue']
    const files = [
      { path: source.file, content: codeContent.value },
      ...(source.entry
        ? [{ path: source.entry, content: source.entryContent ?? '' }]
        : []),
    ]

    const config: CodeProjectConfig = {
      ...codeConfig.value,
      files,
    }

    await safelyExport(() => jszip.exportCodeProject(config))
  }

  const handleReportExport = async () => {
    const config: ReportConfig = {
      title: reportConfig.value.title,
      format: reportConfig.value.format,
      includeSummary: reportConfig.value.includeSummary,
      data: reportRows.value,
    }

    await safelyExport(() => jszip.exportReport(config))
  }

  const handleMediaExport = async () => {
    const validFiles = mediaFiles.value.filter(isValidUploadFile)
    if (
      validFiles.some(
        item => item.file.size > mediaConfig.value.maxFileSize * 1024 * 1024
      )
    ) {
      message.warning(`单个文件不能超过 ${mediaConfig.value.maxFileSize} MB`)
      return
    }

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

    await safelyExport(() => jszip.exportMedia(config))
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

    await safelyExport(() => jszip.exportTemplates(config))
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
