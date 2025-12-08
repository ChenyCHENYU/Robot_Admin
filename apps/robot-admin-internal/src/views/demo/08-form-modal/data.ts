import type {
  FormOption,
  LayoutType,
  ComponentType,
  OptionItem,
  ItemLayoutConfig,
} from '@/types/modules/form'
import { PRESET_RULES, RULE_COMBOS } from '@/utils/v_verify'

// 类型定义
export type ContainerType =
  | 'modal'
  | 'drawer'
  | 'sidebar'
  | 'popover'
  | 'wizard'

export type StatusType = 'default' | 'error' | 'info' | 'success' | 'warning'

export interface ContainerCard {
  key: ContainerType
  title: string
  description: string
  icon: string
  iconColor: string
  tagType: StatusType
  features: string[]
  actionText: string
  actionIcon: string
  fields: number
  layout: string
  complexity: number
}

interface ContainerConfigItem {
  layout: LayoutType
  title: string
  description: string
  icon: string
  iconColor: string
  tagType: StatusType
  features: string[]
  actionText: string
  actionIcon: string
  complexity: number
  statusType: StatusType
  getStatusText: (state: boolean) => string
}

// 预定义选项
const OPTIONS = {
  ROLE: [
    { value: 'admin', label: '管理员' },
    { value: 'user', label: '普通用户' },
    { value: 'guest', label: '访客' },
  ] as OptionItem[],

  CATEGORY: [
    { value: 'electronics', label: '电子产品' },
    { value: 'clothing', label: '服装' },
    { value: 'books', label: '图书' },
  ] as OptionItem[],

  STATUS: [
    { value: 'active', label: '活跃' },
    { value: 'inactive', label: '非活跃' },
    { value: 'pending', label: '待处理' },
  ] as OptionItem[],

  PRIORITY: [
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ] as OptionItem[],

  TEMPLATE: [
    { value: 'vue', label: 'Vue 3 项目' },
    { value: 'react', label: 'React 项目' },
    { value: 'node', label: 'Node.js 项目' },
  ] as OptionItem[],

  FEATURE: [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'eslint', label: 'ESLint' },
    { value: 'prettier', label: 'Prettier' },
    { value: 'tests', label: '单元测试' },
  ] as OptionItem[],

  TYPE: [
    { value: 'type1', label: '类型一' },
    { value: 'type2', label: '类型二' },
  ] as OptionItem[],
} as const

// 字段工厂函数
const createField = (
  type: ComponentType,
  prop: string,
  label: string,
  options: Partial<FormOption> = {}
): FormOption => ({
  type,
  prop,
  label,
  placeholder:
    options.placeholder || `请${type === 'select' ? '选择' : '输入'}${label}`,
  rules: options.rules || [PRESET_RULES.required(label)],
  ...options,
})

// 简化的字段创建函数
const field = {
  input: (prop: string, label: string, options?: Partial<FormOption>) =>
    createField('input', prop, label, options),

  select: (
    prop: string,
    label: string,
    children: OptionItem[],
    options?: Partial<FormOption>
  ) => createField('select', prop, label, { children, ...options }),

  textarea: (
    prop: string,
    label: string,
    rows = 4,
    options?: Partial<FormOption>
  ) => createField('textarea', prop, label, { attrs: { rows }, ...options }),

  number: (prop: string, label: string, options?: Partial<FormOption>) =>
    createField('inputNumber', prop, label, options),

  switch: (
    prop: string,
    label: string,
    defaultValue = false,
    options?: Partial<FormOption>
  ): FormOption => ({
    type: 'switch',
    prop,
    label,
    value: defaultValue,
    ...options,
  }),

  checkbox: (
    prop: string,
    label: string,
    children: OptionItem[],
    options?: Partial<FormOption>
  ): FormOption => ({
    type: 'checkbox',
    prop,
    label,
    children,
    value: [],
    rules: [],
    ...options,
  }),
}

// 容器配置
export const containerConfig: Record<ContainerType, ContainerConfigItem> = {
  modal: {
    layout: 'grid',
    title: '模态框表单',
    description: '适用于新增/编辑单个实体，快速配置操作，空间有限时的最佳选择',
    icon: 'mdi:book-information-variant',
    iconColor: '#2080f0',
    tagType: 'info',
    features: ['空间有限', '聚焦操作', '网格布局', '快进快出'],
    actionText: '打开模态框',
    actionIcon: 'i-carbon-launch',
    complexity: 3,
    statusType: 'info',
    getStatusText: (visible: boolean) => (visible ? '已打开' : '就绪'),
  },
  drawer: {
    layout: 'default',
    title: '抽屉表单',
    description: '适用于详情查看+编辑，多步骤数据录入，信息展示更加丰富',
    icon: 'mdi:this-side-up-outline',
    iconColor: '#18a058',
    tagType: 'success',
    features: ['空间充足', '详情编辑', '默认布局', '信息丰富'],
    actionText: '打开抽屉',
    actionIcon: 'i-carbon-arrow-right',
    complexity: 4,
    statusType: 'success',
    getStatusText: (visible: boolean) => (visible ? '已打开' : '就绪'),
  },
  sidebar: {
    layout: 'default',
    title: '侧边栏表单',
    description: '适用于实时筛选器，快速操作面板，不干扰主要工作流程',
    icon: 'mdi:page-layout-sidebar-right',
    iconColor: '#f0a020',
    tagType: 'warning',
    features: ['紧凑布局', '实时筛选', '辅助操作', '不干扰主流程'],
    actionText: '侧边栏',
    actionIcon: 'i-carbon-panel-expansion',
    complexity: 2,
    statusType: 'warning',
    getStatusText: (collapsed: boolean) => (collapsed ? '已收起' : '已展开'),
  },
  popover: {
    layout: 'inline',
    title: '浮动表单',
    description: '适用于快速编辑单个字段，简单配置项调整，轻量级交互',
    icon: 'mdi:format-float-center',
    iconColor: '#d03050',
    tagType: 'error',
    features: ['轻量级', '内联布局', '快速编辑', '即时反馈'],
    actionText: '切换浮动表单',
    actionIcon: 'i-carbon-cursor-1',
    complexity: 1,
    statusType: 'error',
    getStatusText: (visible: boolean) => (visible ? '已激活' : '待激活'),
  },
  wizard: {
    layout: 'steps',
    title: '步骤向导表单',
    description: '适用于复杂流程分步引导，用户注册，项目创建向导',
    icon: 'mdi:debug-step-over',
    iconColor: '#d03050',
    tagType: 'success',
    features: ['分步引导', '流程清晰', '复杂配置', '进度跟踪'],
    actionText: '启动向导',
    actionIcon: 'i-carbon-play',
    complexity: 5,
    statusType: 'success',
    getStatusText: (visible: boolean) => (visible ? '进行中' : '待启动'),
  },
}

