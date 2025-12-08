/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-18 10:10:33
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-18 14:09:48
 * @FilePath: \Robot_Admin\src\composables\Table\useTableManager.ts
 * @Description: 表格统一状态管理器
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { computed, nextTick } from 'vue'
import type { DataTableRowKey } from 'naive-ui/es'
import type { DataRecord, ParentChildLinkMode } from '@/types/modules/table'
import { useRowEdit } from '@/composables/Table/useRowEdit'
import { useCellEdit } from '@/composables/Table/useCellEdit'
import { useModalEdit } from '@/composables/Table/useModalEdit'
import { useTableExpand } from '@/composables/Table/useTableExpand'
import {
  useDynamicRows,
  type DynamicRowsOptions,
} from '@/composables/Table/useDynamicRow'

/**
 * @description: 表格管理器配置接口
 */
interface TableManagerConfig {
  // 基础配置
  editable: boolean
  editMode: string
  showRowActions: boolean
  modalTitle: string
  modalWidth: number

  // 展开配置
  expandable: boolean
  defaultExpandedKeys?: DataTableRowKey[]
  onLoadExpandData?: (row: DataRecord) => Promise<any[]> | any[]
  renderExpandContent?: any
  rowExpandable?: (row: DataRecord) => boolean

  // 选择配置
  enableSelection: boolean
  defaultCheckedKeys?: DataTableRowKey[]
  rowCheckable?: (row: DataRecord) => boolean
  maxSelection?: number
  enableChildSelection: boolean
  childRowCheckable?: (childRow: any, parentRow: DataRecord) => boolean
  enableParentChildLink: boolean
  parentChildLinkMode: ParentChildLinkMode

  // 动态行配置
  dynamicRows?: DynamicRowsOptions<DataRecord>
}

/**
 * @description: 表格管理器参数接口
 */
interface TableManagerParams {
  config: TableManagerConfig
  data: () => DataRecord[]
  rowKey: (row: DataRecord) => DataTableRowKey
  emit: any
}

/**
 * @description: 事件处理器接口
 */
interface EventHandlers {
  onSave: (
    rowData: DataRecord,
    rowIndex: number,
    columnKey?: string
  ) => Promise<void>
  onCancel: (rowData: DataRecord, rowIndex: number) => void
  onExpandChange: (
    keys: DataTableRowKey[],
    row?: DataRecord,
    expanded?: boolean
  ) => void
  onSelectionChange: (
    checkedKeys: DataTableRowKey[],
    checkedRows: DataRecord[],
    childSelections: any
  ) => void
  onChildSelectionChange: (
    parentKey: DataTableRowKey,
    childKeys: DataTableRowKey[],
    childRows: any[]
  ) => void
  onRowChange: (data: DataRecord[]) => void
  onRowSelectionChange: (
    selectedKey: DataTableRowKey | null,
    selectedRow: DataRecord | null
  ) => void
  onRowAdd: (newRow: DataRecord) => void
  onRowDelete: (deletedRow: DataRecord, index: number) => void
  onRowCopy: (originalRow: DataRecord, newRow: DataRecord) => void
  onRowMove: (row: DataRecord, fromIndex: number, toIndex: number) => void
}

/**
 * @description: 表格统一状态管理器
 * @param params - 管理器参数
 * @return 管理器实例
 */
