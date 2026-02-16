/*
 * @Description: 表格列处理引擎 — 列映射、单元格渲染、列设置状态管理
 * @Origin: 提取自 C_Table/index.vue 的列处理逻辑 + C_Table/data.ts 的渲染函数
 */

import type { VNodeChild, ComputedRef } from 'vue'
import type { DataTableRowKey, DataTableColumn } from 'naive-ui/es'
import type { TableColumn, DataRecord } from '@/types/modules/table'
import { EDIT_COMPONENTS } from '@/components/global/C_Table/data'
import C_Icon from '@/components/global/C_Icon/index.vue'

// ================= 渲染工具函数 =================

/**
 * 渲染编辑组件（行编辑/单元格编辑通用）
 */
export function renderEditComponent(
  column: TableColumn,
  value: unknown,
  onUpdate: (val: unknown) => void
): VNodeChild {
  if (column.editRender) return column.editRender(value, {}, 0)

  const componentProps = {
    value,
    'onUpdate:value': onUpdate,
    placeholder: `请输入${column.title}`,
    style: { width: '100%' },
    ...column.editProps,
  }

  const Component =
    EDIT_COMPONENTS[column.editType || 'input'] || EDIT_COMPONENTS.input
  return h(Component, componentProps)
}

/**
 * 渲染只读单元格
 */
export function renderDisplayCell(
  column: TableColumn,
  rowData: DataRecord,
  rowIndex: number,
  value: unknown
): VNodeChild {
  return column.render
    ? (column.render(rowData, rowIndex) ?? String(value ?? ''))
    : String(value ?? '')
}

/**
 * 渲染编辑中的单元格（带保存/取消按钮）
 */
export function renderEditingCell(
  column: TableColumn,
  value: unknown,
  onUpdate: (val: unknown) => void,
  onSave: () => void,
  onCancel: () => void
): VNodeChild {
  const actionBtn = (
    name: string,
    title: string,
    onClick: (e: Event) => void
  ) =>
    h(
      'button',
      {
        class: `cell-action-btn cell-action-${name}`,
        title,
        type: 'button',
        onClick: (e: Event) => {
          e.stopPropagation()
          e.preventDefault()
          onClick(e)
        },
      },
      [
        h(C_Icon, {
          name: `mdi:${name === 'save' ? 'check' : 'close'}`,
          title: name === 'save' ? '保存' : '取消',
          size: 12,
        }),
      ]
    )

  return h('div', { class: 'cell-editing-container' }, [
    h('div', { class: 'cell-editing-input' }, [
      renderEditComponent(column, value, onUpdate),
    ]),
    h('div', { class: 'cell-editing-actions' }, [
      actionBtn('save', '保存', onSave),
      actionBtn('cancel', '取消', onCancel),
    ]),
  ])
}

/**
 * 渲染可编辑单元格（显示值 + 编辑图标）
 */
export function renderEditableCell(
  column: TableColumn,
  rowData: DataRecord,
  rowIndex: number,
  value: unknown,
  onStartEdit: () => void
): VNodeChild {
  const displayValue = column.render
    ? (column.render(rowData, rowIndex) ?? String(value ?? ''))
    : String(value ?? '')

  return h('div', { class: 'cell-edit-wrapper' }, [
    h('span', { class: 'cell-value' }, displayValue),
    h(C_Icon, {
      name: 'mdi:square-edit-outline',
      title: '编辑',
      class: 'cell-edit-icon',
      size: 14,
      clickable: true,
      onClick: (e: Event) => {
        e.stopPropagation()
        onStartEdit()
      },
    }),
  ])
}

// ================= 组合式函数入参 =================

export interface UseTableColumnsOptions {
  /** 原始列配置 */
  rawColumns: ComputedRef<TableColumn[]>
  /** 统一配置 */
  config: ComputedRef<any>
  /** 默认列宽 */
  columnWidth: number
  /** 用户设定的 scrollX */
  scrollX?: number | string
  /** 行键获取函数 */
  rowKey: (row: DataRecord) => DataTableRowKey
  /** 表格管理器（提供编辑/展开/动态行状态） */
  tableManager: any
  /** 操作列渲染函数 */
  actionsRenderer: (row: DataRecord, index: number) => VNodeChild
  /** 编辑模式检查器 */
  editModeChecker: ComputedRef<{
    isNonEditable: (column: TableColumn) => boolean
    isRowEditMode: () => boolean
    isCellEditMode: () => boolean
  }>
}

// ================= 主函数 =================

/**
 * 表格列处理引擎
 * 将原始列配置转换为 NDataTable 可用的列，并管理列设置状态
 */
