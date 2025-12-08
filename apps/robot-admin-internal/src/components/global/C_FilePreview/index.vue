<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-27 19:27:14
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-27 22:37:33
 * @FilePath: \Robot_Admin\src\components\global\C_FilePreview\index.vue
 * @Description: 文件预览组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-file-preview-wrapper">
    <!-- 文件信息卡片模式 -->
    <div
      v-if="!autoPreview"
      class="file-info-card"
    >
      <div class="file-info">
        <div class="file-icon">
          <C_Icon
            :name="fileConfig.icon"
            :size="40"
            :color="fileConfig.color"
          />
        </div>

        <div class="file-details">
          <div class="file-name">
            <NEllipsis style="max-width: 250px">{{
              displayFileName
            }}</NEllipsis>
            <NTag
              :type="fileConfig.tagType"
              size="small"
            >
              {{ fileType.toUpperCase() }}
            </NTag>
          </div>

          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(fileSize) }}</span>
          </div>
        </div>

        <div class="file-actions">
          <NButton
            type="primary"
            @click="openPreview"
          >
            <template #icon>
              <C_Icon name="ic:outline-visibility" />
            </template>
            预览
          </NButton>

          <NButton
            type="tertiary"
            @click="downloadFile"
          >
            <template #icon>
              <C_Icon name="ic:outline-download" />
            </template>
            下载
          </NButton>
        </div>
      </div>
    </div>

    <!-- 模态框预览 -->
    <NModal
      v-model:show="showModal"
      :mask-closable="false"
      :closable="false"
      :auto-focus="false"
      transform-origin="center"
      style="
        width: 85vw;
        max-width: 1200px;
        min-width: 800px;
        height: 75vh;
        max-height: 700px;
        min-height: 500px;
      "
    >
      <div
        class="modal-container"
        ref="modalContainer"
      >
        <!-- 自定义头部 -->
        <div class="modal-header">
          <div class="modal-title">
            <C_Icon
              :name="fileConfig.icon"
              :size="20"
              :color="fileConfig.color"
            />
            <span>{{ displayFileName }}</span>
          </div>
          <div class="modal-actions">
            <NButton
              size="small"
              type="tertiary"
              @click="downloadFile"
            >
              <template #icon>
                <C_Icon name="ic:outline-download" />
              </template>
              下载
            </NButton>
            <NButton
              size="small"
              type="tertiary"
              @click="showModal = false"
            >
              <template #icon>
                <C_Icon name="ic:outline-close" />
              </template>
            </NButton>
          </div>
        </div>

        <!-- 预览内容 -->
        <div class="modal-content">
          <!-- 文件信息头部 -->
          <div class="preview-header">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <NTag
                  :type="fileConfig.tagType"
                  size="small"
                >
                  <template #icon>
                    <C_Icon :name="fileConfig.icon" />
                  </template>
                  {{ fileType.toUpperCase() }}
                </NTag>
                <NEllipsis style="max-width: 300px">{{
                  displayFileName
                }}</NEllipsis>
                <span class="text-sm text-gray-500">{{
                  formatFileSize(fileSize)
                }}</span>
              </div>

              <div class="flex gap-2">
                <NButton
                  size="small"
                  type="tertiary"
                  @click="loadFile"
                  :disabled="loading"
                >
                  <template #icon>
                    <C_Icon name="ic:outline-refresh" />
                  </template>
                  刷新
                </NButton>
                <NButton
                  size="small"
                  type="primary"
                  @click="toggleFullscreen"
                >
                  <template #icon>
                    <C_Icon
                      :name="
                        isFullscreen
                          ? 'ic:outline-fullscreen-exit'
                          : 'ic:outline-fullscreen'
                      "
                    />
                  </template>
                  {{ isFullscreen ? '退出全屏' : '全屏' }}
                </NButton>
              </div>
            </div>
          </div>

          <!-- 预览内容区域 -->
          <div class="preview-content">
            <!-- 加载和错误状态 -->
            <template v-if="loading || error">
              <div class="status-container">
                <NSpin
                  v-if="loading"
                  size="large"
                >
                  <template #description
                    >正在加载{{ fileType.toUpperCase() }}文件...</template
                  >
                </NSpin>
                <NResult
                  v-else
                  status="error"
                  title="预览失败"
                  :description="error"
                >
                  <template #footer>
                    <NButton @click="loadFile">重试</NButton>
                  </template>
                </NResult>
              </div>
            </template>

            <!-- 文件预览内容 -->
            <template v-else>
              <!-- PDF预览 -->
              <div
                v-if="fileType === 'pdf'"
                class="file-container"
              >
                <div class="file-toolbar">
                  <div class="flex justify-between items-center">
                    <div class="flex gap-2 items-center">
                      <NButton
                        size="small"
                        @click="changePage('prev')"
                        :disabled="currentPage <= 1"
                      >
                        <template #icon
                          ><C_Icon name="ic:outline-chevron-left"
                        /></template>
                      </NButton>
                      <NInputNumber
                        v-model:value="currentPage"
                        size="small"
                        :min="1"
                        :max="totalPages"
                        @update:value="changePage"
                        style="width: 80px"
                      />
                      <span class="text-sm text-gray-600"
                        >/ {{ totalPages }}</span
                      >
                      <NButton
                        size="small"
                        @click="changePage('next')"
                        :disabled="currentPage >= totalPages"
                      >
                        <template #icon
                          ><C_Icon name="ic:outline-chevron-right"
                        /></template>
                      </NButton>
                    </div>

                    <div class="flex gap-2 items-center">
                      <NButton
                        size="small"
                        @click="adjustZoom('out')"
                        :disabled="scale <= 0.5"
                      >
                        <template #icon
                          ><C_Icon name="ic:outline-zoom-out"
                        /></template>
                      </NButton>
                      <span class="text-sm text-gray-600 min-w-12 text-center"
                        >{{ Math.round(scale * 100) }}%</span
                      >
                      <NButton
                        size="small"
                        @click="adjustZoom('in')"
                        :disabled="scale >= 3"
                      >
                        <template #icon
                          ><C_Icon name="ic:outline-zoom-in"
                        /></template>
                      </NButton>
                      <NButton
                        size="small"
                        @click="adjustZoom('reset')"
                      >
                        <template #icon
                          ><C_Icon name="ic:outline-fit-screen"
                        /></template>
                        适应
                      </NButton>
                    </div>
                  </div>
                </div>
                <div class="file-viewer">
                  <iframe
                    v-if="pdfUrl"
                    :src="pdfUrl"
                    class="w-full h-full border-0"
                    title="PDF预览"
                    frameborder="0"
                    allowfullscreen
                    @load="() => console.log('PDF加载成功')"
                    @error="
                      () =>
                        setError(
                          'PDF文件无法显示，可能是文件损坏或浏览器不支持'
                        )
                    "
                  />
                </div>
              </div>

              <!-- Word预览 -->
              <div
                v-else-if="fileType === 'word'"
                class="file-container"
              >
                <div class="file-toolbar">
                  <div class="flex gap-2 items-center">
                    <NButton
                      size="small"
                      @click="showOutline = !showOutline"
                    >
                      <template #icon
                        ><C_Icon name="ic:outline-list"
                      /></template>
                      {{ showOutline ? '隐藏' : '显示' }}目录
                    </NButton>
                    <NDivider vertical />
                    <NButton
                      size="small"
                      @click="adjustWordZoom('out')"
                      :disabled="wordZoom <= 50"
                    >
                      <template #icon
                        ><C_Icon name="ic:outline-zoom-out"
                      /></template>
                    </NButton>
                    <span class="text-sm text-gray-600 min-w-12 text-center"
                      >{{ wordZoom }}%</span
                    >
                    <NButton
                      size="small"
                      @click="adjustWordZoom('in')"
                      :disabled="wordZoom >= 200"
                    >
                      <template #icon
                        ><C_Icon name="ic:outline-zoom-in"
                      /></template>
                    </NButton>
                    <NButton
                      size="small"
                      @click="adjustWordZoom('reset')"
                    >
                      <template #icon
                        ><C_Icon name="ic:outline-fit-screen"
                      /></template>
                      重置
                    </NButton>
                  </div>
                </div>

                <div class="word-layout">
                  <div class="word-main">
                    <!-- 侧边栏目录 -->
                    <div
                      v-if="showOutline"
                      class="word-outline"
                    >
                      <div class="outline-header">
                        <h3 class="text-sm font-semibold">文档目录</h3>
                      </div>
                      <div class="outline-content">
                        <div
                          v-for="(heading, index) in headings"
                          :key="index"
                          class="outline-item"
                          :class="`level-${heading.level}`"
                          @click="scrollToHeading(heading.id)"
                        >
                          {{ heading.text }}
                        </div>
                      </div>
                    </div>

                    <!-- 主要内容区域 -->
                    <div class="word-content">
                      <div
                        class="word-document"
                        :style="{
                          transform: `scale(${wordZoom / 100})`,
                          transformOrigin: 'top center',
                        }"
                        v-html="wordContent"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Excel预览 -->
              <div
                v-else-if="fileType === 'excel'"
                class="file-container excel-container"
              >
                <!-- Excel工具栏 -->
                <div class="file-toolbar">
                  <div class="flex justify-between items-center">
                    <div class="flex gap-2 items-center">
                      <NTabs
                        v-if="excelSheets.length > 1"
                        v-model:value="activeSheet"
                        type="card"
                        size="small"
                      >
                        <NTabPane
                          v-for="sheet in excelSheets"
                          :key="sheet.name"
                          :name="sheet.name"
                          :tab="sheet.name"
                        />
                      </NTabs>
                      <span
                        v-else
                        class="text-sm text-gray-600"
                        >工作表: {{ activeSheet }}</span
                      >
                    </div>

                    <div class="flex gap-2 items-center">
                      <NButton
                        size="small"
                        @click="showExcelFormat = !showExcelFormat"
                      >
                        <template #icon
                          ><C_Icon name="ic:outline-format-paint"
                        /></template>
                        {{ showExcelFormat ? '紧凑视图' : '完整格式' }}
                      </NButton>
                    </div>
                  </div>
                </div>

                <div class="excel-viewer">
                  <!-- Excel信息面板 -->
                  <div
                    class="excel-info"
                    v-if="excelData.length > 0"
                  >
                    <NText
                      depth="3"
                      class="text-sm"
                    >
                      当前工作表: {{ activeSheet }} | 总行数:
                      {{ excelData.length }} | 总列数:
                      {{ excelColumns.length }} | 当前页:
                      {{ currentExcelPage }}/{{ totalExcelPages }}
                    </NText>
                  </div>

                  <!-- Excel表格 -->
                  <div class="excel-table-container">
                    <div
                      class="excel-table-wrapper"
                      :class="{ 'simple-mode': !showExcelFormat }"
                    >
                      <table
                        class="excel-table"
                        v-if="excelData.length > 0"
                      >
                        <thead>
                          <tr>
                            <th class="row-number">行号</th>
                            <th
                              v-for="(col, index) in excelColumns"
                              :key="col.key"
                              class="excel-header"
                              :style="{ minWidth: col.width + 'px' }"
                            >
                              <div class="header-content">
                                <span class="column-letter">{{
                                  getColumnLetter(index)
                                }}</span>
                                <span class="column-title">{{
                                  col.title
                                }}</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(row, rowIndex) in paginatedExcelData"
                            :key="rowIndex"
                            class="excel-row"
                          >
                            <td class="row-number">{{
                              (currentExcelPage - 1) * pageSize + rowIndex + 1
                            }}</td>
                            <td
                              v-for="col in excelColumns"
                              :key="col.key"
                              v-show="!row[col.key]?.hidden"
                              class="excel-cell"
                              :class="[
                                getCellClass(row[col.key]?.value),
                                row[col.key]?.merged ? 'merged-cell' : '',
                                !showExcelFormat ? 'compact-cell' : '',
                              ]"
                              :rowspan="row[col.key]?.rowspan || 1"
                              :colspan="row[col.key]?.colspan || 1"
                              :title="row[col.key]?.value"
                            >
                              {{ formatCellValue(row[col.key]?.value) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div
                        v-else
                        class="excel-empty"
                      >
                        <NEmpty description="该工作表没有数据或解析失败">
                          <template #extra>
                            <NButton
                              size="small"
                              @click="loadFile"
                              >重新解析</NButton
                            >
                          </template>
                        </NEmpty>
                      </div>
                    </div>

                    <!-- 分页控制 -->
                    <div
                      class="excel-pagination"
                      v-if="totalExcelPages > 1"
                    >
                      <NPagination
                        v-model:page="currentExcelPage"
                        :page-count="totalExcelPages"
                        :page-size="pageSize"
                        show-size-picker
                        :page-sizes="PAGE_SIZE_OPTIONS"
                        @update:page-size="handlePageSizeChange"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 不支持的文件类型 -->
              <NResult
                v-else
                status="warning"
                title="不支持的文件格式"
                :description="`暂不支持预览 ${fileType.toUpperCase()} 格式文件`"
              />
            </template>
          </div>
        </div>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
  import {
    type Props,
    type ExcelRow,
    type ExcelSheet,
    type Heading,
    extractFileNameFromUrl,
    formatFileSize,
    getFileType,
    getFileConfig,
    createZoomHandler,
    getColumnLetter,
    formatCellValue,
    getCellClass,
    createFileLoaders,
    createFullscreenToggler,
    ZOOM_CONFIGS,
    PAGE_SIZE_OPTIONS,
    FULLSCREEN_EVENTS,
  } from './data'

  const props = withDefaults(defineProps<Props>(), {
    fileName: '未知文件',
    autoPreview: false,
  })

  const { file, url, fileName: propFileName, autoPreview } = toRefs(props)

  const emit = defineEmits<{
    preview: [file: File | string]
    download: [file: File | string]
  }>()

  // ==================== 响应式状态 ====================
  // 基础状态
  const loading = ref(false)
  const error = ref('')
  const fileSize = ref(0)
  const showModal = ref(false)
  const isFullscreen = ref(false)
  const modalContainer = ref<HTMLElement>()

  // 文件预览状态
  const pdfUrl = ref('')
  const currentPage = ref(1)
  const totalPages = ref(0)
  const scale = ref(1)
  const wordContent = ref('')
  const wordZoom = ref(100)
  const showOutline = ref(true)
  const headings = ref<Heading[]>([])

  // Excel相关状态
  const excelSheets = ref<ExcelSheet[]>([])
  const activeSheet = ref('')
  const excelColumns = ref<any[]>([])
  const excelData = ref<ExcelRow[]>([])
  const showExcelFormat = ref(false)
  const currentExcelPage = ref(1)
  const pageSize = ref(50)

  // ==================== 计算属性 ====================
  const displayFileName = computed(() => {
    if (propFileName.value && propFileName.value !== '未知文件')
      return propFileName.value
    if (file.value?.name) return file.value.name
    if (url.value) return extractFileNameFromUrl(url.value)
    return '未知文件'
  })

  const fileType = computed(() => getFileType(displayFileName.value))
  const fileConfig = computed(() => getFileConfig(fileType.value))

  const totalExcelPages = computed(() =>
    Math.ceil(excelData.value.length / pageSize.value)
  )
  const paginatedExcelData = computed(() => {
    const start = (currentExcelPage.value - 1) * pageSize.value
    return excelData.value.slice(start, start + pageSize.value)
  })

  // ==================== 工具函数 ====================
  const adjustZoom = createZoomHandler(scale, ZOOM_CONFIGS.pdf)
  const adjustWordZoom = createZoomHandler(wordZoom, ZOOM_CONFIGS.word)
  const toggleFullscreen = createFullscreenToggler(modalContainer)

  const changePage = (action: 'prev' | 'next' | number) => {
    if (typeof action === 'number') {
      currentPage.value = Math.max(1, Math.min(action, totalPages.value))
    } else {
      const delta = action === 'prev' ? -1 : 1
      currentPage.value = Math.max(
        1,
        Math.min(currentPage.value + delta, totalPages.value)
      )
    }
  }

  const handlePageSizeChange = (newPageSize: number) => {
    pageSize.value = newPageSize
    currentExcelPage.value = 1
  }

  const scrollToHeading = (headingId: string) => {
    document
      .getElementById(headingId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ==================== 状态管理 ====================
  const clearState = () => {
    error.value = ''
    loading.value = false
    pdfUrl.value = ''
    wordContent.value = ''
    activeSheet.value = ''
    currentPage.value = 1
    totalPages.value = 0
    scale.value = 1
    wordZoom.value = 100
    excelSheets.value = []
    excelData.value = []
    excelColumns.value = []
    headings.value = []
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
    loading.value = false
  }

  // ==================== 文件处理 ====================
  const fileLoaders = createFileLoaders({
    pdfUrl,
    totalPages,
    wordContent,
    headings,
    excelSheets,
    activeSheet,
    excelData,
    excelColumns,
  })

  const loadFile = async () => {
    if (!file.value && !url.value) {
      setError('未提供文件或URL')
      return
    }

    clearState()
    loading.value = true

    try {
      let currentFile: File

      if (file.value) {
        currentFile = file.value
        fileSize.value = file.value.size
      } else if (url.value) {
        const response = await fetch(url.value)
        if (!response.ok)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)

        const blob = await response.blob()
        currentFile = new File([blob], displayFileName.value, {
          type: blob.type,
        })
      } else {
        throw new Error('未提供文件或URL')
      }

      if (fileType.value === 'unknown') {
        throw new Error('不支持的文件格式')
      }

      const loader = fileLoaders[fileType.value as keyof typeof fileLoaders]
      if (loader) {
        await loader(currentFile)
      } else {
        throw new Error('不支持的文件格式')
      }

      loading.value = false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(`${fileType.value.toUpperCase()}文件加载失败: ${errorMessage}`)
    }
  }

  // ==================== 事件处理 ====================
  const openPreview = async () => {
    isFullscreen.value = false
    showModal.value = true
    await loadFile()
    emit('preview', file.value || url.value!)
  }

  const downloadFile = () => {
    if (file.value) {
      const downloadUrl = URL.createObjectURL(file.value)
      const a = Object.assign(document.createElement('a'), {
        href: downloadUrl,
        download: displayFileName.value,
      })
      a.click()
      URL.revokeObjectURL(downloadUrl)
    } else if (url.value) {
      window.open(url.value, '_blank')
    }
    emit('download', file.value || url.value!)
  }

  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  // ==================== 生命周期 ====================
  onMounted(() => {
    FULLSCREEN_EVENTS.forEach(event =>
      document.addEventListener(event, handleFullscreenChange)
    )
  })

  onUnmounted(() => {
    FULLSCREEN_EVENTS.forEach(event =>
      document.removeEventListener(event, handleFullscreenChange)
    )

    if (pdfUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl.value.split('#')[0])
    }
  })

  // ==================== 监听器 ====================
  watch(activeSheet, newSheet => {
    const sheet = excelSheets.value.find(s => s.name === newSheet)
    if (sheet) {
      excelData.value = sheet.data
      excelColumns.value = sheet.columns
      currentExcelPage.value = 1
    }
  })

  watch(
    () => file.value?.size,
    newSize => {
      fileSize.value = newSize || 0
    },
    { immediate: true }
  )

  watch(showModal, isShow => {
    if (!isShow) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      isFullscreen.value = false
    }
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