export function useTableManager(params: TableManagerParams) {
  const { config, data, rowKey, emit } = params

  // ================= 事件处理器工厂 =================

  /**
   * @description: 创建事件处理器集合
   * @return 事件处理器对象
   */
  const createEventHandlers = (): EventHandlers => ({
    // 通用事件
    onSave: async (
      rowData: DataRecord,
      rowIndex: number,
      columnKey?: string
    ) => {
      // 验证保存参数
      if (!rowData || rowIndex < 0 || rowIndex >= data().length) return

      const newData = [...data()]
      newData[rowIndex] = { ...newData[rowIndex], ...rowData }

      emit('update:data', newData)
      await nextTick()
      emit('save', newData[rowIndex], rowIndex, columnKey)
    },

    onCancel: (rowData: DataRecord, rowIndex: number) => {
      emit('cancel', rowData, rowIndex)
    },

    // 展开选择事件
    onExpandChange: (
      keys: DataTableRowKey[],
      row?: DataRecord,
      expanded?: boolean
    ) => {
      emit('expand-change', keys, row, expanded)
    },

    onSelectionChange: (
      checkedKeys: DataTableRowKey[],
      checkedRows: DataRecord[],
      childSelections: any
    ) => {
      emit('selection-change', checkedKeys, checkedRows, childSelections)
    },

    onChildSelectionChange: (
      parentKey: DataTableRowKey,
      childKeys: DataTableRowKey[],
      childRows: any[]
    ) => {
      emit('child-selection-change', parentKey, childKeys, childRows)
    },

    // 动态行事件
    onRowChange: (data: DataRecord[]) => {
      emit('update:data', data)
      config.dynamicRows?.onRowChange?.(data)
    },

    onRowSelectionChange: (
      selectedKey: DataTableRowKey | null,
      selectedRow: DataRecord | null
    ) => {
      emit('row-selection-change', selectedKey, selectedRow)
      config.dynamicRows?.onSelectionChange?.(selectedKey, selectedRow)
    },

    onRowAdd: (newRow: DataRecord) => {
      emit('row-add', newRow)
      config.dynamicRows?.onRowAdd?.(newRow)
    },

    onRowDelete: (deletedRow: DataRecord, index: number) => {
      emit('row-delete', deletedRow, index)
      config.dynamicRows?.onRowDelete?.(deletedRow, index)
    },

    onRowCopy: (originalRow: DataRecord, newRow: DataRecord) => {
      emit('row-copy', originalRow, newRow)
      config.dynamicRows?.onRowCopy?.(originalRow, newRow)
    },

    onRowMove: (row: DataRecord, fromIndex: number, toIndex: number) => {
      emit('row-move', row, fromIndex, toIndex)
      config.dynamicRows?.onRowMove?.(row, fromIndex, toIndex)
    },
  })

  const eventHandlers = createEventHandlers()

  // ================= 功能状态初始化 =================

  /**
   * @description: 初始化编辑功能状态
   */
  const initEditStates = () => {
    // 行编辑功能
    const rowEdit = useRowEdit({
      data,
      rowKey,
      onSave: eventHandlers.onSave,
      onCancel: eventHandlers.onCancel,
    })

    // 单元格编辑功能
    const cellEdit = useCellEdit({
      data,
      rowKey,
      onSave: eventHandlers.onSave,
    })

    // 模态框编辑功能
    const modalEdit = useModalEdit({
      data,
      rowKey,
      onSave: eventHandlers.onSave,
      onCancel: eventHandlers.onCancel,
    })

    return { rowEdit, cellEdit, modalEdit }
  }

  /**
   * @description: 初始化展开功能状态
   */
  const initExpandState = () => {
    const needsExpand =
      config.expandable || config.enableSelection || config.enableChildSelection

    if (!needsExpand) return null

    return useTableExpand({
      data: computed(() => data()),
      rowKey,
      childRowKey: (child: any) => child.id,

      // 配置
      defaultExpandedKeys: config.defaultExpandedKeys,
      onLoadData: config.onLoadExpandData,
      renderContent: config.renderExpandContent,
      rowExpandable: config.rowExpandable,
      enableSelection: config.enableSelection,
      defaultCheckedKeys: config.defaultCheckedKeys,
      rowCheckable: config.rowCheckable,
      maxSelection: config.maxSelection,
      enableChildSelection: config.enableChildSelection,
      childRowCheckable: config.childRowCheckable,
      enableParentChildLink: config.enableParentChildLink,
      parentChildLinkMode: config.parentChildLinkMode,

      // 事件
      onExpandChange: eventHandlers.onExpandChange,
      onSelectionChange: eventHandlers.onSelectionChange,
      onChildSelectionChange: eventHandlers.onChildSelectionChange,
    })
  }

  /**
   * @description: 初始化动态行功能状态
   */
  const initDynamicRowsState = () => {
    if (!config.dynamicRows) return null

    const dynamicOptions: DynamicRowsOptions<DataRecord> = {
      ...config.dynamicRows,
      onRowChange: eventHandlers.onRowChange,
      onSelectionChange: eventHandlers.onRowSelectionChange,
      onRowAdd: eventHandlers.onRowAdd,
      onRowDelete: eventHandlers.onRowDelete,
      onRowCopy: eventHandlers.onRowCopy,
      onRowMove: eventHandlers.onRowMove,
    }

    return useDynamicRows(
      computed(() => data()),
      dynamicOptions
    )
  }

  // 初始化所有功能状态
  const editStates = initEditStates()
  const expandState = initExpandState()
  const dynamicRowsState = initDynamicRowsState()

  // ================= 统一的状态管理器 =================

  /**
   * @description: 创建统一的状态管理器
   * @return 状态管理器对象
   */
  const createStateManager = () => {
    return {
      // 编辑控制
      edit: {
        /**
         * @description: 开始编辑
         */
        start(rowKey: DataTableRowKey, columnKey?: string) {
          const mode = config.editMode
          if (mode === 'modal') editStates.modalEdit.startEdit(rowKey)
          else if (mode === 'cell' && columnKey)
            editStates.cellEdit.startEditCell(rowKey, columnKey)
          else if (mode === 'row' || mode === 'both')
            editStates.rowEdit.startEditRow(rowKey)
        },

        /**
         * @description: 取消编辑
         */
        cancel() {
          if (editStates.modalEdit.isModalVisible.value)
            editStates.modalEdit.cancelEdit()
          else if (editStates.cellEdit.editingCell.value.rowKey)
            editStates.cellEdit.cancelEditCell()
          else if (editStates.rowEdit.editingRowKey.value)
            editStates.rowEdit.cancelEditRow()
        },

        /**
         * @description: 保存编辑
         */
        async save() {
          if (editStates.modalEdit.isModalVisible.value)
            await editStates.modalEdit.saveEdit()
          else if (editStates.cellEdit.editingCell.value.rowKey)
            await editStates.cellEdit.saveEditCell()
          else if (editStates.rowEdit.editingRowKey.value)
            await editStates.rowEdit.saveEditRow()
        },

        /**
         * @description: 是否正在编辑
         */
        isEditing(rowKey: DataTableRowKey, columnKey?: string) {
          if (config.editMode === 'modal')
            return editStates.modalEdit.isEditingRow(rowKey)
          if (columnKey)
            return editStates.cellEdit.isEditingCell(rowKey, columnKey)
          return editStates.rowEdit.isEditingRow(rowKey)
        },

        /**
         * @description: 获取当前编辑数据
         */
        getEditingData() {
          if (editStates.modalEdit.isModalVisible.value)
            return editStates.modalEdit.editingData
          if (editStates.rowEdit.editingRowKey.value) {
            return editStates.rowEdit.getEditingRowData(
              editStates.rowEdit.editingRowKey.value!
            )
          }
          return null
        },
      },

      // 展开控制
      expand: {
        /**
         * @description: 展开行
         */
        async row(rowKey: DataTableRowKey) {
          if (expandState) {
            const currentKeys = [...expandState.expandedKeys.value]
            if (!currentKeys.includes(rowKey)) {
              currentKeys.push(rowKey)
              expandState.handleExpandChange(currentKeys)
            }
          }
        },

        /**
         * @description: 折叠行
         */
        collapse(rowKey: DataTableRowKey) {
          if (expandState) {
            const currentKeys = expandState.expandedKeys.value.filter(
              key => key !== rowKey
            )
            expandState.handleExpandChange(currentKeys)
          }
        },

        /**
         * @description: 展开折叠切换
         */
        async toggle(rowKey: DataTableRowKey) {
          if (expandState?.expandedKeys.value.includes(rowKey)) {
            this.collapse(rowKey)
          } else {
            await this.row(rowKey)
          }
        },

        /**
         * @description: 展开所有行
         */
        async all() {
          await expandState?.expandAll()
        },
        /**
         * @description: 折叠所有行
         */
        collapseAll() {
          expandState?.collapseAll()
        },
        /**
         * @description: 检查行是否已展开
         */
        isExpanded(rowKey: DataTableRowKey) {
          return expandState?.expandedKeys.value.includes(rowKey) ?? false
        },
      },

      // 选择控制
      selection: {
        /**
         * @description: 选择指定行
         */
        select(rowKey: DataTableRowKey) {
          if (
            expandState?.checkedKeys.value &&
            !expandState.checkedKeys.value.includes(rowKey)
          ) {
            const newKeys = [...expandState.checkedKeys.value, rowKey]
            expandState.handleSelectionChange(newKeys)
          }
        },

        /**
         * @description: 取消选择指定行
         */
        unselect(rowKey: DataTableRowKey) {
          if (expandState?.checkedKeys.value) {
            const newKeys = expandState.checkedKeys.value.filter(
              key => key !== rowKey
            )
            expandState.handleSelectionChange(newKeys)
          }
        },

        /**
         * @description: 选择所有行
         */
        all() {
          expandState?.selectAll()
        },

        /**
         * @description: 清除所有行选择
         */
        clear() {
          expandState?.clearSelection()
        },

        /**
         * @description: 检查行是否已选择
         */
        isSelected(rowKey: DataTableRowKey) {
          return expandState?.checkedKeys.value.includes(rowKey) ?? false
        },

        /**
         * @description: 获取所有已选择的行数据
         */
        getSelected() {
          if (!expandState?.checkedKeys.value) return []
          return data().filter(row =>
            expandState!.checkedKeys.value.includes(rowKey(row))
          )
        },
      },

      // 子选择控制
      childSelection: {
        /**
         * @description: 选择指定父行下的子行
         */
        select(parentKey: DataTableRowKey, childKey: DataTableRowKey) {
          if (expandState?.childSelections.value) {
            const current =
              expandState.childSelections.value.get(parentKey) || []
            if (!current.includes(childKey)) {
              const newSelection = [...current, childKey]
              expandState.childSelections.value.set(parentKey, newSelection)
              emit('child-selection-change', parentKey, newSelection, [])
            }
          }
        },

        /**
         * @description: 取消选择指定父行下的子行
         */
        unselect(parentKey: DataTableRowKey, childKey: DataTableRowKey) {
          if (expandState?.childSelections.value) {
            const current =
              expandState.childSelections.value.get(parentKey) || []
            const newSelection = current.filter(k => k !== childKey)
            expandState.childSelections.value.set(parentKey, newSelection)
            emit('child-selection-change', parentKey, newSelection, [])
          }
        },

        /**
         * @description: 选择指定父行下的所有子行
         */
        selectAll(parentKey: DataTableRowKey) {
          if (
            expandState?.childSelections.value &&
            expandState.expandDataMap?.value
          ) {
            const expandData =
              expandState.expandDataMap.value.get(parentKey) || []
            const allChildKeys = expandData.map((child: any) => child.id)
            expandState.childSelections.value.set(parentKey, allChildKeys)
            emit('child-selection-change', parentKey, allChildKeys, expandData)
          }
        },

        /**
         * @description: 清除指定父行下的所有子行选择
         */
        clear(parentKey: DataTableRowKey) {
          if (expandState?.childSelections.value) {
            expandState.childSelections.value.set(parentKey, [])
            emit('child-selection-change', parentKey, [], [])
          }
        },

        /**
         * @description: 获取指定父行下所有已选择的子行数据
         */
        getSelected(parentKey: DataTableRowKey) {
          if (
            !expandState?.childSelections.value ||
            !expandState.expandDataMap?.value
          ) {
            return []
          }
          const selectedKeys =
            expandState.childSelections.value.get(parentKey) || []
          const expandData =
            expandState.expandDataMap.value.get(parentKey) || []
          return expandData.filter((child: any) =>
            selectedKeys.includes(child.id)
          )
        },
      },

      // 动态行控制
      dynamicRows: {
        /**
         * @description: 添加行
         */
        add() {
          dynamicRowsState?.addRow()
        },
        /**
         * @description: 插入行
         */
        insert() {
          dynamicRowsState?.insertRow()
        },

        /**
         * @description: 删除行
         */
        delete() {
          dynamicRowsState?.deleteRow()
        },
        /**
         * @description: 复制行
         */
        copy() {
          dynamicRowsState?.copyRow()
        },
        /**
         * @description:  上移动态行
         */
        moveUp() {
          dynamicRowsState?.moveRowUp()
        },
        /**
         * @description: 下移动态行
         */
        moveDown() {
          dynamicRowsState?.moveRowDown()
        },
        /**
         * @description: 清空动态行数据
         */
        clearSelection() {
          dynamicRowsState?.clearSelection()
        },
        /**
         * @description: 获取当前选中的动态行数据
         */
        getSelected() {
          return dynamicRowsState?.selectedRowData.value || null
        },

        /**
         * @description: 打印表格
         */
        async print(elementRef?: HTMLElement) {
          if (dynamicRowsState && elementRef) {
            await dynamicRowsState.handlePrint(ref(elementRef))
          }
        },

        /**
         * @description: 导出表格数据
         */
        async download(elementRef?: HTMLElement, filename?: string) {
          if (dynamicRowsState && elementRef) {
            await dynamicRowsState.handleDownload(ref(elementRef), filename)
          }
        },
      },

      //
      /**
       * @description: 清除所有选择
       */
      clearAllSelections() {
        expandState?.clearAllSelections()
      },
    }
  }

  const stateManager = createStateManager()

  // ================= 计算属性 =================

  const expandedKeys = computed(() => expandState?.expandedKeys.value ?? [])
  const checkedKeys = computed(() => expandState?.checkedKeys.value ?? [])

  // ================= 返回管理器实例 =================

  return {
    // 编辑状态
    editStates,

    // 功能状态
    expandState,
    dynamicRowsState,

    // 状态管理器
    stateManager,

    // 计算属性
    expandedKeys,
    checkedKeys,

    // 事件处理器
    eventHandlers,
  }
}
