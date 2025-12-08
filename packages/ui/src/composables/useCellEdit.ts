/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 19:42:42
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-14 21:06:56
 * @FilePath: \Robot_Admin\src\components\global\C_Table\composables\useCellEdit.ts
 * @Description:  可编辑单元格组合函数
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { DataTableRowKey } from 'naive-ui/es'

/**
 * * @description 单元格编辑配置选项
 * ? @property data - 获取表格数据的函数
 * ? @property rowKey - 获取行唯一标识的函数
 * ? @property onSave - 保存回调函数，接收更新的行数据、行索引和列键
 */
export interface CellEditOptions {
  data: () => any[] // 🔥 简化：使用函数获取最新数据
  rowKey: (row: any) => DataTableRowKey
  onSave?: (
    rowData: any,
    rowIndex: number,
    columnKey: string
  ) => void | Promise<void>
}

/**
 * * @description 可编辑单元格组合函数，提供表格单元格的编辑功能
 * ? @param options - 单元格编辑配置选项
 * ! @return 返回编辑状态和操作方法的对象
 */
export function useCellEdit(options: CellEditOptions) {
  const editingCell = ref<{
    rowKey: DataTableRowKey | null
    columnKey: string | null
  }>({
    rowKey: null,
    columnKey: null,
  })
  const editingData = ref<Record<string, any>>({})

  /**
   * * @description 检查指定单元格是否正在编辑状态
   * ? @param rowKey - 行唯一标识
   * ? @param columnKey - 列键名
   * ! @return 是否正在编辑该单元格
   */
  const isEditingCell = (rowKey: DataTableRowKey, columnKey: string) => {
    return (
      editingCell.value.rowKey === rowKey &&
      editingCell.value.columnKey === columnKey
    )
  }

  /**
   * * @description 根据rowKey实时查找最新的行数据
   * ? @param rowKey - 行唯一标识
   * ! @return 行数据或null
   */
  const findRowData = (rowKey: DataTableRowKey) => {
    const currentData = options.data()
    if (!currentData || !Array.isArray(currentData)) {
      return null
    }
    return currentData.find(row => options.rowKey(row) === rowKey)
  }

  /**
   * * @description 开始编辑指定单元格，将原值存储到编辑缓存中
   * ? @param rowKey - 行唯一标识
   * ? @param columnKey - 列键名
   * ! @return 无返回值
   */
  const startEditCell = (rowKey: DataTableRowKey, columnKey: string) => {
    // 🔥 修复：使用最新数据查找
    const rowData = findRowData(rowKey)
    if (!rowData) return

    editingCell.value = { rowKey, columnKey }
    editingData.value[`${rowKey}-${columnKey}`] = rowData[columnKey]
  }

  /**
   * * @description 保存当前编辑的单元格，调用保存回调并清理编辑状态
   * ! @return Promise<保存结果对象 | undefined>，包含更新的数据、行索引和列键
   */
  const saveEditCell = async () => {
    const { rowKey, columnKey } = editingCell.value
    if (!rowKey || !columnKey) return

    const currentData = options.data()
    if (!currentData || !Array.isArray(currentData)) return

    // 🔥 修复：使用最新数据查找索引
    const rowIndex = currentData.findIndex(
      row => options.rowKey(row) === rowKey
    )
    if (rowIndex === -1) return

    const cellKey = `${rowKey}-${columnKey}`
    const newValue = editingData.value[cellKey]

    // 🔥 修复：基于最新数据构建更新数据
    const updatedData = {
      ...currentData[rowIndex],
      [columnKey]: newValue,
    }

    await options.onSave?.(updatedData, rowIndex, columnKey)

    editingCell.value = { rowKey: null, columnKey: null }
    delete editingData.value[cellKey]

    return { updatedData, rowIndex, columnKey }
  }

  /**
   * * @description 取消当前单元格编辑，清理编辑状态和缓存数据
   * ! @return 无返回值
   */
  const cancelEditCell = () => {
    const { rowKey, columnKey } = editingCell.value
    if (rowKey && columnKey) {
      delete editingData.value[`${rowKey}-${columnKey}`]
    }
    editingCell.value = { rowKey: null, columnKey: null }
  }

  /**
   * * @description 获取指定单元格的编辑中数值
   * ? @param rowKey - 行唯一标识
   * ? @param columnKey - 列键名
   * ! @return 编辑中的单元格值
   */
  const getEditingCellValue = (rowKey: DataTableRowKey, columnKey: string) => {
    return editingData.value[`${rowKey}-${columnKey}`]
  }

  /**
   * * @description 更新指定单元格的编辑中数值
   * ? @param rowKey - 行唯一标识
   * ? @param columnKey - 列键名
   * ? @param value - 新的值
   * ! @return 无返回值
   */
  const updateEditingCellValue = (
    rowKey: DataTableRowKey,
    columnKey: string,
    value: any
  ) => {
    editingData.value[`${rowKey}-${columnKey}`] = value
  }

  return {
    editingCell,
    isEditingCell,
    startEditCell,
    saveEditCell,
    cancelEditCell,
    getEditingCellValue,
    updateEditingCellValue,
    findRowData,
  }
}
