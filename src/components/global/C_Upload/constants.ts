/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-27 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-27 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Upload\constants.ts
 * @Description: 增强型上传组件常量
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 默认分片大小 2MB */
export const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024

/** 默认最大并发数 */
export const DEFAULT_CONCURRENCY = 3

/** 默认最大文件数 */
export const DEFAULT_MAX_COUNT = 10

/** 大文件阈值（超过此大小自动启用分片） */
export const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024

/** 状态文案映射 */
export const STATUS_TEXT: Record<string, string> = {
  pending: '等待上传',
  hashing: '计算校验…',
  uploading: '上传中…',
  success: '上传成功',
  error: '上传失败',
  paused: '已暂停',
  instant: '秒传成功',
}

/** 状态颜色映射（Naive UI NTag type） */
export const STATUS_TYPE: Record<string, string> = {
  pending: 'default',
  hashing: 'info',
  uploading: 'info',
  success: 'success',
  error: 'error',
  paused: 'warning',
  instant: 'success',
}

/** 文件图标映射 */
export const FILE_ICON_MAP: Record<string, string> = {
  'image/': 'mdi:file-image-outline',
  'video/': 'mdi:file-video-outline',
  'audio/': 'mdi:file-music-outline',
  'application/pdf': 'mdi:file-pdf-box',
  'application/zip': 'mdi:folder-zip-outline',
  'application/x-rar': 'mdi:folder-zip-outline',
  'application/vnd.ms-excel': 'mdi:file-excel-outline',
  'application/vnd.openxmlformats-officedocument.spreadsheetml':
    'mdi:file-excel-outline',
  'application/msword': 'mdi:file-word-outline',
  'application/vnd.openxmlformats-officedocument.wordprocessingml':
    'mdi:file-word-outline',
  'text/': 'mdi:file-document-outline',
  default: 'mdi:file-outline',
}

/** 根据 MIME 类型获取图标 */
export function getFileIcon(type: string): string {
  for (const [key, icon] of Object.entries(FILE_ICON_MAP)) {
    if (key !== 'default' && type.startsWith(key)) return icon
  }
  return FILE_ICON_MAP.default
}

/** 格式化文件大小 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