export function useTableColumns(options: UseTableColumnsOptions) {
  const {
    rawColumns,
    config,
    columnWidth,
    rowKey,
    tableManager,
    actionsRenderer,
    editModeChecker,
  } = options

  // ================= 响应式列状态 =================

  const reactiveColumns = ref<TableColumn[]>([])
  const showSettingsPanel = ref(false)

  /** 同步外部列配置到响应式状态（保留操作列元数据） */
  const syncColumns = (newColumns: TableColumn[]) => {
    const existingActions = reactiveColumns.value.find(
      col => col.key === '_actions'
    )
    reactiveColumns.value = [
      ...newColumns,
      existingActions ||
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

  // 监听外部列变化
  watch(
    rawColumns,
    cols => {
      if (cols?.length) syncColumns(cols)
    },
    { deep: true, immediate: true }
  )

  // ================= 单元格渲染 =================

  /** 单元格编辑模式渲染 */
  const renderCellEdit = (
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number,
    rowKeyVal: DataTableRowKey
  ): VNodeChild => {
    const value = rowData[column.key]
    const {
      isEditingCell,
      getEditingCellValue,
      updateEditingCellValue,
      saveEditCell,
      cancelEditCell,
      startEditCell,
    } = tableManager.editStates.cellEdit

    if (isEditingCell(rowKeyVal, column.key)) {
      return renderEditingCell(
        column,
        getEditingCellValue(rowKeyVal, column.key) ?? value,
        val => updateEditingCellValue(rowKeyVal, column.key, val),
        () => saveEditCell(),
        () => cancelEditCell()
      )
    }

    return renderEditableCell(column, rowData, rowIndex, value, () =>
      startEditCell(rowKeyVal, column.key)
    )
  }

  /** 统一单元格渲染入口 */
  const renderCell = (
    column: TableColumn,
    rowData: DataRecord,
    rowIndex: number
  ): VNodeChild => {
    const value = rowData[column.key]
    const key = rowKey(rowData)
    const checker = editModeChecker.value

    // 不可编辑 → 直接显示
    if (checker.isNonEditable(column)) {
      return renderDisplayCell(column, rowData, rowIndex, value)
    }

    // 行编辑模式且当前行正在编辑
    if (
      checker.isRowEditMode() &&
      tableManager.editStates.rowEdit.isEditingRow(key)
    ) {
      return renderEditComponent(
        column,
        tableManager.editStates.rowEdit.getEditingRowData(key)?.[column.key] ??
          value,
        val =>
          tableManager.editStates.rowEdit.updateEditingRowData(
            key,
            column.key,
            val
          )
      )
    }

    // 单元格编辑模式
    if (checker.isCellEditMode()) {
      return renderCellEdit(column, rowData, rowIndex, key)
    }

    return renderDisplayCell(column, rowData, rowIndex, value)
  }

  // ================= 列映射 =================

  const getColWidth = (col: TableColumn): number => {
    const w = col.width || columnWidth || 180
    return typeof w === 'number' ? w : 180
  }

  /** 序号列 */
  const mapIndexColumn = (column: TableColumn): DataTableColumn => ({
    key: '_index',
    title: column.title || '序号',
    width: typeof (column.width || 50) === 'number' ? column.width || 50 : 50,
    titleAlign: 'center' as const,
    align: 'center' as const,
    render: (_: DataRecord, index: number) => index + 1,
    fixed: column.fixed,
  })

  /** 普通数据列 */
  const mapRegularColumn = (column: TableColumn): DataTableColumn => {
    const base: any = {
      ...column,
      width: getColWidth(column),
      titleAlign: column.titleAlign || ('center' as const),
      align: column.align || ('center' as const),
      render:
        column.render ||
        ((rowData: DataRecord, rowIndex: number) =>
          renderCell(column, rowData, rowIndex)),
    }

    if (column.fixed) base.fixed = column.fixed

    // 可调整宽度
    if (column.resizable && typeof base.width === 'number') {
      base.resizable = true
      base.minWidth = column.minWidth || 80
      base.maxWidth = column.maxWidth || 500
    }

    return base
  }

  // ================= 计算列 =================

  /** 最终传给 NDataTable 的列配置 */
  const computedColumns = computed((): DataTableColumn[] => {
    // 1. 基础数据列
    let cols: DataTableColumn[] = reactiveColumns.value
      .filter(c => c.visible !== false && c.key !== '_actions')
      .map(c =>
        c.type === 'index' ? mapIndexColumn(c) : mapRegularColumn(c)
      ) as DataTableColumn[]

    // 2. 动态行增强（添加单选列等）
    if (tableManager.dynamicRowsState) {
      cols = tableManager.dynamicRowsState.enhanceColumns(
        cols as any
      ) as DataTableColumn[]
    }

    // 3. 展开/多选列
    if (
      tableManager.expandState &&
      (config.value.expandable || config.value.enableSelection)
    ) {
      cols = tableManager.expandState.getTableColumns(
        cols as any
      ) as DataTableColumn[]
    }

    // 4. 操作列
    const actionsMeta = reactiveColumns.value.find(c => c.key === '_actions')
    cols.push({
      key: '_actions',
      title: '操作',
      align: 'center' as const,
      titleAlign: 'center' as const,
      render: actionsRenderer,
      fixed: actionsMeta?.fixed,
    })

    return cols
  })

  // ================= 横向滚动 =================

  const computedScrollX = computed(() => {
    if (options.scrollX !== undefined) return options.scrollX

    const hasFixed = reactiveColumns.value.some(
      c => c.fixed && c.visible !== false
    )
    if (!hasFixed) return undefined

    const total = reactiveColumns.value
      .filter(c => c.visible !== false)
      .reduce((sum, c) => sum + getColWidth(c), 0)

    return total + 200
  })

  // ================= 列设置变更 =================

  const handleColumnChange = (columns: TableColumn[]) => {
    reactiveColumns.value = columns.map(col => ({
      ...col,
      visible: col.visible !== false,
      fixed: col.fixed,
      width: col.width || columnWidth,
      align: col.align || 'center',
      titleAlign: col.titleAlign || 'center',
    }))
  }

  // ================= 导出 =================

  return {
    /** 响应式列状态（含操作列） */
    reactiveColumns,
    /** 设置面板可见性 */
    showSettingsPanel,
    /** 最终列配置（传给 NDataTable） */
    computedColumns,
    /** 横向滚动宽度 */
    computedScrollX,
    /** 列设置变更处理 */
    handleColumnChange,
  }
}
