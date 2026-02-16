<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-27 19:27:14
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-16 12:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_FilePreview\index.vue
 * @Description: 文件预览组件 — 薄 UI 壳，逻辑由 useFilePreview + useFullscreen 驱动
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
        ref="modalContainer"
        class="modal-container"
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
                  :disabled="loading"
                  @click="loadFile"
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
                  <template #description>
                    正在加载{{ fileType.toUpperCase() }}文件...
                  </template>
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

            <!-- 文件预览 — 委托给子组件 -->
            <template v-else>
              <PdfViewer
                v-if="fileType === 'pdf'"
                :pdf-url="pdfUrl"
                :total-pages="pdfTotalPages"
              />

              <WordViewer
                v-else-if="fileType === 'word'"
                :content="wordContent"
                :headings="wordHeadings"
              />

              <ExcelViewer
                v-else-if="fileType === 'excel'"
                :sheets="excelSheets"
                @reload="loadFile"
              />

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
  import { formatFileSize } from './data'
  import PdfViewer from './components/PdfViewer/index.vue'
  import WordViewer from './components/WordViewer/index.vue'
  import ExcelViewer from './components/ExcelViewer/index.vue'
  import { useFilePreview } from '@/composables/FilePreview/useFilePreview'
  import { useFullscreen } from '@/composables/FilePreview/useFullscreen'

  const props = withDefaults(
    defineProps<{
      file?: File
      url?: string
      fileName?: string
      autoPreview?: boolean
    }>(),
    {
      fileName: '未知文件',
      autoPreview: false,
    }
  )

  const { file, url, fileName: propFileName, autoPreview } = toRefs(props)

  const emit = defineEmits<{
    preview: [file: File | string]
    download: [file: File | string]
  }>()

  // ==================== Composables ====================
  const {
    loading,
    error,
    fileSize,
    showModal,
    pdfUrl,
    pdfTotalPages,
    wordContent,
    wordHeadings,
    excelSheets,
    displayFileName,
    fileType,
    fileConfig,
    loadFile,
    openPreview,
    downloadFile,
  } = useFilePreview({ file, url, fileName: propFileName }, emit)

  const modalContainer = ref<HTMLElement>()
  const { isFullscreen, toggleFullscreen, exitFullscreen } =
    useFullscreen(modalContainer)

  // ==================== Modal 关闭时退出全屏 ====================
  watch(showModal, isShow => {
    if (!isShow) exitFullscreen()
  })
</script>

<style lang="scss" scoped>
  @use './index.scss';
</style>
