/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 19:42:33
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-15 13:19:56
 * @FilePath: \Robot_Admin\src\composables\Table\useRowEdit.ts
 * @Description:  可编辑行组合函数，提供表格整行的编辑功能
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { type DataTableRowKey, NButton, NSpace, NIcon } from 'naive-ui/es'

/**
 * * @description 行编辑配置选项
 * ? @property data - 获取表格数据的函数
 * ? @property rowKey - 获取行唯一标识的函数
 * ? @property onSave - 保存回调函数，接收更新的行数据和行索引
 * ? @property onCancel - 取消回调函数，接收原始行数据和行索引
 */
export interface RowEditOptions {
  data: () => any[] // 🔥 简化：使用函数获取最新数据
  rowKey: (row: any) => DataTableRowKey
  onSave?: (rowData: any, rowIndex: number) => void | Promise<void>
  onCancel?: (rowData: any, rowIndex: number) => void
}

/**
 * * @description 可编辑行组合函数，提供表格整行的编辑功能
 * ? @param options - 行编辑配置选项
 * ! @return 返回编辑状态和操作方法的对象
 */
export function useRowEdit(options: RowEditOptions) {
  const editingRowKey = ref<DataTableRowKey | null>(null)
  const editingData = ref<Record<string, any>>({})

  /**
   * * @description 检查指定行是否正在编辑状态
   * ? @param rowKey - 行唯一标识
   * ! @return 是否正在编辑该行
   */
  const isEditingRow = (rowKey: DataTableRowKey) => {
    return editingRowKey.value === rowKey
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
   * * @description 开始编辑指定行，将原始数据复制到编辑缓存中
   * ? @param rowKey - 行唯一标识
   * ! @return 无返回值
   */
  const startEditRow = (rowKey: DataTableRowKey) => {
    // 🔥 修复：使用最新数据查找
    const rowData = findRowData(rowKey)
    if (!rowData) return

    editingRowKey.value = rowKey
    editingData.value[rowKey as string] = { ...rowData }
  }

  /**
   * * @description 取消当前行编辑，调用取消回调并清理编辑状态
   * ! @return Promise<void>
   */
  const cancelEditRow = async () => {
    if (!editingRowKey.value) return

    const currentData = options.data()
    if (!currentData || !Array.isArray(currentData)) return

    // 🔥 修复：使用最新数据查找索引
    const rowIndex = currentData.findIndex(
      row => options.rowKey(row) === editingRowKey.value
    )

    if (rowIndex > -1) {
      await options.onCancel?.(currentData[rowIndex], rowIndex)
    }

    editingRowKey.value = null
    editingData.value = {}
  }

  /**
   * * @description 保存当前行编辑，调用保存回调并清理编辑状态
   * ! @return Promise<保存结果对象 | undefined>，包含更新的数据和行索引
   */
  const saveEditRow = async () => {
    if (!editingRowKey.value) return

    const rowKey = editingRowKey.value
    const currentData = options.data()
    if (!currentData || !Array.isArray(currentData)) return

    // 🔥 修复：使用最新数据查找索引
    const rowIndex = currentData.findIndex(
      row => options.rowKey(row) === rowKey
    )

    if (rowIndex === -1) return

    const updatedData = editingData.value[rowKey as string]
    if (!updatedData) return

    await options.onSave?.(updatedData, rowIndex)

    editingRowKey.value = null
    editingData.value = {}

    return { updatedData, rowIndex }
  }

  /**
   * * @description 获取指定行的编辑中数据
   * ? @param rowKey - 行唯一标识
   * ! @return 编辑中的行数据对象
   */
  const getEditingRowData = (rowKey: DataTableRowKey) => {
    return editingData.value[rowKey as string]
  }

  /**
   * * @description 更新指定行编辑中的字段值
   * ? @param rowKey - 行唯一标识
   * ? @param field - 字段名
   * ? @param value - 新的值
   * ! @return 无返回值
   */
  const updateEditingRowData = (
    rowKey: DataTableRowKey,
    field: string,
    value: any
  ) => {
    if (!editingData.value[rowKey as string]) return
    editingData.value[rowKey as string][field] = value
  }

  /**
   * * @description 渲染行操作按钮，根据编辑状态显示编辑按钮或保存取消按钮组
   * ? @param rowKey - 行唯一标识
   * ! @return Vue渲染函数创建的按钮元素
   */
  const renderRowActions = (rowKey: DataTableRowKey) => {
    if (isEditingRow(rowKey)) {
      return h(
        NSpace,
        { size: 8 },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                onClick: saveEditRow,
              },
              {
                default: () => [
                  h(NIcon, { size: 16 }, () =>
                    h('i', { class: 'i-mdi:content-save' })
                  ),
                  '保存',
                ],
              }
            ),
            h(
              NButton,
              {
                size: 'small',
                onClick: cancelEditRow,
              },
              {
                default: () => [
                  h(NIcon, { size: 16 }, () =>
                    h('i', { class: 'i-mdi:close' })
                  ),
                  '取消',
                ],
              }
            ),
          ],
        }
      )
    }

    return h(
      NButton,
      {
        size: 'small',
        type: 'primary',
        quaternary: true,
        onClick: () => startEditRow(rowKey),
      },
      {
        default: () => [
          h(NIcon, { size: 16 }, () => h('i', { class: 'i-mdi:pencil' })),
          '编辑',
        ],
      }
    )
  }

  return {
    editingRowKey,
    isEditingRow,
    startEditRow,
    cancelEditRow,
    saveEditRow,
    getEditingRowData,
    updateEditingRowData,
    renderRowActions,
    findRowData,
  }
}
