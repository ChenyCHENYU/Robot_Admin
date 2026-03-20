/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-09 23:43:19
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-09 23:43:49
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\layouts\InlineLayout\data.ts
 * @Description: 表单组件 - 内联组件 - 演示页面 - 数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { FormOption } from '@robot-admin/naive-ui-components'

// 内联布局表单配置（适合搜索表单）
export const formOptions: FormOption[] = [
  {
    type: 'input',
    prop: 'username',
    label: '用户名',
    placeholder: '请输入用户名',
  },
  {
    type: 'input',
    prop: 'email',
    label: '邮箱',
    placeholder: '请输入邮箱',
  },
  {
    type: 'select',
    prop: 'gender',
    label: '性别',
    placeholder: '请选择',
    children: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
      { label: '其他', value: 'other' },
    ],
  },
  {
    type: 'inputNumber',
    prop: 'age',
    label: '年龄',
    placeholder: '年龄',
    attrs: { min: 1, max: 120 },
  },
  {
    type: 'select',
    prop: 'city',
    label: '城市',
    placeholder: '请选择城市',
    children: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
      { label: '深圳', value: 'shenzhen' },
    ],
  },
]

// 对齐方式选项
export const alignOptions = [
  { label: '居中', value: 'center' },
  { label: '左对齐', value: 'start' },
  { label: '右对齐', value: 'end' },
]

// 高级搜索选项数据
export const statusOptions = [
  { label: '活跃用户', value: 'active' },
  { label: '已停用', value: 'disabled' },
  { label: '待验证', value: 'pending' },
]

export const sortOptions = [
  { label: '注册时间倒序', value: 'created_desc' },
  { label: '注册时间正序', value: 'created_asc' },
  { label: '用户名A-Z', value: 'name_asc' },
  { label: '用户名Z-A', value: 'name_desc' },
]

// 默认配置
export const defaultConfig = {
  gap: 16,
  align: 'center',
}

// 高级搜索默认数据
export const defaultAdvancedData = {
  dateRange: null,
  userStatus: null,
  sortBy: null,
}
