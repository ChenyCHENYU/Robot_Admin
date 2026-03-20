/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-09 23:32:04
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-09 23:32:26
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\GridLayout\data.ts
 * @Description: 表单组件 - 网格组件 - 演示页面 - 数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { FormOption } from '@robot-admin/naive-ui-components'
import { PRESET_RULES, RULE_COMBOS } from '@robot-admin/form-validate'

// 解构校验规则
const { required, range, length } = PRESET_RULES
const { email, mobile } = RULE_COMBOS

// 栅格列数选项
export const colsOptions = [
  { value: 12, label: '12列' },
  { value: 18, label: '18列' },
  { value: 24, label: '24列' },
]

// 下拉选择框选项
export const selectOptions = {
  gender: [
    { label: '男', value: 'male' },
    { label: '女', value: 'female' },
    { label: '其他', value: 'other' },
  ],
  city: [
    { label: '北京', value: 'beijing' },
    { label: '上海', value: 'shanghai' },
    { label: '广州', value: 'guangzhou' },
    { label: '深圳', value: 'shenzhen' },
    { label: '杭州', value: 'hangzhou' },
  ],
  profession: [
    { label: '前端工程师', value: 'frontend' },
    { label: '后端工程师', value: 'backend' },
    { label: '产品经理', value: 'pm' },
    { label: 'UI设计师', value: 'ui' },
    { label: '运营专员', value: 'operation' },
    { label: '其他', value: 'other' },
  ],
}

// 表单字段配置
export const formOptions: FormOption[] = [
  {
    type: 'input',
    prop: 'name',
    label: '姓名',
    placeholder: '请输入姓名',
    layout: { span: 12 },
    rules: [required('姓名')],
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱地址',
    placeholder: '请输入邮箱',
    layout: { span: 12 },
    rules: email('邮箱'),
  },
  {
    type: 'input',
    prop: 'phone',
    label: '手机号码',
    placeholder: '请输入手机号',
    layout: { span: 8 },
    rules: mobile('手机号'),
  },
  {
    type: 'select',
    prop: 'gender',
    label: '性别',
    placeholder: '请选择性别',
    layout: { span: 8 },
    children: selectOptions.gender,
  },
  {
    type: 'inputNumber',
    prop: 'age',
    label: '年龄',
    placeholder: '请输入年龄',
    layout: { span: 8 },
    rules: [range('年龄', 1, 120)],
    attrs: { min: 1, max: 120 },
  },
  {
    type: 'select',
    prop: 'city',
    label: '所在城市',
    placeholder: '请选择城市',
    layout: { span: 12 },
    children: selectOptions.city,
  },
  {
    type: 'input',
    prop: 'company',
    label: '工作单位',
    placeholder: '请输入工作单位',
    layout: { span: 12 },
  },
  {
    type: 'input',
    prop: 'address',
    label: '详细地址',
    placeholder: '请输入详细地址',
    layout: { span: 18 },
  },
  {
    type: 'input',
    prop: 'zipcode',
    label: '邮政编码',
    placeholder: '请输入邮编',
    layout: { span: 6 },
    rules: [length('邮政编码', 6, 6)],
  },
  {
    type: 'datePicker',
    prop: 'birthday',
    label: '出生日期',
    placeholder: '请选择日期',
    layout: { span: 12 },
    attrs: { type: 'date' },
  },
  {
    type: 'select',
    prop: 'profession',
    label: '职业',
    placeholder: '请选择职业',
    layout: { span: 12 },
    children: selectOptions.profession,
  },
  {
    type: 'textarea',
    prop: 'bio',
    label: '个人简介',
    placeholder: '请输入个人简介...',
    layout: { span: 24 },
    rules: [length('个人简介', 10, 500)],
    attrs: { rows: 4 },
  },
]
