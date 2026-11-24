/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\30-excel-all\\useExcelWorkbook.ts
 * @Description: 工作簿读取、工作表选择及同一份原始行的预览与处理
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { UploadFileInfo } from 'naive-ui'
import type { TableColumn } from '@robot-admin/naive-ui-components/C_Table'
import type { ExcelRow, UseExcelReturn } from '@robot-admin/file-utils'
import {
  PREVIEW_ROWS,
  hasNonEmptyCell,
  type DataSummary,
  type RecordOperation,
} from './data'

const columnsFor = (rows: ExcelRow[]): TableColumn[] =>
  Object.keys(rows[0] ?? {})
    .filter(key => key !== '__rowIndex')
    .map(key => ({ title: key, key, width: 120, ellipsis: true }))

/** 行键仅属于 C_Table 展示副本，原始和处理后的数据都可以直接导出。 */
const withPreviewKeys = (rows: ExcelRow[]) =>
  rows.map((row, index) => ({ ...row, __previewRowKey: index }))

/** 常规导入与内置样本共用一个工作簿，处理结果跟随当前工作表失效。 */
export function useExcelWorkbook(
  excel: UseExcelReturn,
  record: RecordOperation
) {
  const message = useMessage()
  const reading = ref(false)
  const loading = computed(() => reading.value || excel.loading.value)
  const fileList = ref<UploadFileInfo[]>([])
  const selectedSheet = ref('')
  const showAll = ref(false)
  const rows = computed(() => excel.data.value[selectedSheet.value] ?? [])
  const sheetOptions = computed(() =>
    excel.sheets.value.map(sheet => ({ label: sheet, value: sheet }))
  )
  const processed = ref<ExcelRow[]>([])
  const summary = ref<DataSummary | null>(null)
  const columns = computed(() => columnsFor(rows.value))
  const preview = computed(() => ({
    columns: columns.value,
    rows: withPreviewKeys(
      showAll.value ? rows.value : rows.value.slice(0, PREVIEW_ROWS)
    ),
  }))
  const processedPreview = computed(() => ({
    columns: columnsFor(processed.value),
    rows: withPreviewKeys(processed.value.slice(0, 5)),
  }))
  const resetProcessing = () => {
    processed.value = []
    summary.value = null
  }
  watch(selectedSheet, resetProcessing)

  const read = async (fileInfo: UploadFileInfo) => {
    if (!fileInfo.file) return false
    try {
      await excel.readFile(fileInfo.file)
      selectedSheet.value = excel.sheets.value[0] ?? ''
      fileList.value = [fileInfo]
      resetProcessing()
      record('文件导入', `成功导入文件：${fileInfo.name}`)
      return true
    } catch (error) {
      record(
        '文件导入',
        `导入失败：${error instanceof Error ? error.message : '未知错误'}`,
        'error'
      )
      return false
    }
  }

  const upload = ({ file }: { file: UploadFileInfo }) => {
    if (!loading.value) return read(file)
  }
  const loadSample = async () => {
    if (loading.value) return false
    reading.value = true
    try {
      const response = await fetch('/demo-files/delivery-plan.xlsx')
      if (!response.ok) throw new Error('示例文件不可用')
      const file = new File([await response.blob()], '迭代交付计划.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      return await read({
        id: crypto.randomUUID(),
        name: file.name,
        status: 'finished',
        file,
      })
    } catch {
      message.error('示例工作簿读取失败，请选择本地文件')
      return false
    } finally {
      reading.value = false
    }
  }
  const clear = () => {
    if (loading.value) return
    selectedSheet.value = ''
    fileList.value = []
    resetProcessing()
    excel.clearData()
    record('清除数据', '清除所有文件数据')
  }
  const filterEmpty = () => {
    if (!rows.value.length) return
    const valid = rows.value.filter(hasNonEmptyCell)
    processed.value = valid
    message.success(`筛选完成，共 ${valid.length} 条有效数据`)
    record('数据筛选', `筛选出${valid.length}条非空数据`)
  }
  const summarize = () => {
    const totalRows = rows.value.length
    if (!totalRows) return
    const validRows = rows.value.filter(hasNonEmptyCell).length
    summary.value = {
      totalRows,
      validRows,
      emptyRows: totalRows - validRows,
      totalFields: columns.value.length,
    }
    message.info(`统计完成：总计 ${totalRows} 行，有效 ${validRows} 行`)
    record('数据统计', `统计${totalRows}行数据，有效${validRows}行`)
  }

  return proxyRefs({
    loading,
    error: excel.error,
    dismissError: excel.clearError,
    fileList,
    sheets: excel.sheets,
    selectedSheet,
    sheetOptions,
    rows,
    showAll,
    preview,
    processed,
    processedPreview,
    summary,
    upload,
    loadSample,
    clear,
    filterEmpty,
    summarize,
  })
}
