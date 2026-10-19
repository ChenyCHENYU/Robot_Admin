/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-12-02 09:13:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-02 09:13:00
 * @FilePath: \Robot_Admin\src\views\demo\35-barcode\data.ts
 * @Description: 条形码演示页面数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { SelectOption } from 'naive-ui'

export type BarcodeFormat =
  | 'CODE128'
  | 'CODE39'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'ITF14'
  | 'MSI'
  | 'pharmacode'

// 条形码格式选项
export const BARCODE_FORMATS: SelectOption[] = [
  { label: 'CODE128 (通用)', value: 'CODE128' },
  { label: 'CODE39', value: 'CODE39' },
  { label: 'EAN13 (商品码)', value: 'EAN13' },
  { label: 'EAN8', value: 'EAN8' },
  { label: 'UPC (美国商品码)', value: 'UPC' },
  { label: 'ITF14', value: 'ITF14' },
  { label: 'MSI', value: 'MSI' },
  { label: 'pharmacode', value: 'pharmacode' },
]

// 示例数据
export const BARCODE_EXAMPLES = [
  {
    title: '商品条形码',
    description: '常见的商品EAN13条形码',
    value: '6901234567892',
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
export type TextPosition = 'bottom' | 'top'

export const TEXT_POSITIONS: SelectOption[] = [
  { label: '底部', value: 'bottom' },
  { label: '顶部', value: 'top' },
]

const validPharmacode = (value: string) =>
  Number(value) >= 3 && Number(value) <= 131070
    ? ''
    : '药品码数值需在 3 至 131070 之间'
const validAscii = (value: string) =>
  Array.from(value).every(character => character.charCodeAt(0) <= 127)

/** 验证常见条码格式，避免无效值保留上一次的图像却仍可下载。 */
export const validateBarcodeValue = (
  value: string,
  format: BarcodeFormat
): string => {
  if (!value) return '请输入条形码内容'
  if (format === 'CODE128')
    return validAscii(value) ? '' : 'CODE128 仅支持 ASCII 字符'
  if (format === 'CODE39')
    return /^[0-9A-Z .\-$/+%]+$/.test(value)
      ? ''
      : 'CODE39 仅支持大写字母、数字与规定符号'
  return validateNumericBarcode(value, format)
}

const validateNumericBarcode = (
  value: string,
  format: BarcodeFormat
): string => {
  if (!/^\d+$/.test(value)) return '当前格式仅支持数字'
  const lengths: Partial<Record<BarcodeFormat, number>> = {
    EAN13: 13,
    EAN8: 8,
    UPC: 12,
    ITF14: 14,
  }
  const length = lengths[format]
  if (length && value.length !== length) return `当前格式需要 ${length} 位数字`
  if (format === 'pharmacode') return validPharmacode(value)
  if (!length) return ''
  const digits = value.split('').map(Number)
  const sum = digits
    .slice(0, -1)
    .reverse()
    .reduce(
      (total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1),
      0
    )
  return (10 - (sum % 10)) % 10 === digits.at(-1)
    ? ''
    : '校验位不正确，请检查条码内容'
}
