import type {
  SearchFormItem,
  SearchOptionItem,
} from '@robot-admin/naive-ui-components'

// 类型定义
export interface OptionItem extends SearchOptionItem {
  labelDefault: string
  value?: string | number
  disabled?: boolean
}

export interface FormItem extends SearchFormItem {
  type: 'input' | 'select' | 'date-range'
  prop: string
  placeholder?: string
  list?: OptionItem[]
  hisList?: string[]
  isFocus?: boolean
  show?: boolean
}

export interface BaseFormParams {
  pageNum: number
  pageSize: number
  [key: string]: any
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

// 重置表单参数
/**
 *
 */
export function resetFormParams<T extends Record<string, any>>(
  target: { [K in keyof T]: T[K] },
  source: T
): void {
  Object.keys(target).forEach(key => {
    target[key as keyof T] = source[key as keyof T]
  })
}

// 模拟数据生成器
const mockDataGenerators = {
  basic: (params: FormParams) => [
    {
      id: 1,
      name: (params as BasicFormParams).name || '用户1',
      status: (params as BasicFormParams).status || '启用',
    },
    {
      id: 2,
      name: (params as BasicFormParams).name || '用户2',
      status: (params as BasicFormParams).status || '禁用',
    },
  ],
  advanced: (params: FormParams) => [
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
  mega: (params: FormParams) => [
    { id: 1, type: '超多字段测试', fields: Object.keys(params).length },
  ],
} as const

// 生成模拟搜索结果
/**
 *
 */
export function generateMockResults(
  type: keyof typeof mockDataGenerators,
  params: FormParams
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
