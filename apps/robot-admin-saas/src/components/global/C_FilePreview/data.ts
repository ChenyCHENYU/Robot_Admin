import * as XLSX from 'xlsx'
import mammoth from 'mammoth'

// ==================== 类型定义 ====================
export interface Props {
  file?: File
  url?: string
  fileName?: string
  autoPreview?: boolean
}

export interface ExcelCell {
  value: any
  rowspan?: number
  colspan?: number
  merged?: boolean
  hidden?: boolean
  style?: any
}

export interface ExcelRow {
  [key: string]: ExcelCell
}

export interface ExcelSheet {
  name: string
  data: ExcelRow[]
  merges: any[]
  columns: any[]
}

export interface Heading {
  id: string
  text: string
  level: number
}

export interface FileConfig {
  tagType: string
  icon: string
  color: string
}

export interface ZoomConfig {
  min: number
  max: number
  step: number
  default: number
}

// ==================== 常量配置 ====================
export const FILE_TYPE_MAP: Record<string, string> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
}

export const FILE_CONFIGS: Record<string, FileConfig> = {
  pdf: {
    tagType: 'error',
    icon: 'ic:outline-picture-as-pdf',
    color: '#dc2626',
  },
  word: { tagType: 'info', icon: 'ic:outline-description', color: '#2563eb' },
  excel: { tagType: 'success', icon: 'ic:outline-grid-on', color: '#16a34a' },
  unknown: {
    tagType: 'default',
    icon: 'ic:outline-insert-drive-file',
    color: '#6b7280',
  },
}

export const ZOOM_CONFIGS = {
  pdf: { min: 0.5, max: 3, step: 0.25, default: 1 },
  word: { min: 50, max: 200, step: 10, default: 100 },
} as const

export const PAGE_SIZE_OPTIONS = [20, 50, 100, 200]

export const FULLSCREEN_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
]

// ==================== 工具函数 ====================
export const extractFileNameFromUrl = (url: string): string => {
  try {
    const urlPath = url.split('/').pop() || url.split('\\').pop()
    if (urlPath?.includes('.')) {
      const decodedName = decodeURIComponent(urlPath.split('?')[0])
      if (decodedName && decodedName !== url) return decodedName
    }
  } catch (error) {
    console.warn('解析URL文件名失败:', error)
  }
  return '未知文件'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export const getFileType = (fileName: string): string => {
  if (!fileName || fileName === '未知文件') return 'unknown'
  const ext = fileName.toLowerCase().split('.').pop()
  if (!ext) return 'unknown'
  return FILE_TYPE_MAP[ext] || 'unknown'
}

export const getFileConfig = (fileType: string): FileConfig => {
  return FILE_CONFIGS[fileType] || FILE_CONFIGS.unknown
}

export const createZoomHandler = (
  valueRef: Ref<number>,
  config: ZoomConfig
) => {
  return (action: 'in' | 'out' | 'reset') => {
    const { min, max, step, default: defaultValue } = config
    switch (action) {
      case 'reset':
        valueRef.value = defaultValue
        break
      case 'in':
        if (valueRef.value < max) valueRef.value += step
        break
      case 'out':
        if (valueRef.value > min) valueRef.value -= step
        break
    }
  }
}

// ==================== Excel相关工具函数 ====================
export const getColumnLetter = (index: number): string => {
  let result = ''
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result
    index = Math.floor(index / 26) - 1
  }
  return result
}

export const formatCellValue = (value: any): string => {
  if (!value) return ''
  const strValue = String(value).trim()

  if (!isNaN(Number(strValue)) && strValue !== '' && strValue.length < 15) {
    const num = Number(strValue)
    return Number.isInteger(num)
      ? num.toLocaleString()
      : num.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  return strValue
}

export const getCellClass = (value: any): string => {
  if (!value) return 'cell-empty'
  const strValue = String(value).trim()

  if (!isNaN(Number(strValue)) && strValue !== '') return 'cell-number'
  if (strValue.match(/[■▬▪▫─━]/)) return 'cell-gantt'
  if (
    strValue.match(/^\d{4}[-/]\d{2}[-/]\d{2}/) ||
    strValue.match(/^\d{2}[-/]\d{2}[-/]\d{4}/)
  )
    return 'cell-date'
  if (['true', 'false'].includes(strValue.toLowerCase())) return 'cell-boolean'
  return strValue.length > 20 ? 'cell-text cell-long' : 'cell-text'
}

export const processExcelSheet = (worksheet: any, merges: any[]) => {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
  const { c: maxCol, r: maxRow } = range.e

  // 生成列配置
  const columns = Array.from({ length: maxCol + 1 }, (_, c) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c })
    const cell = worksheet[cellAddress]
    const columnName = cell ? String(cell.v || '').trim() : `列${c + 1}`
    return {
      title: columnName || `列${c + 1}`,
      key: `col_${c}`,
      width: Math.min(Math.max(columnName.length * 12, 80), 200),
    }
  })

  // 创建合并单元格映射
  const mergeMap = new Map()
  merges.forEach(({ s: { r: sRow, c: sCol }, e: { r: eRow, c: eCol } }) => {
    for (let r = sRow; r <= eRow; r++) {
      for (let c = sCol; c <= eCol; c++) {
        mergeMap.set(`${r}-${c}`, {
          isMain: r === sRow && c === sCol,
          rowspan: eRow - sRow + 1,
          colspan: eCol - sCol + 1,
        })
      }
    }
  })

  // 处理数据
  const data = Array.from({ length: maxRow + 1 }, (_, r) => {
    const row: ExcelRow = {}
    for (let c = 0; c <= maxCol; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c })
      const cell = worksheet[cellAddress]
      const mergeInfo = mergeMap.get(`${r}-${c}`)

      row[`col_${c}`] = {
        value: cell ? cell.v || '' : '',
        merged: !!mergeInfo,
        hidden: mergeInfo && !mergeInfo.isMain,
        rowspan: mergeInfo?.isMain ? mergeInfo.rowspan : 1,
        colspan: mergeInfo?.isMain ? mergeInfo.colspan : 1,
      }
    }
    return row
  })

  return { data, columns }
}

