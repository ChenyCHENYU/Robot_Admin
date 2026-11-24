/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-07
 * @FilePath: \Robot_Admin\src\views\demo\19-download-all\data.ts
 * @Description: 19-download-all 页面数据与统一表格配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import { FileType, type DownloadApiFunction } from '@robot-admin/file-utils'
import { NTag } from 'naive-ui'
import { delayWithSignal } from '@/utils/abort'

/**
 * * @description 生成简单的PDF内容（英文避免乱码）
 * ? @param title - PDF标题
 * ? @param content - PDF内容描述
 * ! @return PDF格式的字符串
 */
export const generateSimplePDF = (title: string, content: string): string => {
  const escape = (text: string) =>
    text.replace(/[^\x20-\x7E]/g, '').replace(/[()\\]/g, char => `\\${char}`)
  const stream = `BT /F1 20 Tf 50 750 Td (${escape(title)}) Tj 0 -36 Td /F1 12 Tf (${escape(content)}) Tj 0 -28 Td (Robot Admin - local download example) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let document = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(document.length)
    document += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = document.length
  return `${document}xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map(offset => `${String(offset).padStart(10, '0')} 00000 n `)
    .join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
}

const createWorkbookContent = async (
  _params: Record<string, unknown>,
  signal?: AbortSignal
) => {
  const response = await fetch('/demo-files/users-report.xlsx', { signal })
  if (!response.ok) throw new Error('示例工作簿暂时不可用')
  return {
    content: await response.blob(),
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
}

type FileFixture = (
  params: Record<string, unknown>,
  signal?: AbortSignal
) =>
  | { content: Blob | string; mimeType: string }
  | Promise<{ content: Blob | string; mimeType: string }>

const generators = {
  [FileType.XLSX]: createWorkbookContent,
  [FileType.CSV]: () => ({
    content:
      'Order ID,Customer,Product,Quantity,Amount,Date\nORD001,John Doe,Keyboard,2,299.00,2024-01-15\nORD002,Jane Smith,Monitor,1,599.00,2024-01-16',
    mimeType: 'text/csv',
  }),
  [FileType.PDF]: () => ({
    content: generateSimplePDF(
      'Product List',
      'Demo products: Keyboard, Monitor, Docking Station'
    ),
    mimeType: 'application/pdf',
  }),
  [FileType.JSON]: params => ({
    content: JSON.stringify(
      {
        config: { product: 'Robot Admin', environment: 'demo' },
        params,
        exportTime: new Date().toISOString(),
      },
      null,
      2
    ),
    mimeType: 'application/json',
  }),
  [FileType.TXT]: params => ({
    content: `System Log File\nGenerated: ${new Date().toISOString()}\nParameters: ${JSON.stringify(params)}\n\n[INFO] Demo service started`,
    mimeType: 'text/plain',
  }),
} satisfies Partial<Record<FileType, FileFixture>>

export type DemoFileType = keyof typeof generators

export const DOWNLOAD_FORMATS = {
  [FileType.XLSX]: {
    extension: 'XLSX',
    name: '用户数据报表',
    action: '下载 Excel',
    description: '可编辑工作簿，便于整理与协作',
    icon: 'mdi:microsoft-excel',
  },
  [FileType.CSV]: {
    extension: 'CSV',
    name: '订单统计',
    action: '下载 CSV',
    description: '通用表格格式，适合交换数据',
    icon: 'mdi:file-csv-outline',
  },
  [FileType.PDF]: {
    extension: 'PDF',
    name: '商品清单',
    action: '下载 PDF',
    description: '固定排版，适合阅读与分享',
    icon: 'mdi:file-pdf-box',
  },
  [FileType.JSON]: {
    extension: 'JSON',
    name: '配置信息',
    action: '下载 JSON',
    description: '保留数据结构，便于程序处理',
    icon: 'mdi:code-json',
  },
  [FileType.TXT]: {
    extension: 'TXT',
    name: '系统日志',
    action: '下载文本',
    description: '可直接阅读的纯文本',
    icon: 'mdi:file-document-outline',
  },
} satisfies Record<
  DemoFileType,
  {
    extension: string
    name: string
    action: string
    description: string
    icon: string
  }
>

export const QUICK_DOWNLOAD_TYPES = [
  FileType.XLSX,
  FileType.CSV,
  FileType.PDF,
  FileType.JSON,
] as const
export const BATCH_DOWNLOAD_TYPES = [
  ...QUICK_DOWNLOAD_TYPES,
  FileType.TXT,
] as const
export const FORM_DOWNLOAD_TYPES = BATCH_DOWNLOAD_TYPES.map(value => ({
  value,
  label: DOWNLOAD_FORMATS[value].extension,
}))

/** 同一格式始终由同一内容源生成，文件类型与实际内容保持一致。 */
export const createMockApi =
  (fileType: DemoFileType): DownloadApiFunction =>
  async (params = {}, context) => {
    await delayWithSignal(500, context?.signal)
    const generate: FileFixture = generators[fileType]
    const { content, mimeType } = await generate(params, context?.signal)
    return new Blob([content], { type: mimeType })
  }

export interface HistoryItem {
  id: number
  fileName: string
  fileType: string
  status: 'success' | 'failed'
  downloadTime: string
}

export const historyColumns: TableColumn<HistoryItem>[] = [
  { title: '文件名', key: 'fileName' },
  { title: '类型', key: 'fileType' },
  {
    title: '状态',
    key: 'status',
    render: row =>
      h(
        NTag,
        { type: row.status === 'success' ? 'success' : 'error', size: 'small' },
        () => (row.status === 'success' ? '成功' : '失败')
      ),
  },
  { title: '下载时间', key: 'downloadTime' },
]
