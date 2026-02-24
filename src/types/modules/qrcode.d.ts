/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\qrcode.d.ts
 * @Description: 二维码组件类型定义
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/** 纠错等级 */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

/** 渲染模式 */
export type RenderMode = 'canvas' | 'svg'

/** 导出格式 */
export type ExportType = 'png' | 'jpeg' | 'svg'

/** Logo 配置 */
export interface LogoOptions {
  /** Logo 图片地址 */
  src: string
  /** Logo 尺寸（相对二维码宽度的比例, 0~0.4） */
  size?: number
  /** Logo 圆角 */
  borderRadius?: number
  /** Logo 外边距 */
  padding?: number
  /** Logo 背景色 */
  bgColor?: string
}

/** 二维码组件 Props */
export interface QRCodeProps {
  /** 二维码内容（文本/URL） */
  value: string
  /** 二维码尺寸（px） */
  size?: number
  /** 前景色 */
  color?: string
  /** 背景色 */
  bgColor?: string
  /** 纠错等级 */
  errorCorrectionLevel?: ErrorCorrectionLevel
  /** 留白边距（模块数） */
  margin?: number
  /** 渲染模式 */
  mode?: RenderMode
  /** Logo 配置 */
  logo?: LogoOptions
  /** 是否显示边框 */
  showBorder?: boolean
  /** 标签文本 */
  label?: string
  /** 是否显示标签 */
  showLabel?: boolean
}

/** 组件暴露方法 */
export interface QRCodeExpose {
  /** 导出为 DataURL */
  toDataURL: (type?: ExportType, quality?: number) => Promise<string>
  /** 下载二维码 */
  download: (filename?: string, type?: ExportType) => Promise<void>
  /** 刷新二维码 */
  refresh: () => Promise<void>
}
