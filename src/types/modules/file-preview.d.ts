/**
 * C_FilePreview 文件预览组件类型定义
 */

/** 支持的文件类型 */
type FilePreviewType = 'pdf' | 'word' | 'excel' | 'unknown'

/** 文件类型配置 */
interface FileConfig {
  tagType: string
  icon: string
  color: string
}

/** 缩放配置 */
interface ZoomConfig {
  min: number
  max: number
  step: number
  default: number
}

/** Excel 单元格 */
interface ExcelCell {
  value: any
  rowspan?: number
  colspan?: number
  merged?: boolean
  hidden?: boolean
  style?: any
}

/** Excel 行数据 */
interface ExcelRow {
  [key: string]: ExcelCell
}

/** Excel 列配置 */
interface ExcelColumn {
  title: string
  key: string
  width: number
}

/** Excel 工作表 */
interface ExcelSheet {
  name: string
  data: ExcelRow[]
  merges: any[]
  columns: ExcelColumn[]
}

/** Word 文档标题 */
interface DocHeading {
  id: string
  text: string
  level: number
}

/** 文件预览组件 Props */
interface FilePreviewProps {
  file?: File
  url?: string
  fileName?: string
  autoPreview?: boolean
}

/** 文件加载结果 — PDF */
interface PdfLoadResult {
  url: string
  totalPages: number
}

/** 文件加载结果 — Word */
interface WordLoadResult {
  content: string
  headings: DocHeading[]
}

/** 文件加载结果 — Excel */
interface ExcelLoadResult {
  sheets: ExcelSheet[]
}
