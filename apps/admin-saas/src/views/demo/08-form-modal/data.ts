/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-04
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-09
 * @FilePath: \Robot_Admin\src\views\demo\08-form-modal\data.ts
 * @Description: 多模态表单演示页 - 配置数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { FormConfig, FormOption } from '@robot-admin/naive-ui-components'
import { PRESET_RULES, RULE_COMBOS } from '@robot-admin/form-validate'

// =================== 卡片展示数据 ===================

export interface CardInfo {
  key: string
  title: string
  description: string
  icon: string
  tag: string
  tagType: 'info' | 'success' | 'warning' | 'error'
  features: string[]
  buttonText: string
  buttonIcon: string
}

export const cards: CardInfo[] = [
  {
    key: 'modal',
    title: '模态框表单',
    description: '适用于新增/编辑单个实体，快速配置操作',
    icon: 'mdi:book-information-variant',
    tag: 'Grid',
    tagType: 'info',
    features: ['空间有限', '聚焦操作', '网格布局', '快进快出'],
    buttonText: '打开模态框',
    buttonIcon: 'i-carbon-launch',
  },
  {
    key: 'drawer',
    title: '抽屉表单',
    description: '适用于详情查看+编辑，多步骤数据录入',
    icon: 'mdi:this-side-up-outline',
    tag: 'Default',
    tagType: 'success',
    features: ['空间充足', '详情编辑', '默认布局', '信息丰富'],
    buttonText: '打开抽屉',
    buttonIcon: 'i-carbon-arrow-right',
  },
  {
    key: 'sidebar',
    title: '侧边栏表单',
    description: '适用于实时筛选器，快速操作面板',
    icon: 'mdi:page-layout-sidebar-right',
    tag: 'Compact',
    tagType: 'warning',
    features: ['紧凑布局', '实时筛选', '辅助操作', '不干扰主流程'],
    buttonText: '侧边栏',
    buttonIcon: 'i-carbon-panel-expansion',
  },
  {
    key: 'popover',
    title: '浮动表单',
    description: '适用于快速编辑单个字段，轻量级交互',
    icon: 'mdi:float-portrait',
    tag: 'Inline',
    tagType: 'error',
    features: ['轻量级', '内联布局', '快速编辑', '即时反馈'],
    buttonText: '打开浮动表单',
    buttonIcon: 'mdi:float-portrait',
  },
  {
    key: 'wizard',
    title: '步骤向导表单',
    description: '适用于复杂流程分步引导，项目创建向导',
    icon: 'mdi:debug-step-over',
    tag: 'Steps',
    tagType: 'success',
    features: ['分步引导', '流程清晰', '复杂配置', '进度跟踪'],
    buttonText: '启动向导',
    buttonIcon: 'i-carbon-play',
  },
]

// =================== 模态框 - 用户信息（Grid） ===================

export const modalOptions: FormOption[] = [
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
    rules: RULE_COMBOS.username('用户名'),
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱',
    rules: RULE_COMBOS.email('邮箱'),
  },
  {
    type: 'select',
    prop: 'role',
    label: '角色',
    placeholder: '请选择角色',
    rules: [PRESET_RULES.required('角色')],
    children: [
      { value: 'admin', label: '管理员' },
      { value: 'user', label: '普通用户' },
      { value: 'guest', label: '访客' },
    ],
  },
  {
    type: 'input',
    prop: 'phone',
    label: '手机号',
    placeholder: '请输入手机号',
    rules: RULE_COMBOS.mobile('手机号'),
  },
]
export const modalConfig: FormConfig = { layout: 'grid' }

// =================== 抽屉 - 商品配置（Default） ===================

