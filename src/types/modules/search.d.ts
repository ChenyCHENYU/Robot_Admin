/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Description: 搜索表单相关类型（从 form.d.ts 迁出）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * 搜索选项兼容性类型
 * @description 兼容 labelDefault 的选项类型，支持向后兼容
 */
export interface SearchOptionItem {
  labelDefault?: string
  label?: string
  value?: string | number | boolean
  disabled?: boolean
  [key: string]: any
}

/**
 * 搜索组件兼容性类型
 * @description 为了解决 data.ts 中的类型错误而添加的兼容性类型
 */
export interface SearchFormItem {
  type: 'input' | 'select' | 'date-range'
  prop: string
  placeholder?: string
  list?: SearchOptionItem[]
  hisList?: string[]
  isFocus?: boolean
  show?: boolean
}

/**
 * 搜索表单参数类型
 * @description 通用的搜索表单参数接口，作为所有搜索表单的基础类型
 */
export interface SearchFormParams {
  pageNum?: number
  pageSize?: number
  [key: string]: any
}
