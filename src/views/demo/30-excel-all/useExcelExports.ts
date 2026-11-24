/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\30-excel-all\\useExcelExports.ts
 * @Description: 使用工作簿快照执行当前页的单表、多表、模板与处理结果导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { ExcelTemplate, UseExcelReturn } from '@robot-admin/file-utils'
import { sampleData, type RecordOperation } from './data'
import type { useExcelWorkbook } from './useExcelWorkbook'

/** 导出选项不写回原始工作簿；入队下载仍由任务场景管理。 */
export function useExcelExports(
  excel: UseExcelReturn,
  workbook: ReturnType<typeof useExcelWorkbook>,
  record: RecordOperation
) {
  const message = useMessage()
  const config = reactive({ fileName: '', sheetName: '' })
  const selectedSheets = ref<string[]>([])

  watch(
    [() => workbook.fileList[0], () => workbook.selectedSheet],
    ([file, sheet], [previousFile]) => {
      config.sheetName = sheet
      if (file === previousFile) return
      config.fileName = file
        ? file.name.replace(/\.[^/.]+$/, '') || '导出数据'
        : ''
      selectedSheets.value = sheet ? [sheet] : []
    }
  )

  const run = async (
    operation: string,
    description: string,
    generate: () => Promise<void>
  ) => {
    if (workbook.loading) return
    try {
      await generate()
      record(operation, description)
    } catch (error) {
      record(
        operation,
        `生成失败：${error instanceof Error ? error.message : '未知错误'}`,
        'error'
      )
    }
  }

  const exportSheet = () => {
    const { rows, selectedSheet } = workbook
    if (!rows.length || !selectedSheet) {
      message.warning('请先选择包含数据的工作表')
      return
    }
    return run('单表导出', `导出工作表：${selectedSheet}`, () =>
      excel.exportToExcel(rows, {
        fileName: config.fileName || '导出数据.xlsx',
        sheetName: config.sheetName || selectedSheet,
      })
    )
  }
  const exportSheets = () => {
    const sheets = Object.fromEntries(
      selectedSheets.value
        .filter(name =>
          Object.prototype.hasOwnProperty.call(excel.data.value, name)
        )
        .map(name => [name, excel.data.value[name]])
    )
    const count = Object.keys(sheets).length
    if (!count) {
      message.warning('请选择要导出的工作表')
      return
    }
    return run('多表导出', `导出${count}个工作表`, () =>
      excel.exportMultipleSheets(sheets)
    )
  }
  const exportSample = () =>
    run('示例导出', '导出员工信息示例数据', () =>
      excel.exportToExcel(sampleData, {
        fileName: '员工信息示例.xlsx',
        sheetName: '员工列表',
      })
    )
  const downloadTemplate = (template: ExcelTemplate) =>
    run('模板下载', `下载模板：${template.name}`, () =>
      excel.generateTemplate(template)
    )
  const exportProcessed = () => {
    const rows = workbook.processed
    if (!rows.length) return
    return run('导出处理结果', `导出${rows.length}条处理后数据`, () =>
      excel.exportToExcel(rows, {
        fileName: `处理结果_${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: '处理结果',
      })
    )
  }

  return proxyRefs({
    config,
    selectedSheets,
    templates: excel.getPresetTemplates(),
    exportSheet,
    exportSheets,
    exportSample,
    downloadTemplate,
    exportProcessed,
  })
}
