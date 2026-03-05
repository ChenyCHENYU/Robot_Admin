/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\components\global\C_AvatarGroup\types.ts
 * @Description: 头像组组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 单个头像数据 */
export interface AvatarItem {
  /** 唯一标识 */
  id: string | number
  /** 头像图片 URL */
  src?: string
  /** 姓名（用于首字母 fallback 和 tooltip） */
  name: string
  /** 悬浮提示（默认取 name） */
  tooltip?: string
  /** 在线状态 */
  status?: 'online' | 'offline' | 'busy' | 'away'
  /** 额外数据 */
  extra?: Record<string, unknown>
}

/** 组件 Props */
export interface AvatarGroupProps {
  /** 头像数据列表 */
  items: AvatarItem[]
  /** 最多显示数量（超出 +N） */
  max?: number
  /** 头像尺寸 (px) */
  size?: number
  /** 头像间重叠偏移量 (px)，负值表示堆叠 */
  overlap?: number
  /** 形状 */
  shape?: 'circle' | 'square'
  /** 是否显示状态指示点 */
  showStatus?: boolean
  /** 是否显示悬浮提示 */
  showTooltip?: boolean
  /** 是否可点击 */
  clickable?: boolean
  /** +N 溢出按钮是否可点击 */
  overflowClickable?: boolean
  /** 堆叠方向 */
  direction?: 'ltr' | 'rtl'
}

/** 默认 Props */
export const DEFAULT_AVATAR_GROUP_PROPS: Partial<AvatarGroupProps> = {
  max: 5,
  size: 40,
  overlap: -10,
  shape: 'circle',
  showStatus: true,
  showTooltip: true,
  clickable: false,
  overflowClickable: true,
  direction: 'ltr',
}

/** 状态颜色映射 */
export const STATUS_COLOR_MAP: Record<string, string> = {
  online: '#18a058',
  offline: '#909399',
  busy: '#e53e3e',
  away: '#f0a020',
}

/** 从名字中提取首字母 */
export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  // 中文直接取最后一个字
  if (/[\u4E00-\u9FFF]/.test(name)) return name.slice(-1)
  return name.slice(0, 2).toUpperCase()
}

/** 根据名字生成稳定的背景色 */
export function nameToColor(name: string): string {
  const palette = [
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6d28d9',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash * 31) | 0)
  }
  return palette[Math.abs(hash) % palette.length]
}
