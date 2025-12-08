import type { SearchFormItem, SearchOptionItem } from '@/types/modules/form'

// 基础类型定义 - 使用兼容性类型
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

// 更精确的表单参数类型定义
export interface BaseFormParams {
  pageNum: number
  pageSize: number
  [key: string]: any // 添加索引签名解决泛型约束问题
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

// 修复 MegaFormParams 类型错误
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

// 联合类型
export type FormParams = BasicFormParams | AdvancedFormParams | MegaFormParams

// 配置类型 - 使用兼容性类型
export interface FormConfig<T extends BaseFormParams> {
  params: T
  items: SearchFormItem[] // 使用 SearchFormItem 而不是 FormItem
  historyKey: string
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
    {
      type: 'input',
      prop: 'name',
      placeholder: '请输入用户名称',
      hisList: [],
    },
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
    {
      type: 'date-range',
      prop: 'dateRange',
      placeholder: '请选择时间范围',
    },
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
    {
      type: 'input',
      prop: 'region',
      placeholder: '请输入地区',
      hisList: [],
    },
    {
      type: 'date-range',
      prop: 'timeRange',
      placeholder: '请选择时间范围',
    },
    {
      type: 'input',
      prop: 'price',
      placeholder: '请输入价格',
      hisList: [],
    },
    {
      type: 'input',
      prop: 'tags',
      placeholder: '请输入标签',
      hisList: [],
    },
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

/**
 * * @description: 创建超多字段表单配置
 * ? @param {number} fieldCount 字段数量
 * ! @return {FormConfig<MegaFormParams>} 超多字段表单配置对象
 */
function createMegaFormConfig(fieldCount = 16): FormConfig<MegaFormParams> {
  // 创建初始参数对象
  const params: MegaFormParams = {
    pageNum: 1,
    pageSize: 50,
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: '',
    field6: '',
    field7: '',
    field8: '',
    field9: '',
    field10: '',
    field11: '',
    field12: '',
    field13: '',
    field14: '',
    field15: '',
    field16: '',
  }

  /**
   * * @description: 创建表单项配置数组
   * ? @param {number} count 字段数量
   * ! @return {SearchFormItem[]} 表单项配置数组
   */
  const createFormItems = (count: number): SearchFormItem[] => {
    return Array.from({ length: count }, (_, index) => ({
      type: 'input' as const,
      prop: `field${index + 1}`,
      placeholder: `请输入字段${index + 1}`,
      hisList: [],
    }))
  }

  return {
    params,
    items: createFormItems(fieldCount),
    historyKey: 'mega_search_history',
  }
}

export const megaFormConfig = createMegaFormConfig()

// 搜索结果类型定义
export interface SearchResult {
  id: number
  [key: string]: unknown
}

/**
 * * @description: 生成基础表单模拟搜索结果
 * ? @param {FormParams} params 表单参数
 * ! @return {SearchResult[]} 搜索结果数组
 */
const generateBasicResults = (params: FormParams): SearchResult[] => {
  const basicParams = params as BasicFormParams
  return [
    {
      id: 1,
      name: basicParams.name || '用户1',
      status: basicParams.status || '启用',
    },
    {
      id: 2,
      name: basicParams.name || '用户2',
      status: basicParams.status || '禁用',
    },
  ]
}

/**
 * * @description: 生成高级表单模拟搜索结果
 * ? @param {FormParams} params 表单参数
 * ! @return {SearchResult[]} 搜索结果数组
 */
const generateAdvancedResults = (params: FormParams): SearchResult[] => {
  const advancedParams = params as AdvancedFormParams
  return [
    {
      id: 1,
      keyword: advancedParams.keyword || '关键词1',
      category: advancedParams.category || '科技',
      level: advancedParams.level || '高级',
    },
    {
      id: 2,
      keyword: advancedParams.keyword || '关键词2',
      category: advancedParams.category || '教育',
      level: advancedParams.level || '中级',
    },
  ]
}

/**
 * * @description: 生成超多字段表单模拟搜索结果
 * ? @param {FormParams} params 表单参数
 * ! @return {SearchResult[]} 搜索结果数组
 */
const generateMegaResults = (params: FormParams): SearchResult[] => {
  return [
    {
      id: 1,
      type: '超多字段测试',
      fields: Object.keys(params).length,
    },
  ]
}

// 模拟数据生成器映射
const mockDataGenerators = {
  basic: generateBasicResults,
  advanced: generateAdvancedResults,
  mega: generateMegaResults,
} as const

/**
 * * @description: 根据表单类型生成模拟搜索结果
 * ? @param {keyof typeof mockDataGenerators} type 表单类型
 * ? @param {FormParams} params 表单参数
 * ! @return {SearchResult[]} 模拟搜索结果数组
 */
export function generateMockResults(
  type: keyof typeof mockDataGenerators,
  params: FormParams
): SearchResult[] {
  const generator = mockDataGenerators[type]
  return generator ? generator(params) : []
}

/**
 * * @description: 格式化表单参数用于日志输出
 * ? @param {FormParams} params 表单参数
 * ? @param {string} type 表单类型
 * ! @return {string} 格式化后的参数字符串
 */
export function formatParamsForLog(params: FormParams, type: string): string {
  const filteredParams = Object.entries(params)
    .filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  return `[${type}] 有效参数: ${JSON.stringify(filteredParams, null, 2)}`
}

/**
 * * @description: 重置表单参数到初始状态
 * ? @param {T} target 目标表单参数对象
 * ? @param {T} source 源初始参数对象
 * ! @return {void} 无返回值，直接修改目标对象
 */
export function resetFormParams<T extends Record<string, any>>(
  target: { [K in keyof T]: T[K] }, // 修改为可写类型
  source: T
): void {
  Object.keys(target).forEach(key => {
    target[key as keyof T] = source[key as keyof T]
  })
}
