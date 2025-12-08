<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-09-22 21:46:48
 * @FilePath: \Robot_Admin\src\components\global\C_Table\index.vue
 * @Description: 超级表格组件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 -->

<template>
  <div class="c-table-wrapper">
    <!-- 动态行工具栏 -->
    <component
      v-if="tableManager.dynamicRowsState"
      :is="tableManager.dynamicRowsState.renderToolbar()"
    />

    <!-- 表格主体 -->
    <NDataTable
      ref="tableRef"
      v-bind="tableProps"
      :columns="computedColumns"
      :data="pagination.paginatedData.value"
      :loading="loading"
      :row-key="rowKey"
      :expanded-row-keys="tableManager.expandedKeys.value"
      :checked-row-keys="tableManager.checkedKeys.value"
      :render-expand="renderExpandFunction"
      @update:expanded-row-keys="tableManager.expandState?.handleExpandChange"
      @update:checked-row-keys="tableManager.expandState?.handleSelectionChange"
      :scroll-x="props.scrollX"
    />

    <!-- 分页组件 -->
    <NPagination
      v-if="pagination.paginationConfig.value"
      v-bind="pagination.paginationConfig.value"
      class="pagination-wrapper"
    />

    <!-- 编辑模态框 -->
    <TableEditModal
      v-if="config.editMode === 'modal'"
      v-model:visible="tableManager.editStates.modalEdit.isModalVisible.value"
      :editing-data="tableManager.editStates.modalEdit.editingData.value"
      :title="config.modalTitle"
      :width="config.modalWidth"
      :form-options="formOptions"
      :form-key="formKey"
      @save="handleModalSave"
      @cancel="tableManager.editStates.modalEdit.cancelEdit"
    />

    <!-- 动态行确认删除模态框 -->
    <component
      v-if="tableManager.dynamicRowsState"
      :is="tableManager.dynamicRowsState.renderConfirmModal()"
    />
  </div>
</template>

