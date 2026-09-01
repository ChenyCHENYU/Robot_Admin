/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-01
 * @FilePath: \Robot_Admin\src\components\local\c_detail\data.ts
 * @Description: 详情弹窗的宽松输入契约与安全展示类型
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export interface DetailItem {
  label: string
  key: string
  type?: string
  tagType?: string
  formatter?: (value: unknown) => string
  span?: number
}

export interface DetailSection {
  title: string
  items: DetailItem[]
  columns?: number
}

export interface DetailConfig {
  sections: DetailSection[]
}

export interface C_DetailProps {
  data: Record<string, unknown>
  config?: DetailConfig
  title?: string
  width?: number | string
  visible?: boolean
  loading?: boolean
}
