/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\38-upload\data.ts
 * @Description: 上传组件演示页数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  UploadFileItem,
  UploadRequestOptions,
} from '@/types/modules/upload'

/** 模拟已有文件列表（回显） */
export const MOCK_EXISTING_FILES: UploadFileItem[] = [
  {
    uid: 'existing-1',
    name: '产品设计稿-v2.pdf',
    size: 3_542_018,
    type: 'application/pdf',
    status: 'success',
    percent: 100,
    url: 'https://example.com/files/design-v2.pdf',
  },
  {
    uid: 'existing-2',
    name: '团队合影.jpg',
    size: 1_258_900,
    type: 'image/jpeg',
    status: 'success',
    percent: 100,
    url: 'https://picsum.photos/seed/team/800/600',
    thumbUrl: 'https://picsum.photos/seed/team/200/150',
  },
]

/** 模拟上传延迟范围（ms） */
export const MOCK_DELAY_RANGE: [number, number] = [800, 2500]

/** 模拟上传成功率 */
export const MOCK_SUCCESS_RATE = 0.85

/** 文件类型选项 */
export const FILE_TYPE_OPTIONS = [
  { label: '全部文件', value: '' },
  { label: '图片', value: 'image/*' },
  { label: '文档', value: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx' },
  { label: '视频', value: 'video/*' },
  { label: '压缩包', value: '.zip,.rar,.7z,.tar,.gz' },
]

/** 分片大小选项 */
export const CHUNK_SIZE_OPTIONS = [
  { label: '1 MB', value: 1 * 1024 * 1024 },
  { label: '2 MB', value: 2 * 1024 * 1024 },
  { label: '5 MB', value: 5 * 1024 * 1024 },
  { label: '10 MB', value: 10 * 1024 * 1024 },
]

/** 并发数选项 */
export const CONCURRENCY_OPTIONS = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
]

// ─── 模拟上传函数 ───────────────────────────────

/**
 * 模拟上传请求（Demo 用）
 *
 * 随机延迟后按 MOCK_SUCCESS_RATE 概率返回成功/失败，
 * 期间定时推送上传进度。
 */
export function mockUploadRequest(options: UploadRequestOptions): {
  abort: () => void
} {
  let timer: ReturnType<typeof setTimeout> | null = null
  let progressTimer: ReturnType<typeof setInterval> | null = null
  let aborted = false

  const delay =
    MOCK_DELAY_RANGE[0] +
    Math.random() * (MOCK_DELAY_RANGE[1] - MOCK_DELAY_RANGE[0])
  let currentPercent = 0

  // 模拟进度推送
  progressTimer = setInterval(() => {
    if (aborted) return
    currentPercent = Math.min(
      currentPercent + Math.round(Math.random() * 20 + 5),
      95
    )
    options.onProgress?.(currentPercent)
  }, delay / 6)

  timer = setTimeout(() => {
    if (progressTimer) clearInterval(progressTimer)
    if (aborted) return

    if (Math.random() < MOCK_SUCCESS_RATE) {
      options.onProgress?.(100)
      options.onSuccess?.({
        code: 200,
        url: `https://example.com/uploads/${Date.now()}-${options.filename}`,
        message: '上传成功（模拟）',
      })
    } else {
      options.onError?.(new Error('模拟上传失败：服务器内部错误'))
    }
  }, delay)

  return {
    /** 中止上传 */
    abort() {
      aborted = true
      if (timer) clearTimeout(timer)
      if (progressTimer) clearInterval(progressTimer)
    },
  }
}
