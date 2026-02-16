/**
 * useFilePreview — 文件预览核心 composable
 * 管理：文件状态、加载、类型检测、下载
 */
import type { Ref } from 'vue'
import {
  extractFileNameFromUrl,
  getFileType,
  getFileConfig,
  loadPdf,
  loadWord,
  loadExcel,
} from '@/components/global/C_FilePreview/data'

export interface UseFilePreviewOptions {
  file: Ref<File | undefined>
  url: Ref<string | undefined>
  fileName: Ref<string>
}

/**
 * 文件预览核心 composable — 管理文件状态、加载、类型检测、下载
 * @param options - 文件源配置（file / url / fileName）
 * @param emit - 组件事件发射器
 */
export function useFilePreview(
  options: UseFilePreviewOptions,
  emit: {
    (e: 'preview', file: File | string): void
    (e: 'download', file: File | string): void
  }
) {
  const { file, url, fileName } = options

  // ==================== 基础状态 ====================
  const loading = ref(false)
  const error = ref('')
  const fileSize = ref(0)
  const showModal = ref(false)

  // ==================== 解析后的数据 ====================
  const pdfUrl = ref('')
  const pdfTotalPages = ref(0)

  const wordContent = ref('')
  const wordHeadings = ref<DocHeading[]>([])

  const excelSheets = ref<ExcelSheet[]>([])

  // ==================== 计算属性 ====================
  const displayFileName = computed(() => {
    if (fileName.value && fileName.value !== '未知文件') return fileName.value
    if (file.value?.name) return file.value.name
    if (url.value) return extractFileNameFromUrl(url.value)
    return '未知文件'
  })

  const fileType = computed<FilePreviewType>(() =>
    getFileType(displayFileName.value)
  )
  const fileConfig = computed(() => getFileConfig(fileType.value))

  // ==================== 内部方法 ====================
  const clearState = () => {
    error.value = ''
    loading.value = false
    pdfUrl.value = ''
    pdfTotalPages.value = 0
    wordContent.value = ''
    wordHeadings.value = []
    excelSheets.value = []
  }

  const setError = (msg: string) => {
    error.value = msg
    loading.value = false
  }

  // ==================== 文件解析 ====================
  const resolveFile = async (): Promise<File> => {
    if (file.value) {
      fileSize.value = file.value.size
      return file.value
    }
    if (url.value) {
      const response = await fetch(url.value)
      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)

      const blob = await response.blob()
      const resolved = new File([blob], displayFileName.value, {
        type: blob.type,
      })
      fileSize.value = resolved.size
      return resolved
    }
    throw new Error('未提供文件或URL')
  }

  const loadByType = async (
    currentFile: File,
    type: FilePreviewType
  ): Promise<void> => {
    switch (type) {
      case 'pdf': {
        const result = await loadPdf(currentFile)
        pdfUrl.value = result.url
        pdfTotalPages.value = result.totalPages
        break
      }
      case 'word': {
        const result = await loadWord(currentFile)
        wordContent.value = result.content
        wordHeadings.value = result.headings
        break
      }
      case 'excel': {
        const result = await loadExcel(currentFile)
        excelSheets.value = result.sheets
        break
      }
      default:
        throw new Error('不支持的文件格式')
    }
  }

  // ==================== 核心方法 ====================
  const loadFile = async () => {
    if (!file.value && !url.value) {
      setError('未提供文件或URL')
      return
    }

    clearState()
    loading.value = true

    try {
      const currentFile = await resolveFile()
      await loadByType(currentFile, fileType.value)
      loading.value = false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(`${fileType.value.toUpperCase()}文件加载失败: ${errorMessage}`)
    }
  }

  const openPreview = async () => {
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

  // ==================== 副作用 ====================
  watch(
    () => file.value?.size,
    newSize => {
      fileSize.value = newSize || 0
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (pdfUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl.value.split('#')[0])
    }
  })

  return {
    // 状态
    loading,
    error,
    fileSize,
    showModal,
    // 解析数据
    pdfUrl,
    pdfTotalPages,
    wordContent,
    wordHeadings,
    excelSheets,
    // 计算属性
    displayFileName,
    fileType,
    fileConfig,
    // 方法
    loadFile,
    openPreview,
    downloadFile,
  }
}
