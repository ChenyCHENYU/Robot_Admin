<!--
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-13 18:38:58
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-10 09:27:22
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

    <!-- 表格工具栏 -->
    <div
      v-if="showToolbar"
      class="table-toolbar"
    >
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right" />
        <!-- 设置面板按钮 -->
        <C_Icon
          v-if="enableColumnSettings"
          name="mdi:cog"
          size="18"
          title="表格设置"
          clickable
          class="column-settings-btn"
          @click="showSettingsPanel = true"
        />
      </div>
    </div>

    <!-- 表格主体 -->
    <NDataTable
      ref="tableRef"
      v-bind="tableProps"
      :columns="computedColumns"
      :data="props.data"
      :loading="loading"
      :row-key="rowKey"
      :expanded-row-keys="tableManager.expandedKeys.value"
      :checked-row-keys="tableManager.checkedKeys.value"
      :render-expand="renderExpandFunction"
      @update:expanded-row-keys="tableManager.expandState?.handleExpandChange"
      @update:checked-row-keys="tableManager.expandState?.handleSelectionChange"
      :scroll-x="computedScrollX"
      style="width: 100%"
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

    <!-- 🆕 表格设置面板 -->
    <TableSettings
      v-model:visible="showSettingsPanel"
      :columns="reactiveColumns"
      @column-change="handleColumnChange"
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
  import TableSettings from './components/TableSettings/index.vue'
  import C_Icon from '@/components/global/C_Icon/index.vue'
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
    // 🆕 设置面板相关属性
    showToolbar?: boolean
    enableColumnSettings?: boolean
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
    // 🆕 设置面板相关默认值
    showToolbar: true,
    enableColumnSettings: true,
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
      // 🆕 设置面板相关事件
      'column-change': [columns: TableColumn[]]
    }
  >()

  // ================= 响应式状态 =================
  const tableRef = ref<ComponentPublicInstance>()

  // 🆕 设置面板相关状态
  const showSettingsPanel = ref(false)

  // 🆕 响应式列状态（用于实时更新）
  const reactiveColumns = ref<TableColumn[]>([
    ...props.columns,
    // 添加操作列，默认固定在右侧
    {
      key: '_actions',
      title: '操作',
      width: 180,
      editable: false,
      visible: true,
      fixed: 'right', // 默认固定在右侧
    } as TableColumn,
  ])

  // 🆕 计算 scroll-x：当有固定列时，必须设置 scroll-x 才能让固定列生效
  const computedScrollX = computed(() => {
    // 如果用户手动设置了 scrollX，优先使用用户设置
    if (props.scrollX !== undefined) {
      return props.scrollX
    }

    // 检查是否有固定列
    const hasFixedColumn = reactiveColumns.value.some(
      col => col.fixed && col.visible !== false
    )

    // 如果有固定列，必须设置 scroll-x
    if (hasFixedColumn) {
      const totalWidth = reactiveColumns.value
        .filter(col => col.visible !== false)
        .reduce((sum, col) => {
          const colWidth = col.width || props.columnWidth || 180
          return sum + (typeof colWidth === 'number' ? colWidth : 180)
        }, 0)

      // 返回总宽度 + 缓冲区，确保能触发横向滚动
      return totalWidth + 200
    }

    return undefined
  })

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

  // 🆕 设置面板事件处理函数
  const handleColumnChange = (columns: TableColumn[]) => {
    const fixedColumns = columns.filter(col => col.fixed)
    if (fixedColumns.length > 0) {
      console.log(
        '🔧 固定列设置:',
        fixedColumns.map(col => ({
          key: col.key,
          fixed: col.fixed,
        }))
      )
    }

    // 更新响应式列状态
    reactiveColumns.value = columns.map(col => ({
      ...col,
      visible: col.visible !== false,
      fixed: col.fixed,
      width: col.width || props.columnWidth,
      align: col.align || 'center',
      titleAlign: col.titleAlign || 'center',
    }))

    emit('column-change', reactiveColumns.value)
  }

  // 监听外部列变化，同步到响应式状态
  watch(
    () => props.columns,
    newColumns => {
      if (newColumns && newColumns.length > 0) {
        // 保留操作列的固定状态
        const actionsCol = reactiveColumns.value.find(
          col => col.key === '_actions'
        )
        reactiveColumns.value = [
          ...newColumns,
          actionsCol ||
            ({
              key: '_actions',
              title: '操作',
              width: 180,
              editable: false,
              visible: true,
              fixed: 'right',
            } as TableColumn),
        ]
      }
    },
    { deep: true, immediate: true }
  )

  // ================= 单元格渲染辅助函数 =================
  const renderCellEdit = (
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number,
    rowKey: DataTableRowKey
  ): VNodeChild => {
    const value = rowData[column.key]
    const isEditingCell = tableManager.editStates.cellEdit.isEditingCell(
      rowKey,
      column.key
    )

    if (isEditingCell) {
      return renderEditingCell(
        column,
        tableManager.editStates.cellEdit.getEditingCellValue(
          rowKey,
          column.key
        ) ?? value,
        val =>
          tableManager.editStates.cellEdit.updateEditingCellValue(
            rowKey,
            column.key,
            val
          ),
        () => tableManager.editStates.cellEdit.saveEditCell(),
        () => tableManager.editStates.cellEdit.cancelEditCell()
      )
    }

    return renderEditableCell(column, rowData, rowIndex, value, () =>
      tableManager.editStates.cellEdit.startEditCell(rowKey, column.key)
    )
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
      return renderCellEdit(column, rowData, rowIndex, rowKey)
    }

    return renderDisplayCell(column, rowData, rowIndex, value)
  }

  // 列映射辅助函数
  const mapIndexColumn = (column: TableColumn): DataTableColumn => {
    const indexWidth = column.width || 50
    return {
      key: '_index',
      title: column.title || '序号',
      width: typeof indexWidth === 'number' ? indexWidth : 50,
      titleAlign: 'center' as const,
      align: 'center' as const,
      render: (_: DataRecord, index: number) => index + 1,
      fixed: column.fixed,
    }
  }

  const mapRegularColumn = (column: TableColumn): DataTableColumn => {
    const columnWidth = column.width || props.columnWidth || 180
    const baseColumn: any = {
      ...column,
      width: typeof columnWidth === 'number' ? columnWidth : 180,
      titleAlign: column.titleAlign || ('center' as const),
      align: column.align || ('center' as const),
      render:
        column.render ||
        ((rowData: DataRecord, rowIndex: number) =>
          renderCell(column, rowData, rowIndex)),
    }

    if (column.fixed) {
      baseColumn.fixed = column.fixed
    }

    return baseColumn
  }

  // 日志辅助函数
  const logFixedColumns = (columns: DataTableColumn[]) => {
    const fixedCols = columns.filter(c => 'fixed' in c && c.fixed)
    if (fixedCols.length > 0) {
      console.log(
        '📌 固定列:',
        fixedCols.map(c => ({
          key: 'key' in c ? c.key : '',
          fixed: 'fixed' in c ? c.fixed : undefined,
          width: 'width' in c ? c.width : undefined,
        }))
      )
    }
  }

  // ================= 计算列配置 =================
  // 🆕 修改 computedColumns 支持固定列，使用响应式列状态
  const computedColumns = computed((): DataTableColumn[] => {
    // 🆕 过滤可见列，同时排除操作列（操作列会在最后单独添加）
    let columns: DataTableColumn[] = reactiveColumns.value
      .filter(column => column.visible !== false && column.key !== '_actions')
      .map(column => {
        if (column.type === 'index') {
          return mapIndexColumn(column)
        }
        return mapRegularColumn(column)
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

    // 🆕 操作列 - 默认不固定，用户可以在设置中选择固定
    const actionsColumn = reactiveColumns.value.find(
      col => col.key === '_actions'
    )
    columns.push({
      key: '_actions',
      title: '操作',
      align: 'center' as const,
      titleAlign: 'center' as const,
      render: tableActions.renderActions,
      fixed: actionsColumn?.fixed,
    })

    logFixedColumns(columns)
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
</style>