export const drawerOptions: FormOption[] = [
  {
    type: 'input',
    prop: 'productName',
    label: '商品名称',
    placeholder: '请输入商品名称',
    rules: [PRESET_RULES.required('商品名称')],
  },
  {
    type: 'textarea',
    prop: 'description',
    label: '商品描述',
    placeholder: '请输入商品描述',
    attrs: { rows: 4 },
  },
  {
    type: 'inputNumber',
    prop: 'price',
    label: '价格',
    placeholder: '请输入价格',
    attrs: { min: 0, precision: 2 },
    rules: [
      PRESET_RULES.required('价格'),
      PRESET_RULES.range('价格', 0.01, 999999.99),
    ],
  },
  {
    type: 'select',
    prop: 'category',
    label: '分类',
    placeholder: '请选择分类',
    rules: [PRESET_RULES.required('分类')],
    children: [
      { value: 'electronics', label: '电子产品' },
      { value: 'clothing', label: '服装' },
      { value: 'books', label: '图书' },
    ],
  },
  { type: 'switch', prop: 'isPublished', label: '是否发布', value: false },
  { type: 'switch', prop: 'allowReturns', label: '允许退货', value: true },
]
export const drawerConfig: FormConfig = {
  layout: 'default',
  showActions: false,
}

// =================== 侧边栏 - 筛选条件（Compact） ===================

export const sidebarOptions: FormOption[] = [
  {
    type: 'input',
    prop: 'keyword',
    label: '关键词',
    placeholder: '请输入关键词',
  },
  {
    type: 'select',
    prop: 'status',
    label: '状态',
    placeholder: '请选择状态',
    children: [
      { value: 'active', label: '活跃' },
      { value: 'inactive', label: '非活跃' },
      { value: 'pending', label: '待处理' },
    ],
  },
  {
    type: 'select',
    prop: 'type',
    label: '类型',
    placeholder: '请选择类型',
    children: [
      { value: 'type1', label: '类型一' },
      { value: 'type2', label: '类型二' },
    ],
  },
]
export const sidebarConfig: FormConfig = { layout: 'default' }

// =================== 浮动 - 快速编辑（Inline） ===================

export const popoverOptions: FormOption[] = [
  {
    type: 'input',
    prop: 'title',
    label: '标题',
    placeholder: '请输入标题',
    rules: [PRESET_RULES.required('标题')],
  },
  {
    type: 'select',
    prop: 'priority',
    label: '优先级',
    placeholder: '请选择优先级',
    rules: [PRESET_RULES.required('优先级')],
    children: [
      { value: 'high', label: '高' },
      { value: 'medium', label: '中' },
      { value: 'low', label: '低' },
    ],
  },
]
export const popoverConfig: FormConfig = { layout: 'inline' }

// =================== 步骤向导 - 项目创建（Steps） ===================

export const wizardOptions: FormOption[] = [
  {
    type: 'input',
    prop: 'projectName',
    label: '项目名称',
    placeholder: '请输入项目名称',
    rules: [PRESET_RULES.required('项目名称')],
    layout: { step: 'step1' },
  },
  {
    type: 'textarea',
    prop: 'projectDesc',
    label: '项目描述',
    placeholder: '请描述项目用途',
    attrs: { rows: 3 },
    layout: { step: 'step1' },
  },
  {
    type: 'select',
    prop: 'template',
    label: '项目模板',
    placeholder: '请选择模板',
    rules: [PRESET_RULES.required('项目模板')],
    layout: { step: 'step2' },
    children: [
      { value: 'vue', label: 'Vue 3 项目' },
      { value: 'react', label: 'React 项目' },
      { value: 'node', label: 'Node.js 项目' },
    ],
  },
  {
    type: 'checkbox',
    prop: 'features',
    label: '功能特性',
    value: [],
    layout: { step: 'step2' },
    children: [
      { value: 'typescript', label: 'TypeScript' },
      { value: 'eslint', label: 'ESLint' },
      { value: 'prettier', label: 'Prettier' },
      { value: 'tests', label: '单元测试' },
    ],
  },
  {
    type: 'input',
    prop: 'gitRepo',
    label: 'Git 仓库',
    placeholder: '请输入仓库地址',
    layout: { step: 'step3' },
  },
  {
    type: 'switch',
    prop: 'autoCommit',
    label: '自动提交',
    value: false,
    layout: { step: 'step3' },
  },
]
export const wizardConfig: FormConfig = { layout: 'steps' }