<script setup lang="ts">
  import type { VNodeChild, ComponentPublicInstance } from 'vue'
  import { type DataTableRowKey, type DataTableColumn } from 'naive-ui/es'
  import type {
    TableColumn,
    TableProps,
    TableEmits,
    DataRecord,
    ParentChildLinkMode,
    SimpleTableActions,
  } from '@/types/modules/table'
  import type { DynamicRowsOptions } from '@/composables/Table/useDynamicRow'
  import { useTableManager } from '@/composables/Table/useTableManager'
  import { usePagination } from '@/composables/Table/usePagination'
  import { useTableActions } from '@/composables/Table/useTableActions'
  import TableEditModal from './components/TableEditModal.vue'
  import {
    generateFormOptions,
    getTableProps,
    createUnifiedConfig,
    createEditModeChecker,
    renderEditComponent,
    renderDisplayCell,
    renderEditingCell,
    renderEditableCell,
    type TablePresetConfig,
  } from './data'

  // ================= 类型定义 =================
  interface EnhancedTableProps<T extends DataRecord = DataRecord>
    extends TableProps<T> {
    preset?: TablePresetConfig<T>
    actions?: SimpleTableActions<T>
    expandable?: boolean
    onLoadExpandData?: (row: T) => Promise<any[]> | any[]
    renderExpandContent?: (
      row: T,
      expandData: any[],
      loading: boolean,
      childSelection?: any
    ) => VNodeChild
    rowExpandable?: (row: T) => boolean
    defaultExpandedKeys?: DataTableRowKey[]
    enableSelection?: boolean
    defaultCheckedKeys?: DataTableRowKey[]
    rowCheckable?: (row: T) => boolean
    maxSelection?: number
    enableChildSelection?: boolean
    childRowCheckable?: (childRow: any, parentRow: T) => boolean
    enableParentChildLink?: boolean
    parentChildLinkMode?: ParentChildLinkMode
    dynamicRowsOptions?: DynamicRowsOptions<T>
  }

  // ================= Props & Emit =================
  const props = withDefaults(defineProps<EnhancedTableProps>(), {
    rowKey: (row: DataRecord) => row.id,
    loading: false,
    striped: true,
    bordered: true,
    singleLine: true,
    size: 'medium',
    editable: true,
    editMode: 'both',
    showRowActions: true,
    modalTitle: '编辑数据',
    modalWidth: 600,
    columnWidth: 180,
    expandable: false,
    enableSelection: false,
    enableChildSelection: false,
    enableParentChildLink: false,
    parentChildLinkMode: 'loose',
    dynamicRowsOptions: undefined,
    preset: undefined,
    actions: () => ({}),
    pagination: () => true,
  })

  const emit = defineEmits<
    TableEmits & {
      'row-add': [newRow: DataRecord]
      'row-delete': [deletedRow: DataRecord, index: number]
      'row-copy': [originalRow: DataRecord, newRow: DataRecord]
      'row-move': [row: DataRecord, fromIndex: number, toIndex: number]
      'row-selection-change': [
        selectedKey: DataTableRowKey | null,
        selectedRow: DataRecord | null,
      ]
      'pagination-change': [page: number, pageSize: number]
      'view-detail': [data: DataRecord]
    }
  >()

  // ================= 响应式状态 =================
  const tableRef = ref<ComponentPublicInstance>()

  // ================= 计算属性 =================
  const config = computed(() => ({
    ...createUnifiedConfig(props),
    parentChildLinkMode: props.parentChildLinkMode as ParentChildLinkMode,
  }))

  const editableColumns = computed(() =>
    props.columns.filter((col): col is TableColumn => col.editable !== false)
  )

  const tableProps = computed(() => getTableProps(props))

  const formKey = computed(
    () =>
      `edit-form-${tableManager.editStates.modalEdit.editingRowKey.value || 'new'}`
  )

  const formOptions = computed(() => generateFormOptions(editableColumns.value))

  const renderExpandFunction = computed(() => undefined)

  const editModeChecker = computed(() => createEditModeChecker(config.value))

  // ================= Hooks 初始化 =================

  // 分页 Hook
  const pagination = usePagination({
    data: toRef(props, 'data'),
    config: computed(() => config.value.pagination),
    emit,
  })

  // 表格管理器
  const tableManager = useTableManager({
    config: config.value,
    data: () => props.data,
    rowKey: props.rowKey,
    emit,
  })

  // 操作按钮 Hook - 简化处理
  const tableActions = useTableActions({
    actions: computed(() => props.actions || {}),
    config,
    tableManager,
    rowKey: props.rowKey,
    emit,
    onViewDetail: (data: DataRecord) => emit('view-detail', data),
  })

  // ================= 事件处理 =================

  /**
   * 处理模态框保存
   */
  const handleModalSave = async (formData: DataRecord) => {
    try {
      await tableManager.editStates.modalEdit.saveEdit(formData)
    } catch (error) {
      console.error('模态框保存失败:', error)
    }
  }

  // ================= 单元格渲染函数 =================
  const renderCell = (
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild => {
    const value = rowData[column.key]
    const rowKey = props.rowKey(rowData)

    if (editModeChecker.value.isNonEditable(column)) {
      return renderDisplayCell(column, rowData, rowIndex, value)
    }

    if (
      editModeChecker.value.isRowEditMode() &&
      tableManager.editStates.rowEdit.isEditingRow(rowKey)
    ) {
      return renderEditComponent(
        column,
        tableManager.editStates.rowEdit.getEditingRowData(rowKey)?.[
          column.key
        ] ?? value,
        val =>
          tableManager.editStates.rowEdit.updateEditingRowData(
            rowKey,
            column.key,
            val
          )
      )
    }

    if (editModeChecker.value.isCellEditMode()) {
      const isEditingCell = tableManager.editStates.cellEdit.isEditingCell(
        rowKey,
        column.key
      )

      return isEditingCell
        ? renderEditingCell(
            column,
            tableManager.editStates.cellEdit.getEditingCellValue(
              rowKey,
              column.key
            ) ?? rowData[column.key],
            val =>
              tableManager.editStates.cellEdit.updateEditingCellValue(
                rowKey,
                column.key,
                val
              ),
            () => tableManager.editStates.cellEdit.saveEditCell(),
            () => tableManager.editStates.cellEdit.cancelEditCell()
          )
        : renderEditableCell(column, rowData, rowIndex, value, () =>
            tableManager.editStates.cellEdit.startEditCell(rowKey, column.key)
          )
    }

    return renderDisplayCell(column, rowData, rowIndex, value)
  }

  // ================= 计算列配置 =================
  // 🆕 修改 computedColumns 支持固定列
  const computedColumns = computed((): DataTableColumn[] => {
    let columns: DataTableColumn[] = props.columns.map(column => {
      // 🔥 自动处理序号列
      if (column.type === 'index') {
        return {
          key: '_index',
          title: column.title || '序号',
          width: column.width || 50,
          titleAlign: 'center' as const,
          align: 'center' as const,
          render: (_: DataRecord, index: number) => index + 1,
          // 序号列不参与编辑系统
          editable: false,
          // 🆕 支持序号列固定
          fixed: column.fixed,
        }
      }

      // 其他原有处理逻辑 + 固定列处理
      return {
        ...column,
        width: column.width || props.columnWidth,
        titleAlign: column.titleAlign || ('center' as const),
        align: column.align || ('center' as const), // 🎯 默认居中对齐
        render:
          column.render ||
          ((rowData: DataRecord, rowIndex: number) =>
            renderCell(column, rowData, rowIndex)),
        // 🆕 添加固定列支持
        fixed: column.fixed,
      }
    }) as DataTableColumn[]

    // 功能列增强
    if (tableManager.dynamicRowsState) {
      columns = tableManager.dynamicRowsState.enhanceColumns(
        columns as any
      ) as DataTableColumn[]
    }

    if (
      tableManager.expandState &&
      (config.value.expandable || config.value.enableSelection)
    ) {
      columns = tableManager.expandState.getTableColumns(
        columns as any
      ) as DataTableColumn[]
    }

    // 🆕 操作列 - 支持固定
    columns.push({
      key: '_actions',
      title: '操作',
      align: 'center' as const,
      titleAlign: 'center' as const,
      render: tableActions.renderActions,
      // 🆕 操作列固定到右侧
      fixed: 'right',
    })

    return columns
  })

  // 解构出需要的管理器
  const { edit, expand, selection, dynamicRows } = tableManager.stateManager

  defineExpose({
    // 核心方法
    startEdit: edit.start,
    expandAll: expand.all,
    collapseAll: expand.collapseAll,
    selectAll: selection.all,
    clearSelection: selection.clear,
    clearAllSelections: tableManager.stateManager.clearAllSelections,
    clearRowSelection: dynamicRows?.clearSelection,
    resetToFirstPage: pagination.resetToFirstPage,

    // 获取状态方法
    getSelectedRows: selection.getSelected,
    getEditingData: edit.getEditingData,
    isEditing: edit.isEditing,
    isExpanded: expand.isExpanded,

    // 逃生通道
    getManager: () => tableManager.stateManager,
  })
</script>

<style scoped lang="scss">
  @use './index.scss';

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
</style>
