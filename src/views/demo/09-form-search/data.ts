/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-18
 * @FilePath: \Robot_Admin\src\views\demo\09-form-search\data.ts
 * @Description: 搜索演示字段、重置默认值与结果生成
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type {
  SearchFormItem,
  SearchFormParams,
} from '@robot-admin/naive-ui-components'

export interface BaseFormParams extends SearchFormParams {
  pageNum: number
  pageSize: number
}

export interface BasicFormParams extends BaseFormParams {
  name: string
  status: number | null
  dateRange: string | null
}

export interface AdvancedFormParams extends BaseFormParams {
  keyword: string
  category: string | null
  level: string | null
  region: string
  timeRange: string | null
  price: string
  tags: string
  department: string | null
  priority: string | null
  assignee: string
  project: string
  version: string
}

export interface MegaFormParams extends BaseFormParams {
  [key: string]: string | number
  field1: string
  field2: string
  field3: string
  field4: string
  field5: string
  field6: string
  field7: string
  field8: string
  field9: string
  field10: string
  field11: string
  field12: string
  field13: string
  field14: string
  field15: string
  field16: string
}

export type FormParams = BasicFormParams | AdvancedFormParams | MegaFormParams

export interface FormConfig<T extends BaseFormParams> {
  params: T
  items: SearchFormItem[]
  historyKey: string
}

export interface SearchResult {
  id: number
  [key: string]: unknown
}

/** 搜索与表格共享密度，保留每个示例的独立草稿。 */
export const DENSITY_OPTIONS = [
  { label: '紧凑', value: 'compact' },
  { label: '标准', value: 'default' },
  { label: '舒适', value: 'comfortable' },
] as const

export interface SearchPreviewRow extends SearchResult {
  name: string
  status: number
  createdAt: number
}

/** 基础搜索使用真实可筛选的内存数据，状态 0 同样有效。 */
export const SEARCH_PREVIEW_ROWS: SearchPreviewRow[] = [
  {
    id: 1,
    name: '张三',
    status: 1,
    createdAt: new Date(2026, 9, 16, 10).getTime(),
  },
  {
    id: 2,
    name: '李四',
    status: 0,
    createdAt: new Date(2026, 9, 17, 14).getTime(),
  },
  {
    id: 3,
    name: '王五',
    status: 2,
    createdAt: new Date(2026, 9, 18, 9).getTime(),
  },
]

/** 根据已提交的条件筛选，输入草稿与列表查询分开。 */
export function filterSearchPreview(
  params: SearchFormParams
): SearchPreviewRow[] {
  const name =
    typeof params.name === 'string' ? params.name.trim().toLowerCase() : ''
  const range = Array.isArray(params.dateRange) ? params.dateRange : []
  const timestamps = range.map(value =>
    typeof value === 'number' ? value : new Date(String(value)).getTime()
  )
  return SEARCH_PREVIEW_ROWS.filter(
    row =>
      (!name || row.name.toLowerCase().includes(name)) &&
      (params.status === null ||
        params.status === undefined ||
        row.status === params.status) &&
      (timestamps.length !== 2 ||
        !timestamps.every(Number.isFinite) ||
        (row.createdAt >= timestamps[0] && row.createdAt <= timestamps[1]))
  )
}

// 基础示例配置
export const basicFormConfig: FormConfig<BasicFormParams> = {
  params: {
    name: '',
    status: null,
    dateRange: null,
    pageNum: 1,
    pageSize: 10,
  },
  items: [
    { type: 'input', prop: 'name', placeholder: '请输入用户名称', hisList: [] },
    {
      type: 'select',
      prop: 'status',
      placeholder: '请选择状态',
      list: [
        { labelDefault: '启用', value: 1 },
        { labelDefault: '禁用', value: 0 },
        { labelDefault: '待审核', value: 2 },
      ],
    },
    { type: 'date-range', prop: 'dateRange', placeholder: '请选择时间范围' },
  ],
  historyKey: 'basic_search_history',
}