// ==================== 文件加载器 ====================
export const createFileLoaders = (refs: {
  pdfUrl: Ref<string>
  totalPages: Ref<number>
  wordContent: Ref<string>
  headings: Ref<Heading[]>
  excelSheets: Ref<ExcelSheet[]>
  activeSheet: Ref<string>
  excelData: Ref<ExcelRow[]>
  excelColumns: Ref<any[]>
}) => {
  const {
    pdfUrl,
    totalPages,
    wordContent,
    headings,
    excelSheets,
    activeSheet,
    excelData,
    excelColumns,
  } = refs

  return {
    pdf: async (file: File) => {
      const fileUrl = URL.createObjectURL(file)
      pdfUrl.value = fileUrl + '#toolbar=1&navpanes=1&scrollbar=1&view=FitH'
      totalPages.value = 1
    },

    word: async (file: File) => {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({
        arrayBuffer,
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Title'] => h1.title:fresh",
        ],
      } as any)

      wordContent.value = result.value
      await nextTick()

      // 提取标题
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = wordContent.value
      const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.value = Array.from(headingElements).map((el, index) => {
        const id = `heading-${index}`
        const level = parseInt(el.tagName.charAt(1))
        const text = el.textContent || ''

        wordContent.value = wordContent.value.replace(
          el.outerHTML,
          el.outerHTML.replace(
            el.tagName.toLowerCase(),
            `${el.tagName.toLowerCase()} id="${id}"`
          )
        )

        return { id, text, level }
      })
    },

    excel: async (file: File) => {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
      })

      if (!workbook.SheetNames.length) {
        throw new Error('Excel文件中没有找到工作表')
      }

      excelSheets.value = workbook.SheetNames.map(name => {
        const worksheet = workbook.Sheets[name]
        const merges = worksheet['!merges'] || []
        const { data, columns } = processExcelSheet(worksheet, merges)
        return { name, data, merges, columns }
      })

      if (excelSheets.value.length > 0) {
        const [currentSheet] = excelSheets.value
        activeSheet.value = currentSheet.name
        excelData.value = currentSheet.data
        excelColumns.value = currentSheet.columns
      }
    },
  }
}

// ==================== 全屏相关工具函数 ====================
export const createFullscreenToggler = (
  modalContainer: Ref<HTMLElement | undefined>
) => {
  return async () => {
    const element = modalContainer.value
    if (!element) return

    const isCurrentlyFullscreen = !!document.fullscreenElement

    const fullscreenMethods = {
      request: [
        () => element.requestFullscreen(),
        () => (element as any).webkitRequestFullscreen(),
        () => (element as any).mozRequestFullScreen(),
        () => (element as any).msRequestFullscreen(),
      ],
      exit: [
        () => document.exitFullscreen(),
        () => (document as any).webkitExitFullscreen(),
        () => (document as any).mozCancelFullScreen(),
        () => (document as any).msExitFullscreen(),
      ],
    }

    const methods = isCurrentlyFullscreen
      ? fullscreenMethods.exit
      : fullscreenMethods.request

    const tryMethods = (methods: (() => Promise<any>)[]) => {
      return methods.reduce<Promise<boolean>>((prevPromise, method) => {
        return prevPromise.then(success => {
          if (success) {
            return true
          }
          return method()
            .then(() => true)
            .catch(() => false)
        })
      }, Promise.resolve(false))
    }

    try {
      const success = await tryMethods(methods as (() => Promise<any>)[])
      if (success) {
        return
      }
    } catch {
      console.warn('无法切换全屏状态')
    }
  }
}
