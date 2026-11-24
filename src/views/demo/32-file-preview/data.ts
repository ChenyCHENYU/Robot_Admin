/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 文件库样例与支持格式
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { AttachmentItem } from '@robot-admin/naive-ui-components/C_Attachments'

export interface PreviewDocument {
  id: string
  name: string
  kind: string
  note: string
  url?: string
  file?: File
}
export const SAMPLE_DOCUMENTS: PreviewDocument[] = [
  {
    id: 'brief',
    name: '项目协作说明.docx',
    kind: 'DOCX',
    note: '标题、段落与协作规范',
    url: '/demo-files/project-brief.docx',
  },
  {
    id: 'plan',
    name: '迭代交付计划.xlsx',
    kind: 'XLSX',
    note: '两张工作表，交付阶段跨页合并',
    url: '/demo-files/delivery-merge-example.xlsx',
  },
  {
    id: 'guide',
    name: '产品使用指南.pdf',
    kind: 'PDF',
    note: '分页文档与下载',
    url: '/demo-files/product-guide.pdf',
  },
]

export const SUPPLEMENTAL_ATTACHMENTS: AttachmentItem[] = [
  {
    id: 'delivery-review',
    name: '交付验收记录.docx',
    category: '文档',
    description: '可与项目协作说明切换，查看独立文档目录',
    url: '/demo-files/delivery-review-example.docx',
  },
  {
    id: 'cover',
    name: '项目封面.svg',
    category: '图片',
    description: '在同一份附件清单里预览图片',
    url: '/demo-files/ocean-poster.svg',
  },
]
export const documentKind = (name: string) =>
  name.split('.').at(-1)?.toUpperCase() ?? ''
export const supportedDocument = (name: string) =>
  /\.(pdf|docx|xlsx|xls)$/i.test(name)
