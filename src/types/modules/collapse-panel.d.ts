/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\types\modules\collapse-panel.d.ts
 * @Description: 折叠面板组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 面板样式变体 */
export type CollapsePanelVariant = 'default' | 'card' | 'ghost'

/** 展开图标位置 */
export type ExpandIconPosition = 'left' | 'right'

/** 单个面板项配置 */
export interface CollapsePanelItem {
  /** 唯一标识 */
  key: string
  /** 面板标题 */
  title: string
  /** 副标题 */
  subtitle?: string
  /** 标题图标（Iconify 图标名） */
  icon?: string
  /** 是否禁用该面板 */
  disabled?: boolean
  /** 是否懒渲染（首次展开时才渲染内容） */
  lazy?: boolean
  /** 折叠后是否销毁内容 DOM */
  destroyOnCollapse?: boolean
}

/** 组件 Props */
export interface CollapsePanelProps {
  /** 面板项配置数组 */
  items: CollapsePanelItem[]
  /** 当前激活（展开）面板的 key 数组 v-model */
  activeKeys?: string[]
  /** 默认展开的面板 key 数组 */
  defaultActiveKeys?: string[]
  /** 是否手风琴模式（同时只展开一个） */
  accordion?: boolean
  /** 面板样式变体 */
  variant?: CollapsePanelVariant
  /** 展开图标位置 */
  expandIconPosition?: ExpandIconPosition
  /** 是否显示边框 */
  bordered?: boolean
  /** 展开状态 localStorage 持久化 key（传入则启用） */
  persistKey?: string
}

/** 组件暴露方法 */
export interface CollapsePanelExpose {
  /** 展开所有面板 */
  expandAll: () => void
  /** 折叠所有面板 */
  collapseAll: () => void
  /** 切换指定面板的展开/折叠 */
  toggle: (key: string) => void
  /** 获取当前展开的面板 key 数组 */
  getActiveKeys: () => string[]
  /** 滚动到指定面板 */
  scrollToPanel: (key: string) => void
}

/** 组件事件 */
export interface CollapsePanelEmits {
  /** 激活面板变化 */
  'update:activeKeys': [keys: string[]]
  /** 面板展开 */
  expand: [key: string]
  /** 面板折叠 */
  collapse: [key: string]
  /** 面板变化（展开或折叠均触发） */
  change: [activeKeys: string[]]
}
