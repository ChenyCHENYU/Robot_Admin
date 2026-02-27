/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Upload\useChunkUpload.ts
 * @Description: 分片上传引擎
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type {
  UploadChunk,
  ChunkProgress,
  UploadRequestOptions,
  CustomUploadRequest,
  UploadedChunksQueryFn,
  MergeChunksFn,
} from '@/types/modules/upload'

interface UseChunkUploadOptions {
  /** 分片大小 */
  chunkSize: Ref<number>
  /** 最大并发数 */
  concurrency: Ref<number>
  /** 上传地址 */
  action: Ref<string>
  /** 请求头 */
  headers: Ref<Record<string, string>>
  /** 附加字段 */
  data: Ref<Record<string, any>>
  /** 自定义上传函数 */
  customRequest?: Ref<CustomUploadRequest | undefined>
  /** 已上传分片查询 */
  uploadedChunksQuery?: Ref<UploadedChunksQueryFn | undefined>
  /** 分片合并函数 */
  mergeChunks?: Ref<MergeChunksFn | undefined>
}

/**
 * 分片上传引擎
 *
 * 处理大文件分片切割、并发上传、断点续传、分片合并。
 */
export function useChunkUpload(options: UseChunkUploadOptions) {
  /** 正在进行的上传中止控制器映射 uid → abort[] */
  const abortMap = new Map<string, (() => void)[]>()

  /**
   * 将文件切割为分片
   */
  function createChunks(file: File): UploadChunk[] {
    const size = options.chunkSize.value
    const chunks: UploadChunk[] = []
    let index = 0
    let offset = 0

    while (offset < file.size) {
      const end = Math.min(offset + size, file.size)
      chunks.push({
        index,
        blob: file.slice(offset, end),
        size: end - offset,
        uploaded: false,
      })
      offset = end
      index++
    }

    return chunks
  }

  /**
   * 查询已上传的分片（断点续传）
   */
  async function queryExistingChunks(hash: string, chunks: UploadChunk[]) {
    if (!options.uploadedChunksQuery?.value) return

    try {
      const uploaded = await options.uploadedChunksQuery.value(hash)
      for (const idx of uploaded) {
        const chunk = chunks[idx]
        if (chunk) chunk.uploaded = true
      }
    } catch {
      // 查询失败，全部重传
    }
  }

  /**
   * 上传单个分片
   */
  function uploadSingleChunk(ctx: {
    chunk: UploadChunk
    hash: string
    file: File
    totalChunks: number
    chunks: UploadChunk[]
    totalBytes: number
    abortControllers: (() => void)[]
    onProgress: (progress: ChunkProgress) => void
    setUploadedBytes: (bytes: number) => void
    setError: () => void
  }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const requestOptions: UploadRequestOptions = {
        action: options.action.value,
        headers: options.headers.value,
        data: {
          ...options.data.value,
          hash: ctx.hash,
          chunkIndex: ctx.chunk.index,
          totalChunks: ctx.totalChunks,
          filename: ctx.file.name,
        },
        file: ctx.chunk.blob,
        filename: ctx.file.name,
        hash: ctx.hash,
        chunkIndex: ctx.chunk.index,
        totalChunks: ctx.totalChunks,
        onProgress: () => {
          /* 分片内部进度可选 */
        },
        onSuccess: () => {
          ctx.chunk.uploaded = true
          ctx.setUploadedBytes(ctx.chunk.size)
          ctx.onProgress({
            uploadedChunks: ctx.chunks.filter(c => c.uploaded).length,
            totalChunks: ctx.totalChunks,
            uploadedBytes: ctx.chunks
              .filter(c => c.uploaded)
              .reduce((sum, c) => sum + c.size, 0),
            totalBytes: ctx.totalBytes,
          })
          resolve()
        },
        onError: err => {
          ctx.setError()
          reject(err)
        },
      }

      const req = options.customRequest?.value
        ? options.customRequest.value(requestOptions)
        : defaultUploadRequest(requestOptions)
      ctx.abortControllers.push(req.abort)
    })
  }

  /**
   * 执行分片上传
   */
  async function uploadChunks(params: {
    uid: string
    file: File
    hash: string
    onProgress: (progress: ChunkProgress) => void
    onSuccess: (response: any) => void
    onError: (error: Error) => void
    isPaused: () => boolean
  }) {
    const { uid, file, hash, onProgress, onSuccess, onError, isPaused } = params
    const chunks = createChunks(file)
    const totalChunks = chunks.length
    const totalBytes = file.size
    let uploadedBytes = 0

    // 查询已上传分片（断点续传）
    await queryExistingChunks(hash, chunks)
    uploadedBytes = chunks
      .filter(c => c.uploaded)
      .reduce((sum, c) => sum + c.size, 0)

    // 初始进度
    onProgress({
      uploadedChunks: chunks.filter(c => c.uploaded).length,
      totalChunks,
      uploadedBytes,
      totalBytes,
    })

    // 过滤待上传分片
    const pendingChunks = chunks.filter(c => !c.uploaded)

    if (pendingChunks.length === 0) {
      // 全部已上传，直接合并
      await mergeAndFinish(hash, file.name, totalChunks, onSuccess, onError)
      return
    }

    // 并发控制上传
    const abortControllers: (() => void)[] = []
    abortMap.set(uid, abortControllers)

    const concurrency = options.concurrency.value
    let current = 0
    let hasError = false

    /** 上传下一个分片 */
    async function uploadNext(): Promise<void> {
      while (current < pendingChunks.length && !hasError && !isPaused()) {
        const chunk = pendingChunks[current++]

        // eslint-disable-next-line no-await-in-loop
        await uploadSingleChunk({
          chunk,
          hash,
          file,
          totalChunks,
          chunks,
          totalBytes,
          abortControllers,
          onProgress,
          setUploadedBytes: (bytes: number) => {
            uploadedBytes += bytes
          },
          setError: () => {
            hasError = true
          },
        })
      }
    }

    // 启动并发池
    const pool = Array.from(
      { length: Math.min(concurrency, pendingChunks.length) },
      () => uploadNext()
    )

    try {
      await Promise.all(pool)

      if (!hasError && !isPaused()) {
        // 全部分片完成 → 合并
        await mergeAndFinish(hash, file.name, totalChunks, onSuccess, onError)
      }
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      abortMap.delete(uid)
    }
  }

  /** 合并分片 */
  async function mergeAndFinish(
    hash: string,
    filename: string,
    totalChunks: number,
    onSuccess: (response: any) => void,
    onError: (error: Error) => void
  ) {
    if (options.mergeChunks?.value) {
      try {
        const result = await options.mergeChunks.value(
          hash,
          filename,
          totalChunks
        )
        onSuccess(result)
      } catch (err) {
        onError(err instanceof Error ? err : new Error('分片合并失败'))
      }
    } else {
      onSuccess({ message: '分片上传完成（未配置合并函数）' })
    }
  }

  /** 中止指定文件的分片上传 */
  function abortUpload(uid: string) {
    const controllers = abortMap.get(uid)
    controllers?.forEach(abort => abort())
    abortMap.delete(uid)
  }

  /** 中止所有 */
  function abortAll() {
    abortMap.forEach(controllers => {
      controllers.forEach(abort => abort())
    })
    abortMap.clear()
  }

  return {
    createChunks,
    uploadChunks,
    abortUpload,
    abortAll,
  }
}

/** 默认 XMLHttpRequest 上传实现 */
function defaultUploadRequest(options: UploadRequestOptions) {
  const xhr = new XMLHttpRequest()

  xhr.open('POST', options.action)

  // 设置请求头
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })
  }

  // 上传进度
  xhr.upload.addEventListener('progress', e => {
    if (e.lengthComputable) {
      options.onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
  })

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      let response: any
      try {
        response = JSON.parse(xhr.responseText)
      } catch {
        response = xhr.responseText
      }
      options.onSuccess?.(response)
    } else {
      options.onError?.(new Error(`上传失败: HTTP ${xhr.status}`))
    }
  })

  xhr.addEventListener('error', () => {
    options.onError?.(new Error('网络错误'))
  })

  const formData = new FormData()
  formData.append('file', options.file, options.filename)

  if (options.data) {
    Object.entries(options.data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
  }

  xhr.send(formData)

  return {
    abort: () => xhr.abort(),
  }
}
