/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\components\global\C_Timeline\types.ts
 * @Description: 时间线组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 单条时间线节点 */
export interface TimelineItem {
  /** 唯一标识 */
  id: string | number
  /** 标题 */
  title: string
  /** 描述内容（支持 HTML 字符串） */
  content?: string
  /** 时间标签 */
  time?: string
  /** 节点颜色（CSS 颜色值） */
  color?: string
  /** 节点图标（Iconify 图标名） */
  icon?: string
  /** 节点状态 */
  status?: 'default' | 'success' | 'warning' | 'error' | 'info'
  /** 是否可展开/折叠详情 */
  collapsible?: boolean
  /** 初始是否展开 */
  defaultExpanded?: boolean
  /** 附加标签组 */
  tags?: Array<{ text: string; type?: string }>
  /** 自定义额外数据 */
  extra?: Record<string, unknown>
}

/** 组件 Props */
export interface TimelineProps {
  /** 时间线数据 */
  items: TimelineItem[]
  /** 布局方向 */
  mode?: 'vertical' | 'horizontal'
  /** 垂直模式下时间标签位置 */
  labelPlacement?: 'left' | 'right' | 'alternate'
  /** 是否显示尾部加载更多指示 */
  pending?: boolean
  /** 加载更多文案 */
  pendingText?: string
  /** 是否反转排列（最新在前） */
  reverse?: boolean
  /** 节点大小 */
  size?: 'small' | 'medium' | 'large'
  /** 连接线样式 */
  lineType?: 'solid' | 'dashed' | 'dotted'
  /** 是否显示时间标签 */
  showTime?: boolean
}

/** 默认 Props */
export const DEFAULT_TIMELINE_PROPS = {
  mode: 'vertical' as const,
  labelPlacement: 'right' as const,
  pending: false,
  pendingText: '加载中...',
  reverse: false,
  size: 'medium' as const,
  lineType: 'solid' as const,
  showTime: true,
}

/** 状态 → 颜色映射 */
export const STATUS_COLOR_MAP: Record<string, string> = {
  default: '',
  success: '#18a058',
  warning: '#f0a020',
  error: '#d03050',
  info: '#2080f0',
}
