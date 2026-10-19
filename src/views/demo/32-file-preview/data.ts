/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-19
 * @Description: 文件库样例与支持格式
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
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
    note: '工作表与任务数据',
    url: '/demo-files/delivery-plan.xlsx',
  },
  {
    id: 'guide',
    name: '产品使用指南.pdf',
    kind: 'PDF',
    note: '分页文档与下载',
    url: '/demo-files/product-guide.pdf',
  },
]
export const documentKind = (name: string) =>
  name.split('.').at(-1)?.toUpperCase() ?? ''
export const supportedDocument = (name: string) =>
  /\.(pdf|docx|xlsx|xls)$/i.test(name)
