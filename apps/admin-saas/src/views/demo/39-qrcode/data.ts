/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-16 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-16 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\39-qrcode\data.ts
 * @Description: 二维码演示页面数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type {
  ErrorCorrectionLevel,
  RenderMode,
} from '@robot-admin/naive-ui-components'

// 纠错等级选项
export const ERROR_LEVELS = [
  { label: 'L (7%)', value: 'L' as ErrorCorrectionLevel },
  { label: 'M (15%)', value: 'M' as ErrorCorrectionLevel },
  { label: 'Q (25%)', value: 'Q' as ErrorCorrectionLevel },
  { label: 'H (30%)', value: 'H' as ErrorCorrectionLevel },
] as const

// 渲染模式选项
export const RENDER_MODES = [
  { label: 'Canvas', value: 'canvas' as RenderMode },
  { label: 'SVG', value: 'svg' as RenderMode },
] as const

// 示例数据
export const QRCODE_EXAMPLES = [
  {
    title: '网站链接',
    description: '常见的 URL 二维码，扫码后打开网页',
    value: 'https://vuejs.org',
    icon: 'mdi:web',
  },
  {
    title: 'WiFi 连接',
    description: '扫码自动连接 WiFi 网络',
    value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;;',
    icon: 'mdi:wifi',
  },
  {
    title: '电子名片',
    description: 'vCard 格式，扫码添加联系人',
    value:
      'BEGIN:VCARD\nVERSION:3.0\nN:张三\nTEL:13800138000\nEMAIL:zhangsan@example.com\nEND:VCARD',
    icon: 'mdi:card-account-details',
  },
  {
    title: '文本内容',
    description: '纯文本信息，扫码即可查看',
    value: 'Robot Admin — 企业级后台管理框架',
    icon: 'mdi:text',
  },
] as const

// 尺寸配置
export const SIZE_OPTIONS = {
  min: 80,
  max: 400,
  step: 20,
  default: 200,
}

// 边距配置
export const MARGIN_OPTIONS = {
  min: 0,
  max: 8,
  step: 1,
  default: 2,
}

// 颜色预设
export const COLOR_PRESETS = [
  { label: '默认黑白', color: '#000000', bgColor: '#FFFFFF' },
  { label: '品牌蓝', color: '#1677ff', bgColor: '#FFFFFF' },
  { label: '中国红', color: '#cf1322', bgColor: '#FFFFFF' },
  { label: '极客绿', color: '#389e0d', bgColor: '#FFFFFF' },
  { label: '暗紫', color: '#531dab', bgColor: '#f9f0ff' },
  { label: '夜间', color: '#d9d9d9', bgColor: '#141414' },
] as const

// Logo 尺寸配置
export const LOGO_SIZE_OPTIONS = {
  min: 0.1,
  max: 0.35,
  step: 0.05,
  default: 0.2,
}

// 导出格式选项
export const EXPORT_FORMATS = [
  { label: 'PNG', value: 'png' },
  { label: 'JPEG', value: 'jpeg' },
  { label: 'SVG', value: 'svg' },
] as const

export type ExportFormat = (typeof EXPORT_FORMATS)[number]['value']
