/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-23 16:15:44
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-23 17:12:59
 * @FilePath: \Robot_Admin\src\hooks\useDownload\index.ts
 * @Description: 通用下载文件 hook 封装 - 支持多种文件类型导出
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { createDiscreteApi } from 'naive-ui/es'

const { notification } = createDiscreteApi(['notification'])

// 文件类型枚举
export enum FileType {
  XLSX = '.xlsx',
  XLS = '.xls',
  CSV = '.csv',
  PDF = '.pdf',
  DOC = '.doc',
  DOCX = '.docx',
  PPT = '.ppt',
  PPTX = '.pptx',
  TXT = '.txt',
  JSON = '.json',
  XML = '.xml',
  ZIP = '.zip',
  RAR = '.rar',
  PNG = '.png',
  JPG = '.jpg',
  JPEG = '.jpeg',
  GIF = '.gif',
  SVG = '.svg',
  MP4 = '.mp4',
  MP3 = '.mp3',
  WAV = '.wav',
}

// MIME 类型映射
const MIME_TYPE_MAP: Record<string, string> = {
  [FileType.XLSX]:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  [FileType.XLS]: 'application/vnd.ms-excel',
  [FileType.CSV]: 'text/csv',
  [FileType.PDF]: 'application/pdf',
  [FileType.DOC]: 'application/msword',
  [FileType.DOCX]:
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  [FileType.PPT]: 'application/vnd.ms-powerpoint',
  [FileType.PPTX]:
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  [FileType.TXT]: 'text/plain',
  [FileType.JSON]: 'application/json',
  [FileType.XML]: 'application/xml',
  [FileType.ZIP]: 'application/zip',
  [FileType.RAR]: 'application/x-rar-compressed',
  [FileType.PNG]: 'image/png',
  [FileType.JPG]: 'image/jpeg',
  [FileType.JPEG]: 'image/jpeg',
  [FileType.GIF]: 'image/gif',
  [FileType.SVG]: 'image/svg+xml',
  [FileType.MP4]: 'video/mp4',
  [FileType.MP3]: 'audio/mpeg',
  [FileType.WAV]: 'audio/wav',
}

// 下载配置接口
export interface DownloadConfig {
  fileName: string
  fileType: FileType
  params?: Record<string, unknown>
  showNotification?: boolean
  notificationConfig?: {
    loading?: string
    success?: string
    error?: string
  }
}

// API 函数类型
export type DownloadApiFunction = (
  params?: Record<string, unknown>
) => Promise<Blob>

// 通知消息默认配置
const DEFAULT_NOTIFICATION_CONFIG = {
  loading: '文件下载中，请稍候...',
  success: '文件下载成功',
  error: '文件下载失败',
}

/**
 * 显示通知消息
 */
const showNotificationMessage = (
  type: 'info' | 'success' | 'error',
  message: string,
  duration = 2000
) => {
  notification[type]({
    content: message,
    duration,
  })
}

/**
 * 获取完整文件名
 */
const getFullFileName = (fileName: string, fileType: FileType): string => {
  return fileName.endsWith(fileType) ? fileName : `${fileName}${fileType}`
}

/**
 * 创建文件 Blob 对象
 */
const createFileBlob = (response: Blob, fileType: FileType): Blob => {
  const mimeType = MIME_TYPE_MAP[fileType] || 'application/octet-stream'
  return new Blob([response], { type: mimeType })
}

/**
 * Edge 浏览器下载处理
 */
const handleEdgeDownload = (blob: Blob, fileName: string): boolean => {
  const edgeNavigator = navigator as Navigator & {
    msSaveOrOpenBlob?: (blob: Blob, fileName: string) => void
  }

  if ('msSaveOrOpenBlob' in navigator && edgeNavigator.msSaveOrOpenBlob) {
    edgeNavigator.msSaveOrOpenBlob(blob, fileName)
    return true
  }

  return false
}

/**
 * 现代浏览器下载处理
 */
const handleModernBrowserDownload = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  Object.assign(link, {
    href: url,
    download: fileName,
    style: 'display: none',
  })

  document.body.appendChild(link)
  link.click()

  // 延迟清理资源，确保下载完成
  setTimeout(() => {
    link.remove()
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * 执行文件下载
 */
const executeDownload = (blob: Blob, fileName: string): void => {
  // 优先尝试 Edge 浏览器处理
  if (handleEdgeDownload(blob, fileName)) {
    return
  }

  // 使用现代浏览器处理
  handleModernBrowserDownload(blob, fileName)
}

/**
 * 处理下载错误
 */
const handleDownloadError = (err: unknown, baseErrorMessage: string): never => {
  const errorMessage = `${baseErrorMessage}：${err instanceof Error ? err.message : '未知错误'}`
  throw new Error(errorMessage)
}

/**
 * 通用下载钩子函数
 * @param api 下载接口函数
 * @param config 下载配置
 * @returns Promise<void>
 */
export const useDownload = async (
  api: DownloadApiFunction,
  config: DownloadConfig
): Promise<void> => {
  const {
    fileName,
    fileType,
    params = {},
    showNotification = true,
    notificationConfig = {},
  } = config

  const notificationMessages = {
    ...DEFAULT_NOTIFICATION_CONFIG,
    ...notificationConfig,
  }

  try {
    // 显示加载通知
    if (showNotification) {
      showNotificationMessage('info', notificationMessages.loading)
    }

    // 调用 API 获取文件数据
    const response = await api(params)

    // 创建 Blob 对象和文件名
    const blob = createFileBlob(response, fileType)
    const fullFileName = getFullFileName(fileName, fileType)

    // 执行下载
    executeDownload(blob, fullFileName)

    // 显示成功通知
    if (showNotification) {
      showNotificationMessage('success', notificationMessages.success)
    }
  } catch (err) {
    // 显示错误通知
    if (showNotification) {
      showNotificationMessage(
        'error',
        `${notificationMessages.error}：${err instanceof Error ? err.message : '未知错误'}`,
        3000
      )
    }

    // 抛出错误
    handleDownloadError(err, notificationMessages.error)
  }
}

/**
 * 创建快捷下载方法
 */
const createQuickDownloadMethod = (fileType: FileType) => {
  return (
    api: DownloadApiFunction,
    fileName: string,
    params?: Record<string, unknown>
  ) => {
    return useDownload(api, {
      fileName,
      fileType,
      params,
    })
  }
}

/**
 * 快捷下载方法 - Excel
 */
export const useDownloadExcel = createQuickDownloadMethod(FileType.XLSX)

/**
 * 快捷下载方法 - CSV
 */
export const useDownloadCSV = createQuickDownloadMethod(FileType.CSV)

/**
 * 快捷下载方法 - PDF
 */
export const useDownloadPDF = createQuickDownloadMethod(FileType.PDF)

/**
 * 快捷下载方法 - JSON
 */
export const useDownloadJSON = createQuickDownloadMethod(FileType.JSON)

/**
 * 获取支持的文件类型列表
 */
export const getSupportedFileTypes = (): Array<{
  label: string
  value: FileType
}> => {
  return Object.values(FileType).map(type => ({
    label: type.toUpperCase().substring(1),
    value: type,
  }))
}
