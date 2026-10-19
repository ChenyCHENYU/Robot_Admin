/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 上传工作台场景与可重复的本地传输演示
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  CustomUploadRequest,
  UploadFileStatus,
} from '@robot-admin/naive-ui-components/C_Upload'
export const UPLOAD_SCENES = [
  {
    value: 'files',
    label: '通用文件',
    note: '拖放、多选与粘贴',
    accept: '',
    maxSize: 50 * 1024 * 1024,
  },
  {
    value: 'images',
    label: '图片素材',
    note: 'JPG、PNG 与 WebP',
    accept: 'image/png,image/jpeg,image/webp',
    maxSize: 10 * 1024 * 1024,
  },
  {
    value: 'directory',
    label: '文件夹',
    note: '批量选择整个目录',
    accept: '',
    maxSize: 50 * 1024 * 1024,
  },
  {
    value: 'chunked',
    label: '大文件分片',
    note: '2 MB 分片 · 并发 3',
    accept: '',
    maxSize: 500 * 1024 * 1024,
  },
] as const
export const STATUS_LABELS: Record<UploadFileStatus, string> = {
  pending: '待开始',
  validating: '校验中',
  hashing: '计算校验值',
  uploading: '演示传输中',
  success: '已完成（演示）',
  instant: '已完成（演示）',
  error: '失败，可重试',
  paused: '已暂停',
}
export const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`
/** 固定速度演示，按文件名确定首次失败；重试可恢复，不产生真实网络上传。 */
export function createDemoUploadRequest(
  failFirst: () => boolean
): CustomUploadRequest {
  const failures = new Set<string>()
  return options => {
    const failure = failFirst() && !failures.has(options.filename)
    let percent = 0
    const timer = setInterval(() => {
      percent += 10
      if (percent < 100) {
        options.onProgress?.(percent)
        return
      }
      clearInterval(timer)
      if (failure) {
        failures.add(options.filename)
        options.onError?.(new Error('首次失败演示，请点击重试'))
      } else {
        options.onProgress?.(100)
        options.onSuccess?.({ demo: true, filename: options.filename })
      }
    }, 180)
    return { abort: () => clearInterval(timer) }
  }
}
