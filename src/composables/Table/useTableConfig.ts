/*
 * @Description: 表格配置构建 — 从 config 单一入口合并为内部统一配置对象
 *   使用侧只需传 :config="{ edit: {...}, selection: {...}, ... }"
 *   内部 resolveConfig() 将其展平为各 composable 需要的格式
 */

import type { VNodeChild, Ref, ComputedRef } from 'vue'
import type {
  DataRecord,
  PaginationConfig,
  ParentChildLinkMode,
  SimpleTableActions,
} from '@/types/modules/table'
import type { DynamicRowsOptions } from '@/composables/Table/useDynamicRow'

// ================= CRUD 绑定类型（鸭子类型，兼容 useTableCrud 返回值） =================

/** 可绑定到 C_Table 的 CRUD 对象接口（与 useTableCrud 返回值形状兼容） */
export interface CrudBinding {
  data: Ref<any[]>
  loading: Ref<boolean>
  columns: ComputedRef<any[]>
  actions?: ComputedRef<any>
  pagination?: ComputedRef<any>
  tableRef?: Ref<any>
  save?: (...args: any[]) => any
  handleCancel?: () => any
  handlePaginationChange?: (page: number, pageSize: number) => void
  handleRowDelete?: (...args: any[]) => void
  detail?: { show: (...args: any[]) => void }
}

// ================= 使用侧配置类型（对外 API） =================

/** C_Table :config prop 的类型 — 所有功能配置收拢在此 */
export interface TableConfig<T extends DataRecord = DataRecord> {
  /** 编辑配置 */
  edit?: EditConfig | boolean
  /** 操作按钮 */
  actions?: SimpleTableActions<T>
  /** 分页配置 */
  pagination?: PaginationConfig | boolean
  /** 展开行配置 */
  expand?: ExpandConfig<T> | boolean
  /** 选择配置 */
  selection?: SelectionConfig<T> | boolean
  /** 动态行配置 */
  dynamicRows?: DynamicRowsOptions<T> | boolean
  /** 工具栏 */
  toolbar?: ToolbarConfig
  /** 表格显示属性 */
  display?: DisplayConfig
}

export interface EditConfig {
  enabled?: boolean
  mode?: 'row' | 'cell' | 'modal' | 'both' | 'none'
  showRowActions?: boolean
  modalTitle?: string
  modalWidth?: number
}

export interface ExpandConfig<T extends DataRecord = DataRecord> {
  enabled?: boolean
  defaultExpandedKeys?: import('naive-ui/es').DataTableRowKey[]
  onLoadData?: (row: T) => Promise<any[]> | any[]
  renderContent?: (
    row: T,
    expandData: any[],
    loading: boolean,
    childSelection?: any
  ) => VNodeChild
  rowExpandable?: (row: T) => boolean
}

export interface SelectionConfig<T extends DataRecord = DataRecord> {
  enabled?: boolean
  defaultCheckedKeys?: import('naive-ui/es').DataTableRowKey[]
  rowCheckable?: (row: T) => boolean
  maxSelection?: number
  childSelection?: {
    enabled?: boolean
    childRowCheckable?: (childRow: any, parentRow: T) => boolean
  }
  parentChildLink?: {
    enabled?: boolean
    mode?: ParentChildLinkMode
  }
}

export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show?: boolean
  /** 是否启用列设置 */
  columnSettings?: boolean
}

export interface DisplayConfig {
  striped?: boolean
  bordered?: boolean
  singleLine?: boolean
  size?: 'small' | 'medium' | 'large'
  maxHeight?: number | string
  scrollX?: number | string
  columnWidth?: number
}

// ================= 内部解析后的扁平配置 =================

export interface ResolvedConfig {
  // 编辑
  editable: boolean
  editMode: string
  showRowActions: boolean
  modalTitle: string
  modalWidth: number
  // 展开
  expandable: boolean
  defaultExpandedKeys: any
  onLoadExpandData: any
  renderExpandContent: any
  rowExpandable: any
  // 选择
  enableSelection: boolean
  defaultCheckedKeys: any
  rowCheckable: any
  maxSelection: any
  enableChildSelection: boolean
  childRowCheckable: any
  enableParentChildLink: boolean
  parentChildLinkMode: ParentChildLinkMode
  // 分页
  pagination: PaginationConfig | null
  // 动态行
  dynamicRows: any
  // 显示
  striped: boolean
  bordered: boolean
  singleLine: boolean
  size: string
  maxHeight: any
  scrollX: any
  columnWidth: number
  // 工具栏
  showToolbar: boolean
  enableColumnSettings: boolean
}

// ================= 解析逻辑 =================

const EDIT_DISABLED: Pick<
  ResolvedConfig,
  'editable' | 'editMode' | 'showRowActions' | 'modalTitle' | 'modalWidth'
> = {
  editable: false,
  editMode: 'none',
  showRowActions: false,
  modalTitle: '编辑数据',
  modalWidth: 600,
}

const resolveEdit = (
  edit: EditConfig | boolean | undefined
): Pick<
  ResolvedConfig,
  'editable' | 'editMode' | 'showRowActions' | 'modalTitle' | 'modalWidth'
> => {
  // 未指定或显式关闭 → 禁用（多数表格只读，安全默认值）
  if (edit === false || edit === undefined) return EDIT_DISABLED
  // true → 开启 modal 模式
  if (edit === true)
    return {
      editable: true,
      editMode: 'modal',
      showRowActions: true,
      modalTitle: '编辑数据',
      modalWidth: 600,
    }
  return {
    editable: edit.enabled !== false && edit.mode !== 'none',
    editMode: edit.mode || 'modal',
    showRowActions: edit.showRowActions !== false && edit.mode !== 'none',
    modalTitle: edit.modalTitle || '编辑数据',
    modalWidth: edit.modalWidth || 600,
  }
}

