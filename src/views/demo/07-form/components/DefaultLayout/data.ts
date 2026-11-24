/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \\Robot_Admin\\src\\views\\demo\\07-form\\components\\DefaultLayout\\data.ts
 * @Description: 默认布局表单模型、字段配置与提示文案
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import {
  defineFormOptions,
  NAIVE_COMBOS,
  PRESET_RULES,
} from '@robot-admin/naive-ui-components/C_Form'

export interface DefaultFormData {
  username?: string
  realName?: string
  age?: number
  gender?: 'male' | 'female'
  email?: string
  phone?: string
  departmentId?: number | null
  password?: string
  address?: string
  description?: string
}

/**
 * 表单字段配置
 */
export const formOptions = defineFormOptions<DefaultFormData>([
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
    rules: NAIVE_COMBOS.username('用户名'),
  },
  {
    type: 'input',
    prop: 'realName',
    label: '真实姓名',
    placeholder: '请输入真实姓名',
    rules: [
      PRESET_RULES.required('真实姓名'),
      PRESET_RULES.length('真实姓名', 2, 20),
    ],
  },
  {
    type: 'inputNumber',
    prop: 'age',
    label: '年龄',
    rules: [PRESET_RULES.required('年龄'), PRESET_RULES.range('年龄', 1, 120)],
    attrs: { min: 1, max: 120 },
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
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱地址',
    rules: NAIVE_COMBOS.email('邮箱'),
  },
  {
    type: 'input',
    prop: 'phone',
    label: '手机号',
    placeholder: '请输入手机号',
    rules: NAIVE_COMBOS.mobile('手机号'),
  },
  {
    type: 'treeSelect',
    prop: 'departmentId',
    label: '所属部门',
    placeholder: '选择所属部门',
    rules: [PRESET_RULES.required('所属部门')],
    attrs: { clearable: true, filterable: true, defaultExpandAll: true },
    children: [
      {
        key: 100,
        label: '应用研发中心',
        children: [
          { key: 101, label: '前端平台组' },
          { key: 102, label: '质量工程组' },
        ],
      },
      { key: 200, label: '交付运营部' },
    ],
  },
  {
    type: 'input',
    prop: 'password',
    label: '密码',
    placeholder: '请输入密码',
    rules: NAIVE_COMBOS.password('密码'),
    attrs: { type: 'password', showPasswordOn: 'mousedown' },
  },
  {
    type: 'textarea',
    prop: 'address',
    label: '地址',
    placeholder: '请输入详细地址',
    rules: [PRESET_RULES.required('地址'), PRESET_RULES.length('地址', 5, 200)],
    attrs: { rows: 3 },
  },
  {
    type: 'editor',
    prop: 'description',
    label: '个人简介',
    placeholder: '请输入个人简介...',
    value: '',
    attrs: { height: 200 },
  },
])

/**
 * 表单提示消息
 */
export const FORM_MESSAGES = {
  RESET_INFO: '表单已重置',
  SUBMIT_TEXT: '提交表单',
  RESET_TEXT: '重置表单',
} as const