// 高级示例配置
export const advancedFormConfig: FormConfig<AdvancedFormParams> = {
  params: {
    keyword: '',
    category: null,
    level: null,
    region: '',
    timeRange: null,
    price: '',
    tags: '',
    department: null,
    priority: null,
    assignee: '',
    project: '',
    version: '',
    pageNum: 1,
    pageSize: 20,
  },
  items: [
    {
      type: 'input',
      prop: 'keyword',
      placeholder: '请输入关键词搜索',
      hisList: [],
    },
    {
      type: 'select',
      prop: 'category',
      placeholder: '请选择分类',
      list: [
        { labelDefault: '科技' },
        { labelDefault: '教育' },
        { labelDefault: '娱乐' },
      ],
    },
    {
      type: 'select',
      prop: 'level',
      placeholder: '请选择级别',
      list: [
        { labelDefault: '初级' },
        { labelDefault: '中级' },
        { labelDefault: '高级' },
      ],
    },
    { type: 'input', prop: 'region', placeholder: '请输入地区', hisList: [] },
    { type: 'date-range', prop: 'timeRange', placeholder: '请选择时间范围' },
    { type: 'input', prop: 'price', placeholder: '请输入价格', hisList: [] },
    { type: 'input', prop: 'tags', placeholder: '请输入标签', hisList: [] },
    {
      type: 'select',
      prop: 'department',
      placeholder: '请选择部门',
      list: [
        { labelDefault: '技术部' },
        { labelDefault: '产品部' },
        { labelDefault: '运营部' },
      ],
    },
    {
      type: 'select',
      prop: 'priority',
      placeholder: '请选择优先级',
      list: [
        { labelDefault: '高' },
        { labelDefault: '中' },
        { labelDefault: '低' },
      ],
    },
    {
      type: 'input',
      prop: 'assignee',
      placeholder: '请输入负责人',
      hisList: [],
    },
    {
      type: 'input',
      prop: 'project',
      placeholder: '请输入项目名称',
      hisList: [],
    },
    {
      type: 'input',
      prop: 'version',
      placeholder: '请输入版本号',
      hisList: [],
    },
  ],
  historyKey: 'advanced_search_history',
}

// 创建超多字段表单配置
/**
 *
 */
function createMegaFormConfig(fieldCount = 16): FormConfig<MegaFormParams> {
  const params: MegaFormParams = {
    pageNum: 1,
    pageSize: 50,
    ...Object.fromEntries(
      Array.from({ length: fieldCount }, (_, i) => [`field${i + 1}`, ''])
    ),
  } as MegaFormParams

  const items: SearchFormItem[] = Array.from(
    { length: fieldCount },
    (_, i) => ({
      type: 'input' as const,
      prop: `field${i + 1}`,
      placeholder: `请输入字段${i + 1}`,
      hisList: [],
    })
  )

  return { params, items, historyKey: 'mega_search_history' }
}

export const megaFormConfig = createMegaFormConfig()

/** 将初始值交给搜索组件，输入和重置共用同一份字段契约。 */
export function createSearchFields<T extends BaseFormParams>(
  config: FormConfig<T>
): SearchFormItem[] {
  return config.items.map(item => ({
    ...item,
    defaultValue: config.params[item.prop],
  }))
}

// 模拟数据生成器
const mockDataGenerators = {
  basic: (params: SearchFormParams) => [
    {
      id: 1,
      name: (params as BasicFormParams).name || '用户1',
      status: (params as BasicFormParams).status ?? '启用',
    },
    {
      id: 2,
      name: (params as BasicFormParams).name || '用户2',
      status: (params as BasicFormParams).status ?? '禁用',
    },
  ],
  advanced: (params: SearchFormParams) => [
    {
      id: 1,
      keyword: (params as AdvancedFormParams).keyword || '关键词1',
      category: (params as AdvancedFormParams).category || '科技',
    },
    {
      id: 2,
      keyword: (params as AdvancedFormParams).keyword || '关键词2',
      category: (params as AdvancedFormParams).category || '教育',
    },
  ],
  mega: (params: SearchFormParams) => [
    { id: 1, type: '超多字段测试', fields: Object.keys(params).length },
  ],
} as const

// 生成模拟搜索结果
/**
 *
 */
export function generateMockResults(
  type: keyof typeof mockDataGenerators,
  params: SearchFormParams
): SearchResult[] {
  return mockDataGenerators[type]?.(params) || []
}

// 格式化参数用于日志
/**
 *
 */
export function formatParamsForLog(params: FormParams, type: string): string {
  const filteredParams = Object.entries(params)
    .filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  return `[${type}] 有效参数: ${JSON.stringify(filteredParams, null, 2)}`
}

/** 使用组件原生字段契约；多选和布尔值无需页面自行编码。 */
export const SELECTION_SEARCH_FIELDS: SearchFormItem[] = [
  {
    type: 'select',
    prop: 'statuses',
    placeholder: '可多选账号状态',
    attrs: { multiple: true },
    defaultValue: [],
    list: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
      { label: '待审核', value: 2 },
    ],
  },
  {
    type: 'select',
    prop: 'enabled',
    placeholder: '是否可用',
    defaultValue: false,
    list: [
      { label: '可用', value: true },
      { label: '不可用', value: false },
    ],
  },
]

/** 两组条件取交集；空多选和清空布尔条件分别代表不限。 */
export function filterSelectionPreview(
  params: SearchFormParams
): SearchPreviewRow[] {
  const statuses = Array.isArray(params.statuses) ? params.statuses : []
  return SEARCH_PREVIEW_ROWS.filter(
    row =>
      (statuses.length === 0 || statuses.includes(row.status)) &&
      (typeof params.enabled !== 'boolean' ||
        (row.status === 1) === params.enabled)
  )
}
