/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_Signature\data.ts
 * @Description: 电子签名组件数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  EraserConfig,
  PenConfig,
  WatermarkConfig,
} from '@/types/modules/signature'

/** 默认画笔配置 */
export const DEFAULT_PEN_CONFIG: PenConfig = {
  color: '#000000',
  width: 2,
  opacity: 1,
}

/** 默认橡皮擦配置 */
export const DEFAULT_ERASER_CONFIG: EraserConfig = {
  size: 20,
}

/** 默认水印配置 */
export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  show: false,
  text: '',
  fontSize: 12,
  color: '#999999',
  position: 'bottom-right',
}

/** 预设画笔颜色 */
export const PRESET_COLORS = [
  '#000000', // 黑色
  '#FF0000', // 红色
  '#0000FF', // 蓝色
  '#00AA00', // 绿色
  '#FF6600', // 橙色
  '#9900FF', // 紫色
]

/** 预设画笔粗细 */
export const PRESET_WIDTHS = [1, 2, 3, 5, 8]

/** 导出格式选项 */
export const EXPORT_FORMAT_OPTIONS = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'SVG', value: 'svg' },
  { label: 'Blob', value: 'blob' },
] as const

/** 水印位置选项 */
export const WATERMARK_POSITION_OPTIONS = [
  { label: '左上', value: 'top-left' },
  { label: '右上', value: 'top-right' },
  { label: '左下', value: 'bottom-left' },
  { label: '右下', value: 'bottom-right' },
] as const
