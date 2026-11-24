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
        :disabled="exportBusy"
        @click="activeExport = item.id"
        ><span :class="item.icon" /><span
          ><strong>{{ item.name }}</strong
          ><small>{{ item.note }}</small></span
        ></button
      ></nav
    >
    <!-- 全局进度 -->
    <NCard
      v-if="exportBusy"
      class="progress-card"
    >
      <div class="flex items-center gap-4">
        <NSpin size="small" />
        <div class="flex-1">
          <div class="text-sm text-gray-600 mb-1">
            {{ exportState.currentFile || '准备中...' }}
          </div>
          <NProgress
            :percentage="exportState.progress"
            :show-indicator="false"
          />
        </div>
        <div class="text-lg font-bold">
          {{ Math.round(exportState.progress) }}%
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
              :loading="exportBusy"
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
              :loading="exportBusy"
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

          <NAlert
            v-if="mediaPlan.error"
            type="warning"
          >
            {{ mediaPlan.error }}
          </NAlert>
          <div class="actions">
            <NButton
              type="warning"
              :loading="exportBusy"
              :disabled="!mediaExport.files.length || Boolean(mediaPlan.error)"
              @click="handleMediaExport"
            >
              <template #icon>
                <div class="i-mdi-image-multiple"></div>
              </template>
              导出媒体包 ({{ mediaExport.files.length }})
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

          <NAlert
            v-if="templatePlan.error"
            type="error"
          >
            {{ templatePlan.error }}
          </NAlert>
          <div class="actions">
            <NButton
              type="info"
              :loading="exportBusy"
              :disabled="
                !selectedTemplates.length || Boolean(templatePlan.error)
              "
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
        ><span class="file-output__icon i-mdi-folder-zip-outline" /><h3>{{
          outputName
        }}</h3
        ><small>{{ outputFiles.length }} 个文件 · 按当前配置生成</small
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
    planMediaArchive,
    sanitizeFileName,
    sanitizeZipPath,
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
    createTemplateArchiveEntries,
    getFileCategory,
    isValidUploadFile,
  } from './data'

  setupFileUtils()

  const jszip = useJSZip()
  const message = useMessage()
  const activeTemplateZip = shallowRef<ReturnType<typeof useJSZip>>()
  const exportState = computed(
    () => activeTemplateZip.value?.state.value ?? jszip.state.value
  )
  const exportBusy = computed(
    () => Boolean(activeTemplateZip.value) || exportState.value.loading
  )
  const activeExport = ref<(typeof EXPORT_SCENARIOS)[number]['id']>('code')

  const codeConfig = ref<Omit<CodeProjectConfig, 'files'>>({
    projectName: 'my-awesome-app',
    framework: 'vue' as FrameworkType,
    includeConfig: true,
    includeReadme: true,
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

  const templateConfig = ref<Omit<TemplateConfig, 'templates'>>({
    libraryName: 'my-template-library',
    bundleMode: 'separate' as BundleModeType,
    includeDocumentation: true,
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
  const mediaExport = computed<MediaConfig>(() => {
    const { packageName, organizeByCategory, includeMetadata } =
      mediaConfig.value
    return {
      packageName,
      organizeByCategory,
      includeMetadata,
      files: mediaFiles.value
        .filter(isValidUploadFile)
        .map(({ name, file }) => ({
          name,
          file,
          category: getFileCategory(file.type),
        })),
    }
  })
  const mediaPlan = computed(() => {
    const limit = mediaConfig.value.maxFileSize
    if (
      mediaExport.value.files.some(
        ({ file }) => file.size > limit * 1024 * 1024
      )
    ) {
      return { files: [], error: `单个文件不能超过 ${limit} MB` }
    }
    try {
      return { files: planMediaArchive(mediaExport.value), error: '' }
    } catch (error) {
      return {
        files: [],
        error: error instanceof Error ? error.message : '无法生成媒体清单',
      }
    }
  })
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

  const templatePlan = computed(() => {
    try {
      return {
        entries: createTemplateArchiveEntries(
          templateConfig.value,
          selectedTemplates.value
        ),
        error: '',
      }
    } catch (error) {
      return {
        entries: null,
        error: error instanceof Error ? error.message : '无法生成模板清单',
      }
    }
  })
  const outputName = computed(() =>
    sanitizeFileName(
      {
        code: `${codeConfig.value.projectName}.zip`,
        report: `${reportConfig.value.title}_report.zip`,
        media: `${mediaConfig.value.packageName}.zip`,
        template: `${templateConfig.value.libraryName}_templates.zip`,
      }[activeExport.value]
    )
  )
  const codeFiles = computed<CodeProjectConfig['files']>(() => {
    const entry = CODE_ENTRIES[codeConfig.value.framework ?? 'vue']
    return [
      { path: entry.file, content: codeContent.value },
      ...(entry.entry
        ? [{ path: entry.entry, content: entry.entryContent ?? '' }]
        : []),
    ]
  })
  const outputFiles = computed(() => {
    if (activeExport.value === 'code')
      return [
        ...codeFiles.value.map(({ path }) => `src/${sanitizeZipPath(path)}`),
        ...(codeConfig.value.includeConfig ? ['package.json'] : []),
        ...(codeConfig.value.includeReadme ? ['README.md'] : []),
      ]
    if (activeExport.value === 'report')
      return [
        `${reportConfig.value.title}.${reportConfig.value.format === 'excel' ? 'xlsx' : reportConfig.value.format}`,
        ...(reportConfig.value.includeSummary ? ['summary.json'] : []),
      ]
    if (activeExport.value === 'media') return mediaPlan.value.files
    return [...(templatePlan.value.entries?.keys() ?? [])]
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

  const handleCodeExport = () =>
    safelyExport(() =>
      jszip.exportCodeProject({ ...codeConfig.value, files: codeFiles.value })
    )

  const handleReportExport = async () => {
    const config: ReportConfig = {
      title: reportConfig.value.title,
      format: reportConfig.value.format,
      includeSummary: reportConfig.value.includeSummary,
      data: reportRows.value,
    }

    await safelyExport(() => jszip.exportReport(config))
  }

  const handleMediaExport = () =>
    safelyExport(() => jszip.exportMedia(mediaExport.value))

  const handleTemplateExport = async () => {
    const { entries } = templatePlan.value
    if (exportBusy.value || !entries || !selectedTemplates.value.length) return

    const exporter = useJSZip()
    activeTemplateZip.value = exporter
    try {
      const zip = exporter.createZip()
      for (const [path, content] of entries)
        exporter.addFile(zip, path, content)
      await exporter.downloadZip(zip, outputName.value)
      message.success('模板库导出成功')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '模板库导出失败')
    } finally {
      activeTemplateZip.value = undefined
    }
  }
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
