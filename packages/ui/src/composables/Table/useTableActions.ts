/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-09-02
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-02 17:25:16
 * @FilePath: \Robot_Admin\src\composables\Table\useTableActions.ts
 * @Description: 表格操作按钮Hook - 优化简洁版
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { VNodeChild } from 'vue'
import type {
  DataRecord,
  ApiFunction,
  UseTableActionsOptions,
  UseTableActionsReturn,
} from '@/types/modules/table'
import type { DataTableRowKey } from 'naive-ui/es'
import C_Icon from '@/components/global/C_Icon/index.vue'

/**
 * 表格操作Hook
 */
export function useTableActions<T extends DataRecord = DataRecord>(
  options: UseTableActionsOptions<T>
): UseTableActionsReturn<T> {
  const { actions, config, tableManager, rowKey, emit, onViewDetail } = options
  const message = useMessage()
  const dialog = useDialog()

  // 检查操作是否启用
  const isActionEnabled = (key: 'edit' | 'delete' | 'detail') =>
    actions.value?.[key] !== false

  // 类型守卫：检查是否为有效API函数
  const isValidApiFunction = <TData extends DataRecord>(
    action: false | ApiFunction<TData> | undefined
  ): action is ApiFunction<TData> => {
    return action !== false && typeof action === 'function'
  }

  // 自动提取API响应数据
  const extractApiResponseData = <TData>(response: any): TData => {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }

  // 创建按钮的通用方法
  const createButton = (
    icon: string,
    title: string,
    type = 'primary',
    onClick: () => void
  ) =>
    h(NButton, { size: 'small', type, quaternary: true, onClick }, () => [
      h(C_Icon, { name: icon, size: 14, title }),
    ])

  // 处理编辑操作
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = (row: T, index: number) => {
    const rowKeyValue = rowKey(row)
    const editAction = actions.value?.edit

    if (config.value.editMode === 'modal') {
      tableManager.editStates.modalEdit.startEdit(
        rowKeyValue,
        { ...row },
        editAction
      )
    } else {
      tableManager.editStates.rowEdit.startEditRow(rowKeyValue, editAction)
    }
  }

  // 执行删除API（拆分复杂逻辑）
  const executeDelete = async (
    deleteAction: ApiFunction<T>,
    row: T,
    index: number
  ) => {
    try {
      await deleteAction(row, index)
      message.success('删除成功')
      emit('row-delete', row, index)
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
      throw error // 错误抛出逻辑
    }
  }

  // 处理删除操作
  const handleDelete = (row: T, index: number) => {
    const deleteAction = actions.value?.delete

    if (!isValidApiFunction(deleteAction)) {
      return
    }

    dialog.warning({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => executeDelete(deleteAction, row, index),
    })
  }

  // 处理详情操作
  const handleDetail = async (row: T, index: number) => {
    const detailAction = actions.value?.detail

    if (!isValidApiFunction(detailAction)) {
      // 默认行为：直接显示当前行数据
      onViewDetail?.(row)
      return
    }

    // 调用API获取详情数据
    try {
      const apiResponse = await detailAction(row, index)
      // 自动提取API响应数据
      const detailData = extractApiResponseData<T>(apiResponse)
      onViewDetail?.(detailData || row)
    } catch (error) {
      console.error('获取详情失败:', error)
      message.error('获取详情失败')
      // 发生错误时仍然显示原始数据
      onViewDetail?.(row)
    }
  }

  // 渲染行编辑按钮
  const renderRowEditButtons = (rowKeyValue: DataTableRowKey) => {
    const isEditing = tableManager.editStates.rowEdit.isEditingRow(rowKeyValue)

    if (isEditing) {
      return [
        createButton('mdi:check', '保存', 'primary', () =>
          tableManager.editStates.rowEdit.saveEditRow()
        ),
        createButton('mdi:close', '取消', 'default', () =>
          tableManager.editStates.rowEdit.cancelEditRow()
        ),
      ]
    }

    return [
      createButton('mdi:pencil', '编辑', 'warning', () =>
        tableManager.editStates.rowEdit.startEditRow(rowKeyValue)
      ),
    ]
  }

  // 渲染基础操作按钮
  const renderBasicActions = (row: T, index: number) => {
    const buttons: VNodeChild[] = []

    // 详情按钮
    if (isActionEnabled('detail')) {
      buttons.push(
        createButton('mdi:eye', '详情', 'info', () => handleDetail(row, index))
      )
    }

    // 编辑按钮（仅模态框模式）
    if (
      config.value.editMode === 'modal' &&
      (isActionEnabled('edit') || config.value.editable)
    ) {
      buttons.push(
        createButton('mdi:pencil', '编辑', 'warning', () =>
          handleEdit(row, index)
        )
      )
    }

    // 删除按钮
    if (isActionEnabled('delete')) {
      buttons.push(
        createButton('mdi:delete', '删除', 'error', () =>
          handleDelete(row, index)
        )
      )
    }

    return buttons
  }

  // 渲染自定义操作下拉菜单
  const renderCustomDropdown = (row: T, index: number) => {
    const customActions = actions.value?.custom
    if (!customActions?.length) return null

    // 过滤可见的操作
    const visibleActions = customActions.filter(action =>
      action.show ? action.show(row, index) : true
    )

    if (!visibleActions.length) return null

    // 构建下拉选项
    const options = visibleActions.map(action => {
      // 解析可能是函数的属性
      const label =
        typeof action.label === 'function'
          ? action.label(row, index)
          : action.label
      const icon =
        typeof action.icon === 'function'
          ? action.icon(row, index)
          : action.icon

      return {
        label,
        key: action.key,
        icon: () => h(C_Icon, { name: icon, size: 14 }),
        disabled: action.disabled?.(row, index) || false,
      }
    })

    return h(
      NDropdown,
      {
        options,
        onSelect: (key: string) => {
          const action = visibleActions.find(a => a.key === key)
          if (action) {
            try {
              action.onClick(row, index)
            } catch (error) {
              console.error(`操作"${action.label}"执行失败:`, error)
              message.error(`${action.label}失败`)
            }
          }
        },
      },
      () => createButton('mdi:dots-horizontal', '更多操作', 'default', () => {})
    )
  }

  // 主渲染方法
  const renderActions = (row: T, index: number): VNodeChild => {
    // 完全自定义渲染
    if (actions.value?.render) {
      return actions.value.render(row, index)
    }

    const rowKeyValue = rowKey(row)
    const isRowEditMode = ['row', 'both'].includes(config.value.editMode)

    // 行编辑模式且正在编辑时，只显示保存/取消按钮
    if (
      isRowEditMode &&
      tableManager.editStates.rowEdit.isEditingRow(rowKeyValue)
    ) {
      return h(NSpace, { size: 2, wrap: false }, () =>
        renderRowEditButtons(rowKeyValue)
      )
    }

    // 组合所有按钮
    const allButtons = [
      ...(isRowEditMode ? renderRowEditButtons(rowKeyValue) : []),
      ...renderBasicActions(row, index),
    ]

    // 添加自定义操作下拉菜单
    const dropdown = renderCustomDropdown(row, index)
    if (dropdown) allButtons.push(dropdown)

    return h(NSpace, { size: 2, wrap: false }, () => allButtons)
  }

  return { renderActions, isActionEnabled }
}
