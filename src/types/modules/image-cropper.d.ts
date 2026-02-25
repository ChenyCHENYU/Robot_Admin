/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\image-cropper.d.ts
 * @Description: 图片裁剪组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 输出图片格式 */
export type CropOutputFormat = 'png' | 'jpeg' | 'webp'

/** 预设裁剪比例 */
export interface AspectRatioPreset {
  label: string
  value: number // 0 = 自由比例
}

/** 裁剪结果 */
export interface CropResult {
  /** base64 数据 */
  base64: string
  /** Blob 对象 */
  blob: Blob
  /** 宽度 px */
  width: number
  /** 高度 px */
  height: number
  /** 格式 */
  format: CropOutputFormat
}

/** 组件 Props */
export interface ImageCropperProps {
  /** 图片源（URL / base64 / File） */
  src?: string
  /** 裁剪比例，0=自由 */
  aspectRatio?: number
  /** 输出格式 */
  outputFormat?: CropOutputFormat
  /** JPEG/WebP 输出质量 0-1 */
  outputQuality?: number
  /** 输出最大宽度 px（0=不限） */
  maxOutputWidth?: number
  /** 输出最大高度 px（0=不限） */
  maxOutputHeight?: number
  /** 是否显示预览面板 */
  showPreview?: boolean
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否为圆形裁剪遮罩 */
  circular?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 容器高度 */
  height?: string | number
  /** 弹窗模式 */
  modal?: boolean
  /** 弹窗标题 */
  modalTitle?: string
}

/** 组件暴露方法 */
export interface ImageCropperExpose {
  /** 获取裁剪结果 */
  getCropResult: () => Promise<CropResult>
  /** 旋转（角度） */
  rotate: (angle: number) => void
  /** 缩放 */
  zoom: (scale: number) => void
  /** 水平翻转 */
  flipX: () => void
  /** 垂直翻转 */
  flipY: () => void
  /** 重置变换 */
  reset: () => void
  /** 设置裁剪比例 */
  setAspectRatio: (ratio: number) => void
  /** 从 File 加载 */
  loadFile: (file: File) => void
  /** 打开弹窗（modal 模式） */
  open: (src?: string) => void
  /** 关闭弹窗（modal 模式） */
  close: () => void
}

/** 组件事件 */
export interface ImageCropperEmits {
  /** 裁剪完成 */
  crop: [result: CropResult]
  /** 图片加载完成 */
  ready: []
  /** 图片加载失败 */
  error: [error: Event]
  /** 弹窗确认 */
  confirm: [result: CropResult]
  /** 弹窗取消 */
  cancel: []
}
