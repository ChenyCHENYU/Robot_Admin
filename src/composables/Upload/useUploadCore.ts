/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Upload\useUploadCore.ts
 * @Description: 核心上传逻辑
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  UploadFileItem,
  UploadProps,
  ChunkProgress,
} from '@/types/modules/upload'
import {
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CONCURRENCY,
} from '@/components/global/C_Upload/constants'
import { useFileHash } from './useFileHash'
import { useChunkUpload } from './useChunkUpload'
import { useUploadQueue } from './useUploadQueue'

/**
 * 核心上传逻辑
 *
 * 统一调度文件校验、hash 计算、秒传检查、分片/普通上传、
 * 进度汇总和状态管理。
 */
export function useUploadCore(props: UploadProps) {
  // ─── 响应式 Props 引用 ────────────────────────

  const action = computed(() => props.action ?? '')
  const headers = computed(() => props.headers ?? {})
  const data = computed(() => props.data ?? {})
  const chunkSize = computed(() => props.chunkSize ?? DEFAULT_CHUNK_SIZE)
  const concurrency = computed(() => props.concurrency ?? DEFAULT_CONCURRENCY)
  const customRequest = computed(() => props.customRequest)
  const instantCheck = computed(() => props.instantCheck)
  const uploadedChunksQuery = computed(() => props.uploadedChunksQuery)
  const mergeChunks = computed(() => props.mergeChunks)

  // ─── 文件列表 ────────────────────────────────

  const fileList = ref<UploadFileItem[]>([...(props.defaultFileList ?? [])])
  const pausedSet = reactive(new Set<string>())

  // ─── 子 composable ───────────────────────────

  const { hashing, hashProgress, calculateHash } = useFileHash(chunkSize)

  const chunkUploader = useChunkUpload({
    chunkSize,
    concurrency,
    action,
    headers,
    data,
    customRequest,
    uploadedChunksQuery,
    mergeChunks,
  })

  const uploadQueue = useUploadQueue({
    concurrency,
    action,
    headers,
    data,
    customRequest,
  })

  // ─── 总进度 ──────────────────────────────────

  const totalPercent = computed(() => {
    const list = fileList.value
    if (list.length === 0) return 0
    const total = list.reduce((sum, f) => sum + f.percent, 0)
    return Math.round(total / list.length)
  })

  // ─── 文件操作 ────────────────────────────────

  /** 生成唯一 ID */
  function generateUid(): string {
    return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  /** 创建缩略图 */
  function createThumbnail(file: File): string | undefined {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return undefined
  }

  /** 添加文件到列表 */
  function addFiles(files: File[]): UploadFileItem[] {
    const items: UploadFileItem[] = []

    for (const file of files) {
      // 数量限制
      if (
        props.maxCount &&
        fileList.value.length + items.length >= props.maxCount
      ) {
        break
      }

      const item: UploadFileItem = {
        uid: generateUid(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        percent: 0,
        raw: file,
        thumbUrl: createThumbnail(file),
      }

      items.push(item)
    }

    fileList.value.push(...items)
    return items
  }

  /** 更新文件状态 */
  function updateFile(uid: string, patch: Partial<UploadFileItem>) {
    const file = fileList.value.find(f => f.uid === uid)
    if (file) Object.assign(file, patch)
  }

  /** 移除文件 */
  function removeFile(uid: string) {
    chunkUploader.abortUpload(uid)
    uploadQueue.abort(uid)
    pausedSet.delete(uid)

    const idx = fileList.value.findIndex(f => f.uid === uid)
    if (idx !== -1) {
      const file = fileList.value[idx]
      if (file.thumbUrl) URL.revokeObjectURL(file.thumbUrl)
      fileList.value.splice(idx, 1)
    }
  }

  /** 清空所有 */
  function clearAll() {
    chunkUploader.abortAll()
    uploadQueue.abortAll()
    pausedSet.clear()

    fileList.value.forEach(f => {
      if (f.thumbUrl) URL.revokeObjectURL(f.thumbUrl)
    })
    fileList.value = []
  }

  // ─── 上传流程 ────────────────────────────────

  /** 校验单文件 */
  async function validateFile(file: File): Promise<boolean> {
    // 大小校验
    if (props.maxSize && file.size > props.maxSize) {
      return false
    }

    // 自定义 beforeUpload
    if (props.beforeUpload) {
      const result = await props.beforeUpload(file)
      return result !== false
    }

    return true
  }

  /** 上传单个文件 */
  async function processFile(item: UploadFileItem) {
    if (!item.raw) return

    // 前置校验
    const valid = await validateFile(item.raw)
    if (!valid) {
      updateFile(item.uid, { status: 'error', error: '文件校验未通过' })
      return
    }

    // 分片模式
    if (props.chunked && item.raw.size > chunkSize.value) {
      await processChunkedUpload(item)
    } else {
      processNormalUpload(item)
    }
  }

  /** 分片上传流程 */
  async function processChunkedUpload(item: UploadFileItem) {
    const file = item.raw!

    // 1. 计算 hash
    updateFile(item.uid, { status: 'hashing' })
    let hash: string
    try {
      hash = await calculateHash(file)
      updateFile(item.uid, { hash })
    } catch {
      updateFile(item.uid, { status: 'error', error: 'Hash 计算失败' })
      return
    }

    // 2. 秒传检查
    if (instantCheck.value) {
      try {
        const result = await instantCheck.value(hash, file.name)
        if (result.exists) {
          updateFile(item.uid, {
            status: 'instant',
            percent: 100,
            url: result.url,
          })
          return
        }
      } catch {
        // 秒传检查失败，继续正常上传
      }
    }

    // 3. 分片上传
    updateFile(item.uid, { status: 'uploading' })

    await chunkUploader.uploadChunks({
      uid: item.uid,
      file,
      hash,
      onProgress: (progress: ChunkProgress) => {
        const percent = Math.round(
          (progress.uploadedBytes / progress.totalBytes) * 100
        )
        updateFile(item.uid, { percent, chunkProgress: progress })
      },
      onSuccess: (response: any) => {
        updateFile(item.uid, { status: 'success', percent: 100, response })
      },
      onError: (error: Error) => {
        updateFile(item.uid, { status: 'error', error: error.message })
      },
      isPaused: () => pausedSet.has(item.uid),
    })
  }

  /** 普通上传 */
  function processNormalUpload(item: UploadFileItem) {
    updateFile(item.uid, { status: 'uploading' })

    uploadQueue.enqueue(
      item,
      (uid, percent) => {
        updateFile(uid, { percent })
      },
      (uid, response) => {
        updateFile(uid, { status: 'success', percent: 100, response })
      },
      (uid, error) => {
        updateFile(uid, { status: 'error', error: error.message })
      }
    )
  }

  /** 开始上传（上传所有 pending 文件） */
  function startUpload() {
    const pending = fileList.value.filter(f => f.status === 'pending')
    pending.forEach(processFile)
  }

  /** 暂停所有 */
  function pauseAll() {
    fileList.value.forEach(f => {
      if (f.status === 'uploading' || f.status === 'hashing') {
        pausedSet.add(f.uid)
        updateFile(f.uid, { status: 'paused' })
      }
    })
  }

  /** 恢复所有 */
  function resumeAll() {
    fileList.value.forEach(f => {
      if (f.status === 'paused') {
        pausedSet.delete(f.uid)
        updateFile(f.uid, { status: 'pending' })
      }
    })
    startUpload()
  }

  /** 重试单个文件 */
  function retryFile(uid: string) {
    const file = fileList.value.find(f => f.uid === uid)
    if (file && file.status === 'error') {
      updateFile(uid, { status: 'pending', percent: 0, error: undefined })
      processFile(file)
    }
  }

  /** 获取成功列表 */
  function getSuccessList(): UploadFileItem[] {
    return fileList.value.filter(
      f => f.status === 'success' || f.status === 'instant'
    )
  }

  // 清理 ObjectURL
  onBeforeUnmount(() => {
    fileList.value.forEach(f => {
      if (f.thumbUrl) URL.revokeObjectURL(f.thumbUrl)
    })
  })

  return {
    /** 文件列表 */
    fileList,
    /** 总进度 */
    totalPercent,
    /** 正在计算 hash */
    hashing,
    /** hash 进度 */
    hashProgress,

    /** 添加文件 */
    addFiles,
    /** 移除文件 */
    removeFile,
    /** 清空所有 */
    clearAll,
    /** 开始上传 */
    startUpload,
    /** 暂停所有 */
    pauseAll,
    /** 恢复所有 */
    resumeAll,
    /** 重试 */
    retryFile,
    /** 处理单文件 */
    processFile,
    /** 获取成功列表 */
    getSuccessList,
  }
}
