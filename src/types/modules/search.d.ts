/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Description: 搜索表单相关类型（从 form.d.ts 迁出）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/** 搜索字段支持的控件类型 */
export type SearchFieldType = 'input' | 'select' | 'date-range' | 'spacer'

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
 * 搜索表单字段配置
 */
export interface SearchFormItem {
  type: SearchFieldType
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

/**
 * C_FormSearch 统一配置对象
 */
export interface SearchConfig {
  /** 超过此数量的字段默认折叠，默认 7 */
  foldThreshold?: number
  /** 历史记录最大条数，默认 5 */
  historyMaxItems?: number
  /** 搜索前是否要求至少一个有效值，默认 true */
  requireValue?: boolean
}
