<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Upload\index.vue
 * @Description: 增强型上传组件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
-->

<template>
  <div class="c-upload">
    <!-- 上传区域 -->
    <UploadArea
      ref="uploadAreaRef"
      :accept="props.accept"
      :multiple="props.multiple"
      :directory="props.directory"
      :disabled="props.disabled"
      :draggable="props.draggable"
      :pasteable="props.pasteable"
      :tip="props.tip"
      @files="handleFiles"
    >
      <slot name="area" />
    </UploadArea>

    <!-- 总进度条 -->
    <div
      v-if="showTotalProgress"
      class="c-upload__total-progress"
    >
      <div class="c-upload__total-label">
        <span>总进度</span>
        <span>{{ totalPercent }}%</span>
      </div>
      <NProgress
        :percentage="totalPercent"
        :height="6"
        :border-radius="3"
        :show-indicator="false"
        status="success"
      />
    </div>

    <!-- 图片预览模式 -->
    <ImagePreview
      v-if="props.listType === 'image'"
      :file-list="fileList"
      @remove="handleRemove"
      @retry="handleRetry"
    />

    <!-- 文件列表模式 -->
    <FileList
      v-else-if="props.showFileList && fileList.length > 0"
      :file-list="fileList"
      :show-thumbnail="props.showThumbnail"
      :hash-progress="hashProgress"
      @remove="handleRemove"
      @retry="handleRetry"
    />
  </div>
</template>

<script setup lang="ts">
  import type {
    UploadProps,
    UploadExpose,
    UploadFileItem,
  } from '@/types/modules/upload'
  import { DEFAULT_CHUNK_SIZE, DEFAULT_CONCURRENCY } from './constants'
  import { useUploadCore } from '@/composables/Upload/useUploadCore'
  import UploadArea from './components/UploadArea.vue'
  import FileList from './components/FileList.vue'
  import ImagePreview from './components/ImagePreview.vue'

  const props = withDefaults(defineProps<UploadProps>(), {
    action: '',
    headers: () => ({}),
    data: () => ({}),
    multiple: false,
    directory: false,
    accept: '',
    maxSize: 0,
    maxCount: 0,
    disabled: false,
    draggable: true,
    pasteable: false,
    chunked: false,
    chunkSize: DEFAULT_CHUNK_SIZE,
    concurrency: DEFAULT_CONCURRENCY,
    showFileList: true,
    listType: 'text',
    showThumbnail: true,
    tip: '',
    defaultFileList: () => [],
  })

  const emit = defineEmits<{
    change: [fileList: UploadFileItem[]]
    success: [file: UploadFileItem, response: any]
    error: [file: UploadFileItem, error: Error]
    progress: [file: UploadFileItem, percent: number]
    remove: [file: UploadFileItem]
    finish: [fileList: UploadFileItem[]]
    exceed: [files: File[], fileList: UploadFileItem[]]
  }>()

  const uploadAreaRef = ref<InstanceType<typeof UploadArea>>()

  const {
    fileList,
    totalPercent,
    hashProgress,
    addFiles,
    removeFile,
    clearAll,
    startUpload,
    pauseAll,
    resumeAll,
    retryFile,
    processFile,
    getSuccessList,
  } = useUploadCore(props)

  // ─── 是否显示总进度 ──────────────────────────

  const showTotalProgress = computed(() => {
    return fileList.value.some(
      f => f.status === 'uploading' || f.status === 'hashing'
    )
  })

  // ─── 文件接收处理 ─────────────────────────────

  /** 处理接收到的文件 */
  function handleFiles(files: File[]) {
    // 数量超限
    if (
      props.maxCount &&
      fileList.value.length + files.length > props.maxCount
    ) {
      emit('exceed', files, fileList.value)
      const available = props.maxCount - fileList.value.length
      if (available <= 0) return
      files = files.slice(0, available)
    }

    // 大小校验过滤
    if (props.maxSize) {
      files = files.filter(f => f.size <= props.maxSize!)
    }

    const items = addFiles(files)
    emit('change', fileList.value)

    // 自动上传
    items.forEach(processFile)
  }

  // ─── 移除 & 重试 ─────────────────────────────

  /** 移除文件 */
  function handleRemove(uid: string) {
    const file = fileList.value.find(f => f.uid === uid)
    if (file) {
      emit('remove', file)
      removeFile(uid)
      emit('change', fileList.value)
    }
  }

  /** 重试上传 */
  function handleRetry(uid: string) {
    retryFile(uid)
  }

  // ─── 监听文件状态变化触发事件 ─────────────────

  watch(
    fileList,
    list => {
      // 检查是否全部完成
      const allDone =
        list.length > 0 &&
        list.every(
          f =>
            f.status === 'success' ||
            f.status === 'instant' ||
            f.status === 'error'
        )
      if (allDone) {
        emit('finish', list)
      }
    },
    { deep: true }
  )

  // ─── Expose ──────────────────────────────────

  defineExpose<UploadExpose>({
    selectFiles: () => uploadAreaRef.value?.triggerSelect(),
    startUpload,
    pauseAll,
    resumeAll,
    clearAll: () => {
      clearAll()
      emit('change', fileList.value)
    },
    removeFile: (uid: string) => {
      handleRemove(uid)
    },
    retryFile,
    getFileList: () => fileList.value,
    getSuccessList,
    /** 总体进度 */
    get totalPercent() {
      return totalPercent.value
    },
  })
</script>

<style scoped lang="scss">
  .c-upload {
    width: 100%;

    &__total-progress {
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--body-color);
      border: 1px solid var(--border-color);
    }

    &__total-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--text-color-3);
    }
  }
</style>
