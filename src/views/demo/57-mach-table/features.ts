/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-24
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\features.ts
 * @Description: MachTable 配置方案、表单和选项映射
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  defineFormConfig,
  defineFormOptions,
} from '@robot-admin/naive-ui-components/C_Form'

export interface MachFeatureSettings {
  watermark: boolean
  watermarkText: string
  density: 'compact' | 'normal' | 'large'
  stripedRows: boolean
  showCellBorders: boolean
  columnLayout: 'normal' | 'fit'
  enableColumnResize: boolean
  columnMenu: boolean
  rowSelection: 'none' | 'single' | 'multiple'
  enableRangeSelection: boolean
  clipboard: boolean
  contextMenu: boolean
  fillHandle: boolean
  flashCells: boolean
  pagination: boolean
  showSummary: boolean
  statusBar: boolean
}

/** 功能实验台推荐基线；仅当前页面使用，不写入全局配置。 */
export const DEFAULT_MACH_FEATURE_SETTINGS: MachFeatureSettings = {
  watermark: false,
  watermarkText: '内部资料 · CHENY',
  density: 'compact',
  stripedRows: true,
  showCellBorders: true,
  columnLayout: 'fit',
  enableColumnResize: true,
  columnMenu: true,
  rowSelection: 'multiple',
  enableRangeSelection: true,
  clipboard: true,
  contextMenu: false,
  fillHandle: true,
  flashCells: true,
  pagination: true,
  showSummary: false,
  statusBar: true,
}

// 设置抽屉采用完整一行，避免窄屏下标签与控件争抢宽度。
const featureItem = { layout: { span: 24 } } as const

/** 抽屉表单完全数据驱动，新增普通开关无需继续堆模板。 */
export const MACH_FEATURE_GROUPS = [
  {
    key: 'appearance',
    title: '外观与布局',
    icon: 'i-mdi-palette-outline',
    description: '调整阅读密度、列宽和表格外观。',
    options: defineFormOptions<MachFeatureSettings>([
      {
        ...featureItem,
        type: 'switch',
        prop: 'watermark',
        label: '实时水印',
        help: '在表格上显示淡色水印，不影响单元格操作。',
      },
      {
        ...featureItem,
        type: 'input',
        prop: 'watermarkText',
        label: '水印文字',
        placeholder: '请输入水印文字',
        disabled: model => !model.watermark,
      },
      {
        ...featureItem,
        type: 'select',
        prop: 'density',
        label: '表格密度',
        children: [
          { label: '紧凑', value: 'compact' },
          { label: '标准', value: 'normal' },
          { label: '宽松', value: 'large' },
        ],
      },
      {
        ...featureItem,
        type: 'select',
        prop: 'columnLayout',
        label: '列宽布局',
        help: '自适应会分配剩余空间；保持声明宽度时，超出的列可横向滚动。',
        children: [
          { label: '自适应填满', value: 'fit' },
          { label: '保持声明宽度', value: 'normal' },
        ],
      },
      { ...featureItem, type: 'switch', prop: 'stripedRows', label: '斑马纹' },
      {
        ...featureItem,
        type: 'switch',
        prop: 'showCellBorders',
        label: '单元格边框',
      },
    ]),
  },
  {
    key: 'interaction',
    title: '列、选择与剪贴板',
    icon: 'i-mdi-cursor-default-click-outline',
    description: '按任务开启选择、编辑辅助和快捷操作。',
    options: defineFormOptions<MachFeatureSettings>([
      {
        ...featureItem,
        type: 'switch',
        prop: 'enableColumnResize',
        label: '调整列宽',
        help: '拖动表头列边界调整宽度，双击边界可按内容适配。',
      },
      {
        ...featureItem,
        type: 'switch',
        prop: 'columnMenu',
        label: '列工具菜单',
      },
      {
        ...featureItem,
        type: 'select',
        prop: 'rowSelection',
        label: '行选择',
        children: [
          { label: '关闭', value: 'none' },
          { label: '单选', value: 'single' },
          { label: '多选', value: 'multiple' },
        ],
      },
      {
        ...featureItem,
        type: 'switch',
        prop: 'enableRangeSelection',
        label: '范围选择',
      },
      { ...featureItem, type: 'switch', prop: 'clipboard', label: '复制粘贴' },
      {
        ...featureItem,
        type: 'switch',
        prop: 'contextMenu',
        label: '右键菜单',
      },
      {
        ...featureItem,
        type: 'switch',
        prop: 'fillHandle',
        label: '范围填充柄',
        help: '开启范围选择后，可拖动选区右下角继续填充。',
        disabled: model => !model.enableRangeSelection,
      },
      {
        ...featureItem,
        type: 'switch',
        prop: 'flashCells',
        label: '值变化高亮',
      },
    ]),
  },
  {
    key: 'data',
    title: '数据与辅助信息',
    icon: 'i-mdi-database-outline',
    description: '控制分页、合计与底部状态信息。',
    options: defineFormOptions<MachFeatureSettings>([
      {
        ...featureItem,
        type: 'switch',
        prop: 'pagination',
        label: '客户端分页',
      },
      {
        ...featureItem,
        type: 'switch',
        prop: 'showSummary',
        label: '合计行',
      },
      { ...featureItem, type: 'switch', prop: 'statusBar', label: '状态栏' },
    ]),
  },
] as const

