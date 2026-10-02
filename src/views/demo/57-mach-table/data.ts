/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-10
 * @FilePath: \Robot_Admin\src\views\demo\57-mach-table\data.ts
 * @Description: MachTable 独立演示数据与列定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { h } from 'vue'
import { NProgress, NTag } from 'naive-ui'
import {
  defineFormConfig,
  defineFormOptions,
} from '@robot-admin/naive-ui-components/C_Form'
import { defineTabs } from '@robot-admin/naive-ui-components/C_Tabs'
import { useDownloadCSV } from '@robot-admin/file-utils'
import {
  createMemoryTableSource,
  defineDetailConfig,
} from '@robot-admin/request-core/vue'
import {
  defineVueTableConfig,
  defineVueColumns,
  indexColumn,
  rowActionsColumn,
  selectionColumn,
  type RowActionsConfig,
} from '@agile-team/mach-table-vue'
import { request, useAppTableCrud } from '@/plugins/request-core'
import { PRESET_RULES } from '@/utils/d_formValidate'

export const ORDER_STATUS = {
  pending: { label: '待处理', tagType: 'default' },
  processing: { label: '履约中', tagType: 'info' },
  completed: { label: '已完成', tagType: 'success' },
  risk: { label: '需关注', tagType: 'warning' },
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

export interface OrderRow {
  id: string
  orderNo: string
  customer: string
  product: string
  region: string
  quantity: number
  amount: number
  status: OrderStatus
  progress: number
  updatedAt: string
}

export interface OrderTreeRow extends OrderRow {
  children?: OrderTreeRow[]
}

const CUSTOMERS = [
  '星海科技',
  '云帆智造',
  '远川零售',
  '青禾医疗',
  '极光能源',
  '木棉设计',
]
const PRODUCTS = [
  '企业协作套件',
  '数据中台服务',
  '智能巡检终端',
  '供应链解决方案',
  '云端分析平台',
]
export const REGIONS = ['华东', '华南', '华北', '西南', '华中'] as const
const STATUSES = Object.keys(ORDER_STATUS) as OrderStatus[]
export const STATUS_OPTIONS = STATUSES.map(value => ({
  label: ORDER_STATUS[value].label,
  value,
}))
const getStatusMeta = (value: unknown) =>
  ORDER_STATUS[value as OrderStatus] ?? {
    label: String(value ?? '-'),
    tagType: 'default' as const,
  }
const pad = (value: number, length = 2): string =>
  String(value).padStart(length, '0')

/** 生成稳定的大数据集，用于直观看到虚拟滚动与本地分页表现。 */
export const createOrderRows = (count = 2000): OrderRow[] =>
  Array.from({ length: count }, (_, index) => {
    const sequence = index + 1
    const status = STATUSES[index % STATUSES.length]
    const quantity = 1 + ((index * 7) % 24)
    const amount = quantity * (680 + ((index * 137) % 5200))
    const date = new Date(Date.UTC(2026, 8, 10 - (index % 120)))

    return {
      id: String(sequence),
      orderNo: `MT-${pad(2026, 4)}-${pad(sequence, 5)}`,
      customer: CUSTOMERS[index % CUSTOMERS.length],
      product: PRODUCTS[(index * 3) % PRODUCTS.length],
      region: REGIONS[(index * 2) % REGIONS.length],
      quantity,
      amount,
      status,
      progress:
        status === 'completed'
          ? 100
          : status === 'pending'
            ? 10 + (index % 20)
            : 35 + ((index * 11) % 60),
      updatedAt: date.toISOString().slice(0, 10),
    }
  })

/** 生成三层本地树数据，用同一列模型演示展开、层级选择与虚拟滚动。 */
export const createOrderTreeRows = (): OrderTreeRow[] => {
  const source = createOrderRows(30)

  return REGIONS.map((region, regionIndex) => {
    const regionRows = source.filter(row => row.region === region)
    const customerGroups = CUSTOMERS.slice(0, 2).map(
      (customer, customerIndex) => {
        const children = regionRows
          .filter((_, index) => index % 2 === customerIndex)
          .slice(0, 3)
          .map(row => ({
            ...row,
            id: `tree:${region}:${customer}:${row.id}`,
            children: undefined,
          }))
        const amount = children.reduce((sum, row) => sum + row.amount, 0)

        return {
          ...children[0],
          id: `tree:${region}:${customer}`,
          orderNo: customer,
          customer: `${children.length} 个订单`,
          product: '客户订单汇总',
          region,
          quantity: children.reduce((sum, row) => sum + row.quantity, 0),
          amount,
          status: 'processing' as const,
          progress: Math.round(
            children.reduce((sum, row) => sum + row.progress, 0) /
              Math.max(children.length, 1)
          ),
          updatedAt: children[0]?.updatedAt ?? '2026-09-10',
          children,
        }
      }
    )
    const allOrders = customerGroups.flatMap(group => group.children ?? [])

    return {
      ...(allOrders[0] ?? source[regionIndex]),
      id: `tree:${region}`,
      orderNo: `${region}区域`,
      customer: `${allOrders.length} 个订单`,
      product: '区域订单总览',
      region,
      quantity: allOrders.reduce((sum, row) => sum + row.quantity, 0),
      amount: allOrders.reduce((sum, row) => sum + row.amount, 0),
      status: 'processing' as const,
      progress: Math.round(
        allOrders.reduce((sum, row) => sum + row.progress, 0) /
          Math.max(allOrders.length, 1)
      ),
      updatedAt: allOrders[0]?.updatedAt ?? '2026-09-10',
      children: customerGroups,
    }
  })
}

const MONEY_FORMATTER = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 0,
})

