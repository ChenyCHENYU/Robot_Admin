/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\composables\Upload\useUploadQueue.ts
 * @Description: 并发队列管理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref } from 'vue'
import type {
  UploadFileItem,
  UploadRequestOptions,
  CustomUploadRequest,
} from '@/types/modules/upload'

interface UseUploadQueueOptions {
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
}

/**
 * 并发队列管理
 *
 * 控制普通文件（非分片）的并发上传数量，
 * 先进先出排队，自动从队列中取出执行。
 */
export function useUploadQueue(options: UseUploadQueueOptions) {
  /** 等待队列 */
  const queue: UploadFileItem[] = []
  /** 正在上传的数量 */
  const activeCount = ref(0)
  /** uid → abort */
  const abortMap = new Map<string, () => void>()

  /**
   * 添加文件到队列
   */
  function enqueue(
    file: UploadFileItem,
    onProgress: (uid: string, percent: number) => void,
    onSuccess: (uid: string, response: any) => void,
    onError: (uid: string, error: Error) => void
  ) {
    queue.push(file)
    processQueue(onProgress, onSuccess, onError)
  }

  /**
   * 处理队列
   */
  function processQueue(
    onProgress: (uid: string, percent: number) => void,
    onSuccess: (uid: string, response: any) => void,
    onError: (uid: string, error: Error) => void
  ) {
    while (activeCount.value < options.concurrency.value && queue.length > 0) {
      const file = queue.shift()!
      if (!file.raw) continue

      activeCount.value++

      const requestOptions: UploadRequestOptions = {
        action: options.action.value,
        headers: options.headers.value,
        data: options.data.value,
        file: file.raw,
        filename: file.name,
        onProgress: percent => {
          onProgress(file.uid, percent)
        },
        onSuccess: response => {
          activeCount.value--
          abortMap.delete(file.uid)
          onSuccess(file.uid, response)
          processQueue(onProgress, onSuccess, onError)
        },
        onError: error => {
          activeCount.value--
          abortMap.delete(file.uid)
          onError(file.uid, error)
          processQueue(onProgress, onSuccess, onError)
        },
      }

      if (options.customRequest?.value) {
        const { abort } = options.customRequest.value(requestOptions)
        abortMap.set(file.uid, abort)
      } else {
        const { abort } = defaultRequest(requestOptions)
        abortMap.set(file.uid, abort)
      }
    }
  }

  /** 中止指定文件 */
  function abort(uid: string) {
    abortMap.get(uid)?.()
    abortMap.delete(uid)
    // 从队列移除
    const idx = queue.findIndex(f => f.uid === uid)
    if (idx !== -1) queue.splice(idx, 1)
  }

  /** 中止所有 */
  function abortAll() {
    abortMap.forEach(fn => fn())
    abortMap.clear()
    queue.length = 0
    activeCount.value = 0
  }

  return {
    /** 当前活跃上传数 */
    activeCount: readonly(activeCount),
    enqueue,
    abort,
    abortAll,
  }
}

/** 默认 XHR 上传 */
function defaultRequest(options: UploadRequestOptions) {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', options.action)

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })
  }

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
  formData.append('file', options.file as File, options.filename)

  if (options.data) {
    Object.entries(options.data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })
  }

  xhr.send(formData)

  return { abort: () => xhr.abort() }
}
