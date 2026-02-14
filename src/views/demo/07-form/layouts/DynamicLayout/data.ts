/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-08 18:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-08 18:00:00
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\data.ts
 * @Description: 动态表单演示页面 - 数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type {
  FormModel,
  FormOption,
  LayoutConfig,
  DynamicFormConfig,
} from '@/types/modules/form'
import { PRESET_RULES } from '@robot-admin/form-validate'

const { required } = PRESET_RULES

// ================= 表单初始数据 =================
export const INITIAL_FORM_DATA: FormModel = {
  name: '',
  gender: null,
  age: 18,
  isActive: false,
  rating: 0,
  description: '',
}

// ================= 动态表单配置 =================
export const DYNAMIC_FORM_CONFIG: DynamicFormConfig = {
  maxFields: 20,
  autoSave: true,
  enableSort: true,
  showControls: true,
  showItemControls: true,
}

// ================= 基础表单字段配置 =================
export const BASE_FORM_OPTIONS: FormOption[] = [
  {
    type: 'input',
    prop: 'name',
    label: '姓名',
    placeholder: '请输入姓名',
    rules: [required('姓名')],
    layout: { span: 12 },
  },
  {
    type: 'select',
    prop: 'gender',
    label: '性别',
    placeholder: '请选择性别',
    children: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
      { label: '其他', value: 'other' },
    ],
    layout: { span: 12 },
  },
  {
    type: 'inputNumber',
    prop: 'age',
    label: '年龄',
    placeholder: '请输入年龄',
    attrs: { min: 1, max: 120 },
    layout: { span: 8 },
  },
  {
    type: 'switch',
    prop: 'isActive',
    label: '是否激活',
    value: false,
    layout: { span: 8 },
  },
  {
    type: 'rate',
    prop: 'rating',
    label: '评分',
    value: 0,
    layout: { span: 8 },
  },
  {
    type: 'textarea',
    prop: 'description',
    label: '描述',
    placeholder: '请输入描述信息',
    layout: { span: 24 },
  },
]

// ================= 布局配置生成器 =================
export const createLayoutConfig = (
  config: DynamicFormConfig
): LayoutConfig => ({
  type: 'dynamic',
  dynamic: {
    dynamic: {
      maxFields: config.maxFields,
    },
    controls: {
      showControls: config.showControls,
      showItemControls: config.showItemControls,
    },
    grid: {
      cols: 24,
      gutter: 16,
    },
  },
})

// ================= 预设配置选项 =================
export const PRESET_CONFIGS = {
  // 基础配置
  basic: {
    maxFields: 10,
    autoSave: false,
    enableSort: false,
    showControls: true,
    showItemControls: false,
  },
  // 标准配置
  standard: {
    maxFields: 20,
    autoSave: true,
    enableSort: true,
    showControls: true,
    showItemControls: true,
  },
  // 高级配置
  advanced: {
    maxFields: 50,
    autoSave: true,
    enableSort: true,
    showControls: true,
    showItemControls: true,
  },
} as const

// ================= 表单验证配置 =================
export const VALIDATION_CONFIG = {
  // 提交延迟模拟
  SUBMIT_DELAY: 1500,

  // 验证消息
  MESSAGES: {
    SUBMIT_SUCCESS: '表单提交成功',
    SUBMIT_ERROR: '表单提交失败',
    VALIDATION_SUCCESS: '验证成功',
    VALIDATION_ERROR: '验证失败',
    FIELD_ADD: '字段添加成功',
    FIELD_REMOVE: '字段移除成功',
    FIELD_TOGGLE: '字段状态切换',
    FIELDS_CLEAR: '所有动态字段已清空',
  },
} as const

// ================= 预览数据配置 =================
export const PREVIEW_TABS = [
  {
    name: 'formData',
    tab: '表单数据',
    icon: 'i-mdi:form-select',
  },
  {
    name: 'config',
    tab: '动态配置',
    icon: 'i-mdi:cog',
  },
  {
    name: 'allFields',
    tab: '所有字段',
    icon: 'i-mdi:view-list',
  },
] as const

// ================= 工具函数 =================

/**
 * 字段统计数据接口
 */
interface FieldStats {
  allFieldsCount: number
  baseFieldsCount: number
  dynamicFieldsCount: number
  visibleFieldsCount: number
  hiddenFieldsCount: number
}

/**
 * 表单状态接口
 */
interface FormState {
  config: DynamicFormConfig
  isInitialized: boolean
}

/**
 * 生成动态配置快照
 */
export const createConfigSnapshot = (stats: FieldStats, state: FormState) => ({
  totalFields: stats.allFieldsCount,
  baseFields: stats.baseFieldsCount,
  dynamicFields: stats.dynamicFieldsCount,
  visibleFields: stats.visibleFieldsCount,
  hiddenFields: stats.hiddenFieldsCount,
  config: state.config,
  stateInitialized: state.isInitialized,
})

/**
 * 创建字段统计工具函数
 */
export const createFieldStats = (
  allFieldsCount: number,
  baseFieldsCount: number,
  dynamicFieldsCount: number,
  visibleFieldsCount: number,
  hiddenFieldsCount: number
): FieldStats => ({
  allFieldsCount,
  baseFieldsCount,
  dynamicFieldsCount,
  visibleFieldsCount,
  hiddenFieldsCount,
})

/**
 * 创建表单状态工具函数
 */
export const createFormState = (
  config: DynamicFormConfig,
  isInitialized: boolean
): FormState => ({
  config,
  isInitialized,
})

/**
 * 格式化字段数据用于预览
 */
export const formatFieldsForPreview = (fields: FormOption[]) =>
  fields.map(f => ({
    prop: f.prop,
    label: f.label,
    type: f.type,
    required: f.rules?.some((rule: any) => rule.required) || false,
    span: f.layout?.span || 12,
  }))

/**
 * 创建表单操作按钮配置
 */
export const FORM_ACTIONS = {
  submit: {
    type: 'primary' as const,
    size: 'large' as const,
    icon: 'mdi:check-circle-outline',
    getText: (loading: boolean) => (loading ? '提交中...' : '提交表单'),
  },
  reset: {
    size: 'large' as const,
    icon: 'mdi:refresh',
    text: '重置表单',
  },
  preview: {
    size: 'large' as const,
    icon: 'mdi:code-json',
    text: '预览数据',
  },
} as const

// ================= 演示用的扩展字段模板 =================
export const DEMO_FIELD_TEMPLATES: Partial<FormOption>[] = [
  {
    type: 'input',
    label: '邮箱地址',
    placeholder: '请输入邮箱地址',
    layout: { span: 12 },
  },
  {
    type: 'input',
    label: '电话号码',
    placeholder: '请输入电话号码',
    layout: { span: 12 },
  },
  {
    type: 'datePicker',
    label: '出生日期',
    placeholder: '请选择出生日期',
    layout: { span: 12 },
  },
  {
    type: 'select',
    label: '所在城市',
    placeholder: '请选择所在城市',
    children: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
      { label: '深圳', value: 'shenzhen' },
    ],
    layout: { span: 12 },
  },
  {
    type: 'textarea',
    label: '个人简介',
    placeholder: '请输入个人简介',
    layout: { span: 24 },
  },
]