export const getStatusLabel = (value: unknown): string =>
  getStatusMeta(value).label

/** 详情展示同样由数据驱动，页面无需重复维护描述列表模板。 */
export const ORDER_DETAIL_CONFIG = defineDetailConfig({
  sections: [
    {
      title: '订单信息',
      columns: 2,
      items: [
        { label: '订单编号', key: 'orderNo' },
        { label: '客户名称', key: 'customer' },
        { label: '产品方案', key: 'product' },
        { label: '区域', key: 'region' },
        { label: '数量', key: 'quantity', type: 'number' },
        {
          label: '订单金额',
          key: 'amount',
          formatter: value => MONEY_FORMATTER.format(Number(value ?? 0)),
        },
        {
          label: '状态',
          key: 'status',
          type: 'tag',
          tagTypes: Object.fromEntries(
            Object.entries(ORDER_STATUS).map(([value, meta]) => [
              value,
              meta.tagType,
            ])
          ),
          formatter: getStatusLabel,
        },
        {
          label: '履约进度',
          key: 'progress',
          formatter: value => `${Number(value ?? 0)}%`,
        },
        { label: '更新时间', key: 'updatedAt', type: 'date' },
      ],
    },
  ],
})

/** 编辑弹窗字段：C_Form 统一负责渲染、双向绑定与校验。 */
export const ORDER_FORM_OPTIONS = defineFormOptions<OrderRow>([
  {
    type: 'input',
    prop: 'orderNo',
    label: '订单编号',
    disabled: true,
  },
  {
    type: 'input',
    prop: 'customer',
    label: '客户名称',
    placeholder: '请输入客户名称',
    rules: [
      PRESET_RULES.required('客户名称'),
      PRESET_RULES.length('客户名称', 2, 30),
    ],
  },
  {
    type: 'input',
    prop: 'product',
    label: '产品方案',
    placeholder: '请输入产品方案',
    rules: [
      PRESET_RULES.required('产品方案'),
      PRESET_RULES.length('产品方案', 2, 40),
    ],
  },
  {
    type: 'select',
    prop: 'region',
    label: '区域',
    placeholder: '请选择区域',
    children: REGIONS.map(value => ({ label: value, value })),
    rules: [PRESET_RULES.required('区域')],
  },
  {
    type: 'inputNumber',
    prop: 'quantity',
    label: '数量',
    attrs: { min: 1, max: 9999 },
    rules: [PRESET_RULES.required('数量'), PRESET_RULES.range('数量', 1, 9999)],
  },
  {
    type: 'inputNumber',
    prop: 'amount',
    label: '订单金额',
    attrs: { min: 0, precision: 0 },
    rules: [
      PRESET_RULES.required('订单金额'),
      PRESET_RULES.range('订单金额', 0, 100_000_000),
    ],
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    children: STATUS_OPTIONS,
    rules: [PRESET_RULES.required('状态')],
  },
  {
    type: 'inputNumber',
    prop: 'progress',
    label: '履约进度',
    attrs: { min: 0, max: 100 },
    rules: [
      PRESET_RULES.required('履约进度'),
      PRESET_RULES.range('履约进度', 0, 100),
    ],
  },
])

