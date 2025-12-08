/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-08 16:09:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-08 18:40:06
 * @FilePath: \Robot_Admin\src\hooks\useExcel\index.ts
 * @Description: 基于 xlsx 库的 Excel 操作封装 excel
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { type Ref, type ComputedRef } from 'vue'
import * as XLSX from 'xlsx'
import type { WorkBook } from 'xlsx'
import { createDiscreteApi } from 'naive-ui/es/discrete'

const { message } = createDiscreteApi(['message'])

export interface ExcelData {
  [key: string]: any[]
}

export interface ExcelConfig {
  fileName?: string
  sheetName?: string
  autoFitColumns?: boolean
}

export interface ExcelTemplate {
  name: string
  headers: string[]
  description?: string
}

export interface UseExcelReturn {
  // 状态
  loading: Ref<boolean>
  error: Ref<string | null>

  // 数据
  workbook: Ref<WorkBook | null>
  sheets: ComputedRef<string[]>
  data: Ref<ExcelData>

  // 基础方法
  readFile: (file: File) => Promise<ExcelData>
  exportToExcel: (data: any[], config?: ExcelConfig) => Promise<void>
  exportMultipleSheets: (
    sheetsData: Record<string, any[]>,
    fileName?: string
  ) => Promise<void>

  // 模板方法
  generateTemplate: (template: ExcelTemplate) => Promise<void>
  getPresetTemplates: () => ExcelTemplate[]

  // 工具方法
  clearData: () => void
  clearError: () => void
}

/**
 * * @description 处理工作表数据
 * ? @param worksheet - 工作表对象
 * ! @return any[] - 处理后的数据
 */
const processWorksheetData = (worksheet: XLSX.WorkSheet): any[] => {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  })

  if (jsonData.length === 0) return []

  const headers = (jsonData[0] as string[]).map(h => String(h).trim())
  const rows = jsonData.slice(1) as any[][]

  return rows
    .filter(row =>
      row.some(cell => cell !== '' && cell !== null && cell !== undefined)
    )
    .map((row, index) => {
      const obj: any = {}
      headers.forEach((header, colIndex) => {
        obj[header] = row[colIndex] !== undefined ? row[colIndex] : ''
      })
      obj.__rowIndex = index + 2
      return obj
    })
}

/**
 * * @description 清理数据（移除内部字段）
 * ? @param data - 原始数据
 * ! @return any[] - 清理后的数据
 */
const cleanExportData = (data: any[]): any[] => {
  return data.map(row => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { __rowIndex, ...cleanRow } = row
    return cleanRow
  })
}

/**
 * * @description 设置工作表列宽
 * ? @param ws - 工作表对象
 * ? @param data - 数据
 */
const setColumnWidths = (ws: XLSX.WorkSheet, data: any[]): void => {
  if (data.length === 0) return

  const colWidths = Object.keys(data[0]).map(key => {
    const maxLength = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    )
    return { wch: Math.min(Math.max(maxLength, 10), 30) }
  })
  ws['!cols'] = colWidths
}

/**
 * * @description Excel操作的Vue3 Composition API Hook
 * ? @return UseExcelReturn - 包含所有Excel操作方法和状态的对象
 */
export function useExcel(): UseExcelReturn {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const workbook = ref<WorkBook | null>(null)
  const data = ref<ExcelData>({})

  const sheets = computed(() => {
    return workbook.value?.SheetNames || []
  })

  const clearError = () => {
    error.value = null
  }

  const clearData = () => {
    workbook.value = null
    data.value = {}
    clearError()
  }

  const readFile = async (file: File): Promise<ExcelData> => {
    loading.value = true
    clearError()

    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, {
        type: 'buffer',
        cellDates: true,
        cellNF: true,
        cellText: false,
      })

      workbook.value = wb
      const result: ExcelData = {}

      wb.SheetNames.forEach(sheetName => {
        const worksheet = wb.Sheets[sheetName]
        result[sheetName] = processWorksheetData(worksheet)
      })

      data.value = result
      message.success(`成功读取 ${wb.SheetNames.length} 个工作表`)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '读取文件失败'
      error.value = errorMessage
      message.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportToExcel = async (
    data: any[],
    config: ExcelConfig = {}
  ): Promise<void> => {
    const {
      fileName = `导出数据_${new Date().toISOString().split('T')[0]}.xlsx`,
      sheetName = 'Sheet1',
      autoFitColumns = true,
    } = config

    try {
      loading.value = true

      const wb = XLSX.utils.book_new()
      const cleanData = cleanExportData(data)
      const ws = XLSX.utils.json_to_sheet(cleanData)

      if (autoFitColumns) {
        setColumnWidths(ws, cleanData)
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName)
      XLSX.writeFile(wb, fileName)

      message.success(`${fileName} 导出成功！`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导出失败'
      error.value = errorMessage
      message.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportMultipleSheets = async (
    sheetsData: Record<string, any[]>,
    fileName = `多表导出_${new Date().toISOString().split('T')[0]}.xlsx`
  ): Promise<void> => {
    try {
      loading.value = true
      const wb = XLSX.utils.book_new()

      Object.entries(sheetsData).forEach(([sheetName, sheetData]) => {
        const cleanData = cleanExportData(sheetData)
        const ws = XLSX.utils.json_to_sheet(cleanData)
        setColumnWidths(ws, cleanData)
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
      })

      XLSX.writeFile(wb, fileName)
      message.success(`${fileName} 导出成功！`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导出失败'
      error.value = errorMessage
      message.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPresetTemplates = (): ExcelTemplate[] => {
    return [
      {
        name: '员工信息',
        headers: [
          '姓名',
          '部门',
          '职位',
          '薪资',
          '入职日期',
          '联系电话',
          '邮箱',
        ],
        description: '员工基本信息登记表',
      },
      {
        name: '商品清单',
        headers: [
          '商品名称',
          '规格型号',
          '单价',
          '数量',
          '总价',
          '供应商',
          '备注',
        ],
        description: '商品库存管理表',
      },
      {
        name: '财务报表',
        headers: ['日期', '科目', '借方金额', '贷方金额', '摘要', '凭证号'],
        description: '财务记账凭证',
      },
    ]
  }

  const generateTemplate = async (template: ExcelTemplate): Promise<void> => {
    try {
      loading.value = true
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([template.headers])
      ws['!cols'] = template.headers.map(() => ({ wch: 15 }))

      XLSX.utils.book_append_sheet(wb, ws, template.name)
      XLSX.writeFile(wb, `${template.name}模板.xlsx`)

      message.success(`${template.name}模板下载成功！`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成模板失败'
      error.value = errorMessage
      message.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    loading,
    error,

    // 数据
    workbook,
    sheets,
    data,

    // 方法
    readFile,
    exportToExcel,
    exportMultipleSheets,
    generateTemplate,
    getPresetTemplates,
    clearData,
    clearError,
  }
}