// 表单配置
export const formOptions: Record<ContainerType, FormOption[]> = {
  modal: [
    field.input('username', '用户名', {
      rules: RULE_COMBOS.username('用户名'),
    }),
    field.input('email', '邮箱', { rules: RULE_COMBOS.email('邮箱') }),
    field.select('role', '角色', OPTIONS.ROLE),
    field.input('phone', '手机号', { rules: RULE_COMBOS.mobile('手机号') }),
  ],

  drawer: [
    field.input('productName', '商品名称'),
    field.textarea('description', '商品描述', 4, { rules: [] }),
    field.number('price', '价格', {
      attrs: { min: 0, precision: 2 },
      rules: [
        PRESET_RULES.required('价格'),
        PRESET_RULES.range('价格', 0.01, 999999.99),
      ],
    }),
    field.select('category', '分类', OPTIONS.CATEGORY),
    field.switch('isPublished', '是否发布'),
    field.switch('allowReturns', '允许退货', true),
  ],

  sidebar: [
    field.input('keyword', '关键词', { rules: [] }),
    field.select('status', '状态', OPTIONS.STATUS, { rules: [] }),
    field.select('type', '类型', OPTIONS.TYPE, { rules: [] }),
  ],

  popover: [
    field.input('title', '标题'),
    field.select('priority', '优先级', OPTIONS.PRIORITY),
  ],

  wizard: [
    field.input('projectName', '项目名称', {
      layout: { step: 'step1' } as ItemLayoutConfig,
    }),
    field.textarea('projectDesc', '项目描述', 3, {
      placeholder: '请描述项目用途',
      layout: { step: 'step1' } as ItemLayoutConfig,
      rules: [],
    }),
    field.select('template', '项目模板', OPTIONS.TEMPLATE, {
      layout: { step: 'step2' } as ItemLayoutConfig,
    }),
    field.checkbox('features', '功能特性', OPTIONS.FEATURE, {
      layout: { step: 'step2' } as ItemLayoutConfig,
    }),
    field.input('gitRepo', 'Git 仓库', {
      layout: { step: 'step3' } as ItemLayoutConfig,
      rules: [],
    }),
    field.switch('autoCommit', '自动提交', false, {
      layout: { step: 'step3' } as ItemLayoutConfig,
    }),
  ],
}

// 工具函数
const getLayoutDisplayName = (
  layout: LayoutType,
  containerKey: ContainerType
): string => {
  const layoutMap: Record<LayoutType, string> = {
    grid: 'Grid',
    steps: 'Steps',
    inline: 'Inline',
    default: containerKey === 'sidebar' ? 'Compact' : 'Default',
    card: 'Card',
    tabs: 'Tabs',
    dynamic: 'Dynamic',
    custom: 'Custom',
  }
  return layoutMap[layout] || 'Default'
}

// 派生配置
export const layoutTypes: Record<ContainerType, LayoutType> =
  Object.fromEntries(
    Object.entries(containerConfig).map(([key, config]) => [key, config.layout])
  ) as Record<ContainerType, LayoutType>

export const containerCards: ContainerCard[] = (
  Object.keys(containerConfig) as ContainerType[]
).map(key => {
  const config = containerConfig[key]
  return {
    key,
    title: config.title,
    description: config.description,
    icon: config.icon,
    iconColor: config.iconColor,
    tagType: config.tagType,
    features: config.features,
    actionText: config.actionText,
    actionIcon: config.actionIcon,
    fields: formOptions[key].length,
    layout: getLayoutDisplayName(config.layout, key),
    complexity: config.complexity,
  }
})

export const createDefaultFormData = (): Record<
  ContainerType,
  Record<string, any>
> =>
  Object.fromEntries(
    (Object.keys(containerConfig) as ContainerType[]).map(key => [key, {}])
  ) as Record<ContainerType, Record<string, any>>

// 统计信息
export const headerStats = [
  {
    label: '容器类型',
    value: Object.keys(containerConfig).length,
    type: 'info' as StatusType,
    icon: 'mdi:open-container-initiative',
  },
  {
    label: '表单字段',
    value: Object.values(formOptions).reduce(
      (total, options) => total + options.length,
      0
    ),
    type: 'success' as StatusType,
    icon: 'mdi:form-dropdown',
  },
  {
    label: '布局模式',
    value: new Set(Object.values(layoutTypes)).size,
    type: 'warning' as StatusType,
    icon: 'mdi:page-layout-sidebar-left',
  },
] as const
