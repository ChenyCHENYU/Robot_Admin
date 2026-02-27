/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\upload.d.ts
 * @Description: 增强型上传组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

// ─── 文件状态 ───────────────────────────────

/** 文件上传状态 */
export type UploadFileStatus =
  | 'pending'
  | 'hashing'
  | 'uploading'
  | 'success'
  | 'error'
  | 'paused'
  | 'instant'

// ─── 分片 ───────────────────────────────────

/** 单个分片 */
export interface UploadChunk {
  /** 分片索引 */
  index: number
  /** 分片 Blob */
  blob: Blob
  /** 分片大小（bytes） */
  size: number
  /** 是否已上传 */
  uploaded: boolean
}

/** 分片上传进度 */
export interface ChunkProgress {
  /** 已上传分片数 */
  uploadedChunks: number
  /** 总分片数 */
  totalChunks: number
  /** 已上传字节 */
  uploadedBytes: number
  /** 总字节 */
  totalBytes: number
}

// ─── 文件项 ─────────────────────────────────

/** 上传文件项 */
export interface UploadFileItem {
  /** 唯一标识 */
  uid: string
  /** 文件名 */
  name: string
  /** 文件大小（bytes） */
  size: number
  /** MIME 类型 */
  type: string
  /** 上传状态 */
  status: UploadFileStatus
  /** 上传进度（0-100） */
  percent: number
  /** 文件 hash（spark-md5） */
  hash?: string
  /** 分片进度 */
  chunkProgress?: ChunkProgress
  /** 原生 File 对象 */
  raw?: File
  /** 缩略图 URL（图片文件） */
  thumbUrl?: string
  /** 上传成功后的 URL */
  url?: string
  /** 服务端响应 */
  response?: any
  /** 错误信息 */
  error?: string
}

// ─── 自定义请求 ─────────────────────────────

/** 自定义上传请求参数 */
export interface UploadRequestOptions {
  /** 上传地址 */
  action: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 附加字段 */
  data?: Record<string, any>
  /** 文件 / 分片 Blob */
  file: File | Blob
  /** 文件名 */
  filename: string
  /** 文件 hash */
  hash?: string
  /** 分片索引（分片模式） */
  chunkIndex?: number
  /** 总分片数（分片模式） */
  totalChunks?: number
  /** 进度回调 */
  onProgress?: (percent: number) => void
  /** 成功回调 */
  onSuccess?: (response: any) => void
  /** 失败回调 */
  onError?: (error: Error) => void
}

/** 自定义上传函数签名 */
export type CustomUploadRequest = (options: UploadRequestOptions) => {
  abort: () => void
}

/** 秒传检查函数签名 */
export type InstantCheckFn = (
  hash: string,
  filename: string
) => Promise<{ exists: boolean; url?: string }>

/** 已上传分片查询函数签名 */
export type UploadedChunksQueryFn = (hash: string) => Promise<number[]>

/** 分片合并函数签名 */
export type MergeChunksFn = (
  hash: string,
  filename: string,
  totalChunks: number
) => Promise<{ url: string }>

// ─── Props / Events / Expose ────────────────

/** 上传组件 Props */
export interface UploadProps {
  /** 上传地址 */
  action?: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 附加字段 */
  data?: Record<string, any>
  /** 是否多选 */
  multiple?: boolean
  /** 是否允许目录上传 */
  directory?: boolean
  /** 接受的文件类型（同 input accept） */
  accept?: string
  /** 文件大小限制（bytes） */
  maxSize?: number
  /** 最大文件数 */
  maxCount?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否启用拖拽上传 */
  draggable?: boolean
  /** 是否启用粘贴上传 */
  pasteable?: boolean
  /** 是否分片上传 */
  chunked?: boolean
  /** 分片大小（bytes，默认 2MB） */
  chunkSize?: number
  /** 最大并发数 */
  concurrency?: number
  /** 是否显示文件列表 */
  showFileList?: boolean
  /** 列表类型 */
  listType?: 'text' | 'image'
  /** 是否显示图片预览缩略图 */
  showThumbnail?: boolean
  /** 自定义上传函数 */
  customRequest?: CustomUploadRequest
  /** 秒传检查函数 */
  instantCheck?: InstantCheckFn
  /** 已上传分片查询 */
  uploadedChunksQuery?: UploadedChunksQueryFn
  /** 分片合并函数 */
  mergeChunks?: MergeChunksFn
  /** 上传前拦截 */
  beforeUpload?: (file: File) => boolean | Promise<boolean | File>
  /** 提示文本 */
  tip?: string
  /** 已有文件列表（回显） */
  defaultFileList?: UploadFileItem[]
}

/** 上传组件 Events */
export interface UploadEmits {
  /** 文件列表变更 */
  change: [fileList: UploadFileItem[]]
  /** 单文件上传成功 */
  success: [file: UploadFileItem, response: any]
  /** 单文件上传失败 */
  error: [file: UploadFileItem, error: Error]
  /** 单文件进度 */
  progress: [file: UploadFileItem, percent: number]
  /** 文件移除 */
  remove: [file: UploadFileItem]
  /** 全部上传完成 */
  finish: [fileList: UploadFileItem[]]
  /** 超出限制 */
  exceed: [files: File[], fileList: UploadFileItem[]]
}

/** 上传组件暴露方法 */
export interface UploadExpose {
  /** 手动触发文件选择 */
  selectFiles: () => void
  /** 手动开始上传 */
  startUpload: () => void
  /** 暂停所有上传 */
  pauseAll: () => void
  /** 恢复所有上传 */
  resumeAll: () => void
  /** 清空文件列表 */
  clearAll: () => void
  /** 移除指定文件 */
  removeFile: (uid: string) => void
  /** 重试失败文件 */
  retryFile: (uid: string) => void
  /** 获取当前文件列表 */
  getFileList: () => UploadFileItem[]
  /** 获取成功文件列表 */
  getSuccessList: () => UploadFileItem[]
  /** 总体进度（0-100） */
  totalPercent: number
}
