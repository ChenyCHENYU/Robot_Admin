/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\signature.d.ts
 * @Description: 电子签名组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 画笔模式 */
export type PenMode = 'pen' | 'eraser'

/** 导出格式 */
export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'blob'

/** 画笔配置 */
export interface PenConfig {
  /** 画笔颜色 */
  color: string
  /** 画笔粗细（px）*/
  width: number
  /** 透明度 0-1 */
  opacity: number
}

/** 橡皮擦配置 */
export interface EraserConfig {
  /** 橡皮擦尺寸（px）*/
  size: number
}

/** 水印配置 */
export interface WatermarkConfig {
  /** 是否显示水印 */
  show: boolean
  /** 水印文本 */
  text: string
  /** 水印字体大小 */
  fontSize: number
  /** 水印颜色 */
  color: string
  /** 水印位置 */
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

/** 导出配置 */
export interface ExportOptions {
  /** 导出格式 */
  format?: ExportFormat
  /** 图片质量 0-1（仅对 jpeg 有效）*/
  quality?: number
  /** 是否包含背景 */
  includeBackground?: boolean
  /** 背景颜色（includeBackground=true 时有效）*/
  backgroundColor?: string
  /** 是否包含水印 */
  includeWatermark?: boolean
}

/** 签名路径点 */
export interface SignaturePoint {
  x: number
  y: number
  pressure?: number
  timestamp?: number
}

/** 签名笔画 */
export interface SignatureStroke {
  points: SignaturePoint[]
  color: string
  width: number
  opacity: number
  mode: PenMode
}

/** 签名历史快照 */
export interface SignatureSnapshot {
  strokes: SignatureStroke[]
  timestamp: number
}

/** 组件 Props */
export interface SignatureProps {
  /** 画布宽度 */
  width?: number | string
  /** 画布高度 */
  height?: number | string
  /** 画笔配置 */
  penConfig?: Partial<PenConfig>
  /** 橡皮擦配置 */
  eraserConfig?: Partial<EraserConfig>
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 背景图片 URL */
  backgroundImage?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 水印配置 */
  watermark?: Partial<WatermarkConfig>
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 最大撤销步数 */
  maxHistory?: number
}

/** 组件暴露方法 */
export interface SignatureExpose {
  /** 清空画布 */
  clear: () => void
  /** 撤销 */
  undo: () => boolean
  /** 重做 */
  redo: () => boolean
  /** 导出签名 */
  export: (options?: ExportOptions) => Promise<string | Blob>
  /** 下载签名图片 */
  download: (filename?: string, options?: ExportOptions) => Promise<void>
  /** 加载签名图片 */
  loadImage: (imageUrl: string) => Promise<void>
  /** 获取签名数据 */
  getSignatureData: () => SignatureStroke[]
  /** 加载签名数据 */
  loadSignatureData: (data: SignatureStroke[]) => void
  /** 判断是否为空 */
  isEmpty: () => boolean
}

/** 组件事件 */
export interface SignatureEmits {
  /** 开始绘制 */
  'start-draw': []
  /** 绘制中 */
  drawing: [point: SignaturePoint]
  /** 结束绘制 */
  'end-draw': [stroke: SignatureStroke]
  /** 清空画布 */
  clear: []
  /** 撤销 */
  undo: []
  /** 重做 */
  redo: []
  /** 签名变化 */
  change: [data: SignatureStroke[]]
}
