/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-07 14:17:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-07 14:41:43
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\CustomLayout\data.ts
 * @Description: 布局组件演示页面 - 数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { FormOption } from '@/types/modules/form'
import { RULE_COMBOS, PRESET_RULES } from '@robot-admin/form-validate'

// 类型定义
export interface EmployeeFormData {
  employeeId?: string
  fullName?: string
  gender?: 'male' | 'female'
  birthDate?: number // 时间戳
  phone?: string
  email?: string
  address?: string
  department?: string
  position?: string
  joinDate?: number // 时间戳
  salary?: number
  skills?: string[]
  performance?: number
  isActive?: boolean
  remarks?: string
  [key: string]: string | number | boolean | string[] | undefined
}

// 表单配置
export const employeeFormOptions: FormOption[] = [
  {
    type: 'input',
    prop: 'employeeId',
    label: '员工编号',
    placeholder: '请输入员工编号',
    rules: [
      PRESET_RULES.required('员工编号'),
      PRESET_RULES.pattern('员工编号', /^EMP\d{6}$/, '格式: EMP123456'),
    ],
    layout: { group: 'basic' },
  },
  {
    type: 'input',
    prop: 'fullName',
    label: '姓名',
    placeholder: '请输入真实姓名',
    rules: RULE_COMBOS.username('姓名'),
    layout: { group: 'basic' },
  },
  {
    type: 'select',
    prop: 'gender',
    label: '性别',
    placeholder: '请选择性别',
    rules: [PRESET_RULES.required('性别')],
    children: [
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
    ],
    layout: { group: 'basic' },
  },
  {
    type: 'datePicker',
    prop: 'birthDate',
    label: '出生日期',
    placeholder: '请选择出生日期',
    rules: [PRESET_RULES.required('出生日期')],
    layout: { group: 'basic' },
  },
  {
    type: 'input',
    prop: 'phone',
    label: '手机号码',
    placeholder: '请输入手机号码',
    rules: RULE_COMBOS.mobile('手机号码'),
    layout: { group: 'contact' },
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱地址',
    placeholder: '请输入邮箱地址',
    rules: RULE_COMBOS.email('邮箱地址'),
    layout: { group: 'contact' },
  },
  {
    type: 'textarea',
    prop: 'address',
    label: '居住地址',
    placeholder: '请输入详细地址',
    rules: [
      PRESET_RULES.required('居住地址'),
      PRESET_RULES.length('居住地址', 10, 200),
    ],
    attrs: { rows: 3 },
    layout: { group: 'contact' },
  },
  {
    type: 'select',
    prop: 'department',
    label: '所属部门',
    placeholder: '请选择部门',
    rules: [PRESET_RULES.required('所属部门')],
    children: [
      { value: 'tech', label: '技术部' },
      { value: 'product', label: '产品部' },
      { value: 'design', label: '设计部' },
      { value: 'marketing', label: '市场部' },
      { value: 'hr', label: '人事部' },
    ],
    layout: { group: 'job' },
  },
  {
    type: 'select',
    prop: 'position',
    label: '职位',
    placeholder: '请选择职位',
    rules: [PRESET_RULES.required('职位')],
    children: [
      { value: 'frontend', label: '前端工程师' },
      { value: 'backend', label: '后端工程师' },
      { value: 'fullstack', label: '全栈工程师' },
      { value: 'ui', label: 'UI设计师' },
      { value: 'pm', label: '产品经理' },
    ],
    layout: { group: 'job' },
  },
  {
    type: 'datePicker',
    prop: 'joinDate',
    label: '入职日期',
    placeholder: '请选择入职日期',
    rules: [PRESET_RULES.required('入职日期')],
    layout: { group: 'job' },
  },
  {
    type: 'inputNumber',
    prop: 'salary',
    label: '薪资',
    placeholder: '请输入薪资',
    rules: [
      PRESET_RULES.required('薪资'),
      PRESET_RULES.range('薪资', 3000, 50000),
    ],
    attrs: { min: 3000, max: 50000, precision: 0 },
    layout: { group: 'job' },
  },
  {
    type: 'checkbox',
    prop: 'skills',
    label: '技能标签',
    rules: [PRESET_RULES.required('技能标签')],
    children: [
      { value: 'vue', label: 'Vue.js' },
      { value: 'react', label: 'React' },
      { value: 'node', label: 'Node.js' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'design', label: '设计能力' },
    ],
    value: [],
    layout: { group: 'other' },
  },
  {
    type: 'rate',
    prop: 'performance',
    label: '绩效评分',
    rules: [PRESET_RULES.required('绩效评分')],
    attrs: { allowHalf: true, count: 5 },
    value: 0,
    layout: { group: 'other' },
  },
  {
    type: 'switch',
    prop: 'isActive',
    label: '在职状态',
    value: true,
    layout: { group: 'other' },
  },
  {
    type: 'textarea',
    prop: 'remarks',
    label: '备注信息',
    placeholder: '请输入备注信息',
    attrs: { rows: 4 },
    layout: { group: 'other' },
  },
]

// 测试数据模板
const testDataTemplates: Record<keyof EmployeeFormData, any> = {
  employeeId: () =>
    `EMP${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
  fullName: () =>
    ['张三', '李四', '王五', '赵六', '钱七'][Math.floor(Math.random() * 5)],
  gender: () => (Math.random() > 0.5 ? 'male' : 'female'),
  birthDate: () => {
    const year = 1990 + Math.floor(Math.random() * 10)
    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    return new Date(year, month - 1, day).getTime()
  },
  phone: () =>
    `138${String(Math.floor(Math.random() * 99999999)).padStart(8, '0')}`,
  email: () => `user${Math.floor(Math.random() * 9999)}@company.com`,
  address: () =>
    [
      '北京市朝阳区某某街道123号',
      '上海市浦东新区某某路456号',
      '深圳市南山区某某大道789号',
    ][Math.floor(Math.random() * 3)],
  department: () =>
    ['tech', 'product', 'design', 'marketing', 'hr'][
      Math.floor(Math.random() * 5)
    ],
  position: () =>
    ['frontend', 'backend', 'fullstack', 'ui', 'pm'][
      Math.floor(Math.random() * 5)
    ],
  joinDate: () => {
    const year = 2020 + Math.floor(Math.random() * 5)
    const month = Math.floor(Math.random() * 12) + 1
    const day = Math.floor(Math.random() * 28) + 1
    return new Date(year, month - 1, day).getTime()
  },
  salary: () => Math.floor(Math.random() * 47000) + 3000,
  skills: () =>
    ['vue', 'react', 'node'].slice(0, Math.floor(Math.random() * 3) + 1),
  performance: () => Math.round((Math.random() * 4 + 1) * 2) / 2,
  isActive: () => Math.random() > 0.2,
  remarks: () => '技术能力强，工作认真负责，团队合作能力佳。',
}

// 测试数据生成函数
export const generateTestData = (fields: FormOption[]): EmployeeFormData => {
  const data: EmployeeFormData = {}

  fields.forEach(field => {
    if (field.prop && field.prop in testDataTemplates) {
      const template = testDataTemplates[field.prop as keyof EmployeeFormData]
      data[field.prop as keyof EmployeeFormData] =
        typeof template === 'function' ? template() : template
    }
  })

  return data
}

// API 提交函数
export const submitEmployeeAPI = async (employeeData: EmployeeFormData) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return {
    code: '0',
    message: '员工信息提交成功',
    data: {
      id: Date.now(),
      employeeId: employeeData.employeeId,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  }
}