/** 编辑弹窗稳定配置；页面只保留一个 C_Form 绑定。 */
export const ORDER_FORM_CONFIG = defineFormConfig<OrderRow>({
  layout: 'grid',
  grid: { cols: 24, gutter: 18 },
  labelPlacement: 'top',
  validateOnChange: false,
})

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

const featureItem = { layout: { span: 12 } } as const

/** 抽屉表单完全数据驱动，新增普通开关无需继续堆模板。 */
export const MACH_FEATURE_GROUPS = [
  {
    key: 'appearance',
    title: '外观与布局',
    description: '这些能力可以安全地即时切换，不会改变业务数据。',
    options: defineFormOptions<MachFeatureSettings>([
      { ...featureItem, type: 'switch', prop: 'watermark', label: '实时水印' },
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
    description: '适合数据工作台和类 Excel 操作场景。',
    options: defineFormOptions<MachFeatureSettings>([
      {
        ...featureItem,
        type: 'switch',
        prop: 'enableColumnResize',
        label: '调整列宽',
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
    description: '控制分页、合计和底部运行状态，不影响列定义。',
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
  grid: { cols: 24, gutter: 14, yGutter: 4 },
  labelPlacement: 'left',
  labelWidth: 104,
  showActions: false,
  validateOnChange: false,
})

export const MACH_FEATURE_PRESETS = {
  standard: { label: '企业列表', settings: DEFAULT_MACH_FEATURE_SETTINGS },
  spreadsheet: {
    label: '数据工作台',
    settings: {
      ...DEFAULT_MACH_FEATURE_SETTINGS,
      contextMenu: true,
      showSummary: true,
    },
  },
  report: {
    label: '报表审阅',
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

export const MACH_FEATURE_PRESET_OPTIONS = Object.entries(
  MACH_FEATURE_PRESETS
).map(([value, preset]) => ({ value, label: preset.label }))

/** 需要专用列或数据结构的能力不伪装成普通开关。 */
export const MACH_SCENE_CAPABILITIES = [
  {
    key: 'editing',
    title: '单元格 / 整行编辑',
    state: '当前页面可体验',
    description: '通过页面上方场景标签切换，支持校验、提交、取消和撤销。',
  },
  {
    key: 'tree',
    title: '树表与懒加载',
    state: '当前页面可体验',
    description:
      '树形场景演示本地三层数据；Core 同时支持可取消、去重和重试的远程子节点加载。',
  },
  {
    key: 'detail',
    title: '主从详情',
    state: '需要详情渲染器',
    description: '可展开业务详情；与树表互斥，不能作为普通布尔开关混用。',
  },
  {
    key: 'infinite',
    title: '无限滚动与随机块',
    state: '需要数据源',
    description: '支持并发限制、预取、重试、LRU 缓存和已知总量滚动条。',
  },
  {
    key: 'state',
    title: '保存视图与状态持久化',
    state: '当前页面已启用',
    description: '列宽、顺序、排序、筛选和分页按页面身份隔离保存。',
  },
  {
    key: 'io',
    title: 'CSV / XLSX / 打印',
    state: '按需扩展',
    description: 'CSV 和打印由 Core 提供，XLSX 通过独立入口按需加载。',
  },
] as const

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

/**
 * 业务场景开关：订单表默认支持批量选择；不需要批量操作的页面关闭此项即可。
 * 序号是数据表的基础定位信息，始终位于业务列之前。
 */
export const ORDER_TABLE_FEATURES = {
  selection: true,
} as const

export const TABLE_SCENARIOS = {
  crud: {
    label: '标准 CRUD',
    editMode: 'none',
    tip: '默认采用企业后台常见的弹窗编辑；查看、编辑、删除直接展示，低频操作收纳在更多菜单中，行内编辑默认关闭。',
  },
  cell: {
    label: '单元格编辑',
    editMode: 'cell',
    tip: '双击可编辑单元格；点击另一可编辑单元格会校验并提交上一项，再无缝切换。状态与区域下拉均显示中文。',
  },
  row: {
    label: '整行编辑',
    editMode: 'row',
    tip: '点击操作列的整行编辑进入事务模式；行内控件可连续操作，仅保存或取消会结束本次整行编辑。',
  },
  workspace: {
    label: '数据工作台',
    editMode: 'none',
    tip: '集中体验排序、筛选、列拖动、列宽调整、列工作台、状态持久化与 CSV 导出。',
  },
  tree: {
    label: '树形表格',
    editMode: 'none',
    tip: '区域 → 客户 → 订单三层展开；多选支持父子联动。真实业务还可配置异步子节点加载、取消与失败重试。',
  },
} as const

export type TableScenario = keyof typeof TABLE_SCENARIOS

/** 页面只关心场景数据，C_Tabs 统一负责紧凑呈现与交互。 */
export const TABLE_SCENARIO_TABS = defineTabs(
  (Object.keys(TABLE_SCENARIOS) as TableScenario[]).map(key => ({
    key,
    label: TABLE_SCENARIOS[key].label,
  }))
)

export type TablePreviewState = 'data' | 'loading' | 'empty'

export const TABLE_PREVIEW_OPTIONS = [
  { label: '正常数据', value: 'data' },
  { label: '加载状态', value: 'loading' },
  { label: '空数据状态', value: 'empty' },
]

/** 订单业务列：普通值直接声明，富内容优先使用 Vue render。 */
const createOrderBusinessColumns = (
  editMode: () => 'none' | 'cell' | 'row'
) => {
  const inlineEditable = () => editMode() !== 'none'

  return defineVueColumns<OrderRow>([
    {
      field: 'orderNo',
      headerName: '订单编号',
      width: 150,
      minWidth: 138,
      pinned: 'left',
      initialSort: 'desc',
    },
    {
      field: 'customer',
      headerName: '客户名称',
      minWidth: 140,
      flex: 1,
      editable: inlineEditable,
    },
    {
      field: 'product',
      headerName: '产品方案',
      minWidth: 165,
      flex: 1.15,
      editable: inlineEditable,
    },
    {
      field: 'region',
      headerName: '区域',
      width: 100,
      filter: 'set',
      editable: inlineEditable,
      cellEditor: 'select',
      cellEditorParams: {
        options: REGIONS.map(value => ({ label: value, value })),
      },
    },
    {
      field: 'quantity',
      headerName: '数量',
      width: 90,
      filter: 'number',
      editable: inlineEditable,
      cellEditor: 'number',
      validate: value => Number(value) > 0 || '数量必须大于 0',
    },
    {
      field: 'amount',
      headerName: '订单金额',
      width: 138,
      filter: 'number',
      editable: inlineEditable,
      cellEditor: 'number',
      valueFormatter: ({ value }) => MONEY_FORMATTER.format(Number(value ?? 0)),
      validate: value => Number(value) >= 0 || '金额不能为负数',
    },
    {
      field: 'status',
      headerName: '状态',
      width: 124,
      filter: 'set',
      editable: inlineEditable,
      cellEditor: 'select',
      cellEditorParams: { options: STATUS_OPTIONS },
      render: row => {
        const status = getStatusMeta(row.status)
        return h(
          NTag,
          {
            round: true,
            size: 'small',
            bordered: false,
            type: status.tagType,
          },
          { default: () => status.label }
        )
      },
    },
    {
      field: 'progress',
      headerName: '履约进度',
      width: 150,
      filter: 'number',
      editable: inlineEditable,
      cellEditor: 'number',
      validate: value =>
        (Number(value) >= 0 && Number(value) <= 100) || '进度范围为 0–100',
      render: row =>
        h(NProgress, {
          type: 'line',
          percentage: row.progress,
          height: 6,
          showIndicator: false,
          status: row.progress === 100 ? 'success' : 'default',
        }),
    },
    {
      field: 'updatedAt',
      headerName: '更新时间',
      width: 126,
      filter: 'date',
      editable: inlineEditable,
      cellEditor: 'date',
    },
  ])
}

export const createOrderColumns = (
  editMode: () => 'none' | 'cell' | 'row',
  actions: RowActionsConfig<OrderRow>
) =>
  defineVueColumns<OrderRow>([
    ...(ORDER_TABLE_FEATURES.selection ? [selectionColumn<OrderRow>()] : []),
    indexColumn<OrderRow>({ headerName: '序号' }),
    ...createOrderBusinessColumns(editMode),
    rowActionsColumn<OrderRow>({
      width: 126,
      max: 3,
      ...actions,
      onEdit: params =>
        editMode() === 'row'
          ? params.api.editing.startRow(params.rowIndex)
          : actions.onEdit?.(params),
      confirmDelete: false,
      labels: {
        ...actions.labels,
        /** 根据当前场景展示准确的编辑动作名称。 */
        get edit() {
          return editMode() === 'row' ? '整行编辑' : '编辑'
        },
        confirm: actions.labels?.confirm ?? '保存修改',
        cancel: actions.labels?.cancel ?? '取消修改',
      },
    }),
  ])

/** 树形场景复用相同业务列，但不混入会修改 CRUD 数据源的操作列。 */
export const createOrderTreeColumns = () =>
  defineVueColumns<OrderRow>([
    ...(ORDER_TABLE_FEATURES.selection ? [selectionColumn<OrderRow>()] : []),
    indexColumn<OrderRow>({ headerName: '序号' }),
    ...createOrderBusinessColumns(() => 'none'),
  ])

/** 页面稳定配置；行数据、列、搜索、主题和事件仍由页面显式传入。 */
export const ORDER_TABLE_CONFIG = defineVueTableConfig<OrderRow>({
  defaultColDef: {
    minWidth: 90,
    filter: true,
    align: 'center',
    headerAlign: 'center',
  },
  pagination: ORDER_PAGINATION,
  persistence: {
    // v3 固化“多选 → 序号 → 业务列”的结构，自动隔离旧版本错误列序。
    key: 'robot-admin:demo:mach-table:orders:v3',
    sections: ['columns', 'sort', 'filter', 'pagination'],
    debounceMs: 200,
  },
  rowKey: 'id',
  rowSelection: ORDER_TABLE_FEATURES.selection ? 'multiple' : 'none',
  columnLayout: 'fit',
  size: 'compact',
  enableColumnResize: true,
  stripedRows: true,
  showCellBorders: true,
  columnMenu: true,
  enableRangeSelection: true,
  statusBar: true,
  summaryMethod: ({ colId, values }) => {
    if (colId === 'orderNo') return `合计 ${values.length} 行`
    if (colId === 'quantity')
      return String(values.reduce((sum, value) => sum + Number(value || 0), 0))
    if (colId === 'amount')
      return MONEY_FORMATTER.format(
        values.reduce((sum, value) => sum + Number(value || 0), 0)
      )
    if (colId === 'progress' && values.length) {
      const total = values.reduce((sum, value) => sum + Number(value || 0), 0)
      return `平均 ${Math.round(total / values.length)}%`
    }
    return ''
  },
  gridAriaLabel: '订单管理数据表格',
})

/**
 * 标准单表接口约定。
 *
 * @description
 * request-core 默认处理 GET 列表/详情、POST 新增、PUT 更新、DELETE 删除；
 * 特殊 HTTP 方法或参数格式只需在 useOrderTable 中覆盖对应 mutation。
 */
export const API_CONFIG = {
  list: '/demo/orders/list',
  export: '/demo/orders/export',
  remove: '/demo/orders/remove/:id',
  get: '/demo/orders/getById/:id',
  create: '/demo/orders/save',
  update: '/demo/orders/update/:id',
}

/** 非标准 CRUD 能力显式扩展：下载细节仍由 file-utils 统一治理。 */
export const exportOrderTable = () =>
  useDownloadCSV(
    (_params, context) =>
      request.get<Blob>(API_CONFIG.export, {
        responseType: 'blob',
        signal: context?.signal,
      }),
    `mach-table-orders-${new Date().toISOString().slice(0, 10)}`
  )

const today = () => new Date().toISOString().slice(0, 10)

const createEmptyOrder = (): OrderRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  orderNo: `MT-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`,
  customer: '',
  product: '',
  region: REGIONS[0],
  quantity: 1,
  amount: 0,
  status: 'pending',
  progress: 0,
  updatedAt: today(),
})

/**
 * 订单 CRUD 唯一入口：页面不关心请求方法、并发取消、响应提取和刷新时机。
 * mock 模式使用同一能力契约；切换 VITE_DATA_MODE=remote 后直接调用真实端点。
 */
export const useOrderTable = () =>
  useAppTableCrud({
    source:
      import.meta.env.VITE_DATA_MODE === 'remote'
        ? API_CONFIG
        : createMemoryTableSource(createOrderRows),
    defaultPaginationEnabled: false,
    detail: ORDER_DETAIL_CONFIG,
    detailTitle: row => `订单详情 · ${row.orderNo}`,
    editor: {
      createTitle: '新增订单',
      editTitle: row => `编辑订单 · ${row.orderNo}`,
      prepareSubmit: row => ({
        ...row,
        updatedAt: today(),
      }),
    },
    createNewRow: createEmptyOrder,
  })