const resolveExpand = (expand: ExpandConfig | boolean | undefined) => {
  if (!expand)
    return {
      expandable: false,
      defaultExpandedKeys: undefined,
      onLoadExpandData: undefined,
      renderExpandContent: undefined,
      rowExpandable: undefined,
    }
  if (expand === true)
    return {
      expandable: true,
      defaultExpandedKeys: undefined,
      onLoadExpandData: undefined,
      renderExpandContent: undefined,
      rowExpandable: undefined,
    }
  return {
    expandable: expand.enabled !== false,
    defaultExpandedKeys: expand.defaultExpandedKeys,
    onLoadExpandData: expand.onLoadData,
    renderExpandContent: expand.renderContent,
    rowExpandable: expand.rowExpandable,
  }
}

const resolveSelection = (selection: SelectionConfig | boolean | undefined) => {
  if (!selection)
    return {
      enableSelection: false,
      defaultCheckedKeys: undefined,
      rowCheckable: undefined,
      maxSelection: undefined,
      enableChildSelection: false,
      childRowCheckable: undefined,
      enableParentChildLink: false,
      parentChildLinkMode: 'loose' as ParentChildLinkMode,
    }
  if (selection === true)
    return {
      enableSelection: true,
      defaultCheckedKeys: undefined,
      rowCheckable: undefined,
      maxSelection: undefined,
      enableChildSelection: false,
      childRowCheckable: undefined,
      enableParentChildLink: false,
      parentChildLinkMode: 'loose' as ParentChildLinkMode,
    }
  const child = selection.childSelection || {}
  const link = selection.parentChildLink || {}
  return {
    enableSelection: selection.enabled !== false,
    defaultCheckedKeys: selection.defaultCheckedKeys,
    rowCheckable: selection.rowCheckable,
    maxSelection: selection.maxSelection,
    enableChildSelection: child.enabled || false,
    childRowCheckable: child.childRowCheckable,
    enableParentChildLink: link.enabled || false,
    parentChildLinkMode: (link.mode || 'loose') as ParentChildLinkMode,
  }
}

const resolvePagination = (
  pagination: PaginationConfig | boolean | undefined
): { pagination: PaginationConfig | null } => {
  const defaults: PaginationConfig = {
    enabled: true,
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    showQuickJumper: true,
    pageSizes: [10, 20, 50, 100],
    simple: false,
    size: 'medium',
  }

  if (pagination === false) return { pagination: null }
  if (pagination === true || pagination === undefined)
    return { pagination: defaults }
  return { pagination: { ...defaults, ...pagination } }
}

const resolveDynamicRows = (
  dynamicRows: DynamicRowsOptions | boolean | undefined
) => {
  if (!dynamicRows) return { dynamicRows: undefined }
  if (dynamicRows === true) {
    return {
      dynamicRows: {
        enableRadioSelection: true,
        enableAdd: true,
        enableInsert: true,
        enableDelete: true,
        enableCopy: true,
        enableMove: true,
        enablePrint: true,
      },
    }
  }
  return { dynamicRows }
}

const DISPLAY_DEFAULTS: Pick<
  ResolvedConfig,
  | 'striped'
  | 'bordered'
  | 'singleLine'
  | 'size'
  | 'maxHeight'
  | 'scrollX'
  | 'columnWidth'
> = {
  striped: true,
  bordered: true,
  singleLine: true,
  size: 'medium',
  maxHeight: undefined,
  scrollX: undefined,
  columnWidth: 180,
}

/** 解析 display 配置，合并默认值 */
function resolveDisplay(display: DisplayConfig | undefined) {
  if (!display) return { ...DISPLAY_DEFAULTS }
  return {
    striped: display.striped ?? DISPLAY_DEFAULTS.striped,
    bordered: display.bordered ?? DISPLAY_DEFAULTS.bordered,
    singleLine: display.singleLine ?? DISPLAY_DEFAULTS.singleLine,
    size: display.size ?? DISPLAY_DEFAULTS.size,
    maxHeight: display.maxHeight,
    scrollX: display.scrollX,
    columnWidth: display.columnWidth ?? DISPLAY_DEFAULTS.columnWidth,
  }
}

const resolveToolbar = (toolbar: ToolbarConfig | undefined) => ({
  showToolbar: toolbar?.show !== false,
  enableColumnSettings: toolbar?.columnSettings !== false,
})

// ================= 主配置函数 =================

/**
 * 将 config 单一对象解析为内部扁平化配置
 */
export function resolveConfig(config: TableConfig = {}): ResolvedConfig {
  return {
    ...resolveEdit(config.edit),
    ...resolveExpand(config.expand),
    ...resolveSelection(config.selection),
    ...resolvePagination(config.pagination),
    ...resolveDynamicRows(config.dynamicRows),
    ...resolveDisplay(config.display),
    ...resolveToolbar(config.toolbar),
  }
}

// ================= 编辑模式检查器 =================

export const createEditModeChecker = (config: ResolvedConfig) => ({
  isNonEditable: (column: any) =>
    !config.editable || column.editable === false || config.editMode === 'none',
  isRowEditMode: () => ['row', 'both'].includes(config.editMode),
  isCellEditMode: () => ['cell', 'both'].includes(config.editMode),
})