export const MACH_FEATURE_FORM_CONFIG = defineFormConfig<MachFeatureSettings>({
  layout: 'grid',
  grid: { cols: 24, gutter: 0, yGutter: 0 },
  labelPlacement: 'left',
  labelWidth: 156,
  size: 'small',
  showActions: false,
  validateOnChange: false,
})

export const MACH_FEATURE_PRESETS = {
  standard: {
    label: '企业列表',
    description: '紧凑清晰，高效处理订单',
    icon: 'i-mdi-table-large',
    settings: DEFAULT_MACH_FEATURE_SETTINGS,
  },
  spreadsheet: {
    label: '数据工作台',
    description: '右键操作，汇总数据',
    icon: 'i-mdi-table-edit',
    settings: {
      ...DEFAULT_MACH_FEATURE_SETTINGS,
      contextMenu: true,
      showSummary: true,
    },
  },
  report: {
    label: '报表审阅',
    description: '专注阅读，显示水印与合计',
    icon: 'i-mdi-chart-box-outline',
    settings: {
      ...DEFAULT_MACH_FEATURE_SETTINGS,
      watermark: true,
      rowSelection: 'none',
      enableRangeSelection: false,
      showSummary: true,
    },
  },
  minimal: {
    label: '精简只读',
    description: '减少干扰，突出业务内容',
    icon: 'i-mdi-text-box-outline',
    settings: {
      ...DEFAULT_MACH_FEATURE_SETTINGS,
      rowSelection: 'none',
      enableRangeSelection: false,
      columnMenu: false,
      showCellBorders: false,
      statusBar: false,
    },
  },
} as const

export type MachFeaturePreset = keyof typeof MACH_FEATURE_PRESETS

export const MACH_FEATURE_PRESET_OPTIONS = (
  Object.keys(MACH_FEATURE_PRESETS) as MachFeaturePreset[]
).map(value => ({ value, ...MACH_FEATURE_PRESETS[value] }))

const ORDER_PAGINATION = {
  mode: 'client' as const,
  pageSize: 50,
  pageSizeOptions: [20, 50, 100, 200],
  showTotal: true,
  showPageSizeSelector: true,
}

/** 将演示表单映射为一次原子更新所需的 MachTable 配置。 */
export const toMachFeatureOptions = (settings: MachFeatureSettings) => ({
  size: settings.density,
  stripedRows: settings.stripedRows,
  showCellBorders: settings.showCellBorders,
  columnLayout: settings.columnLayout,
  enableColumnResize: settings.enableColumnResize,
  columnMenu: settings.columnMenu,
  rowSelection: settings.rowSelection,
  enableRangeSelection: settings.enableRangeSelection,
  suppressClipboard: !settings.clipboard,
  contextMenu: settings.contextMenu,
  fillHandle: settings.enableRangeSelection && settings.fillHandle,
  flashCells: settings.flashCells,
  pagination: settings.pagination ? ORDER_PAGINATION : false,
  showSummary: settings.showSummary,
  statusBar: settings.statusBar,
  watermark: settings.watermark
    ? {
        text: settings.watermarkText.trim() || '内部资料',
        fontSize: 14,
        opacity: 0.06,
        gap: 160,
        angle: -22,
      }
    : false,
})
