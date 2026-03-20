/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 09:13:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-02 09:13:00
 * @FilePath: \Robot_Admin\src\views\demo\35-barcode\data.ts
 * @Description: 条形码演示页面数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 条形码格式选项
export const BARCODE_FORMATS = [
  { label: 'CODE128 (通用)', value: 'CODE128' },
  { label: 'CODE39', value: 'CODE39' },
  { label: 'EAN13 (商品码)', value: 'EAN13' },
  { label: 'EAN8', value: 'EAN8' },
  { label: 'UPC (美国商品码)', value: 'UPC' },
  { label: 'ITF14', value: 'ITF14' },
  { label: 'MSI', value: 'MSI' },
  { label: 'pharmacode', value: 'pharmacode' },
] as const

export type BarcodeFormat = (typeof BARCODE_FORMATS)[number]['value']

// 示例数据
export const BARCODE_EXAMPLES = [
  {
    title: '商品条形码',
    description: '常见的商品EAN13条形码',
    value: '690123456789012',
    format: 'EAN13' as BarcodeFormat,
    label: '商品编号',
  },
  {
    title: '物流条形码',
    description: 'CODE128格式，支持更多字符',
    value: 'LOGISTICS-2025-001',
    format: 'CODE128' as BarcodeFormat,
    label: '物流单号',
  },
  {
    title: '库存条形码',
    description: 'CODE39格式，常用在库存管理',
    value: 'INV-2025-0001',
    format: 'CODE39' as BarcodeFormat,
    label: '库存编号',
  },
  {
    title: '药品条形码',
    description: '药品专用条形码格式',
    value: '123456',
    format: 'pharmacode' as BarcodeFormat,
    label: '药品编号',
  },
]

// 配置选项
export const CONFIG_OPTIONS = {
  width: {
    label: '条形宽度',
    min: 1,
    max: 5,
    step: 0.5,
    default: 2,
  },
  height: {
    label: '条形高度',
    min: 20,
    max: 200,
    step: 10,
    default: 80,
  },
  fontSize: {
    label: '字体大小',
    min: 10,
    max: 30,
    step: 2,
    default: 20,
  },
}

// 颜色选项
export const COLOR_PRESETS = [
  { label: '默认黑白', value: '#000000', background: '#FFFFFF' },
  { label: '蓝白', value: '#1890ff', background: '#FFFFFF' },
  { label: '红白', value: '#f5222d', background: '#FFFFFF' },
  { label: '绿白', value: '#52c41a', background: '#FFFFFF' },
  { label: '黑黄', value: '#000000', background: '#fffbe6' },
  { label: '深蓝浅蓝', value: '#002766', background: '#e6f7ff' },
]

// 文本位置选项
export const TEXT_POSITIONS = [
  { label: '底部', value: 'bottom' },
  { label: '顶部', value: 'top' },
] as const

export type TextPosition = (typeof TEXT_POSITIONS)[number]['value']
