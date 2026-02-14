/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-14
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-14
 * @FilePath: \Robot_Admin\src\types\modules\action-bar.d.ts
 * @Description: 表格工具栏按钮类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Ref, ComputedRef, Directive } from 'vue'
import type { ButtonProps } from 'naive-ui'

/** 按钮类型 */
export type ActionButtonType =
  | 'default'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

/** 按钮尺寸 */
export type ActionButtonSize = 'tiny' | 'small' | 'medium' | 'large'

/** 按钮组位置 */
export type ActionGroupAlign =
  | 'left'
  | 'center'
  | 'right'
  | 'space-between'
  | 'space-around'

/** 下拉菜单子项配置 */
export interface ActionDropdownItem {
  /** 唯一标识 */
  key: string
  /** 显示文字 */
  label: string
  /** 图标名称 */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean | Ref<boolean>
  /** 是否显示 */
  show?: boolean | Ref<boolean>
  /** 点击事件 */
  onClick?: () => void | Promise<void>
}

/** 操作按钮配置项 */
export interface ActionItem {
  /** 唯一标识（可选，用于debug） */
  key?: string
  /** 按钮文字 */
  label: string
  /** 图标名称（mdi:xxx） */
  icon?: string
  /** 按钮类型 */
  type?: ActionButtonType
  /** 按钮尺寸 */
  size?: ActionButtonSize
  /** 是否加载中 */
  loading?: boolean | Ref<boolean>
  /** 是否禁用 */
  disabled?: boolean | Ref<boolean>
  /** 是否显示 */
  show?: boolean | Ref<boolean>
  /** 悬停提示 */
  tooltip?: string
  /** 分组标识 */
  group?: 'left' | 'right'
  /** 下拉菜单子项 */
  dropdown?: ActionDropdownItem[]
  /** 点击事件 */
  onClick?: () => void | Promise<void>
  /** Naive UI Button 原生属性 */
  buttonProps?: Partial<ButtonProps>
  /** 自定义指令（如 v-debounce、v-copy 等） */
  directives?: Array<
    | [Directive, any?]
    | [Directive, any, string?]
    | [Directive, any, string?, Record<string, boolean>?]
  >
}

/** 工具栏配置 */
export interface ActionBarConfig {
  /** 对齐方式 */
  align?: ActionGroupAlign
  /** 按钮尺寸（全局） */
  size?: ActionButtonSize
  /** 按钮间距 */
  gap?: number
  /** 是否允许换行 */
  wrap?: boolean
  /** 是否显示分隔线 */
  showDivider?: boolean
  /** 分隔线样式 */
  dividerType?: 'vertical' | 'horizontal'
  /** 是否紧凑模式（减少内外边距） */
  compact?: boolean
  /** 是否内联模式（去掉容器装饰，适合嵌入其他容器组件内部） */
  inline?: boolean
}

/** 组件 Props */
export interface TableActionsProps {
  /** 操作按钮列表 */
  actions?: ActionItem[]
  /** 左侧按钮列表（优先级高于 actions 的 group:left） */
  leftActions?: ActionItem[]
  /** 右侧按钮列表（优先级高于 actions 的 group:right） */
  rightActions?: ActionItem[]
  /** 工具栏配置 */
  config?: ActionBarConfig
}

/** 组件 Emits */
export interface TableActionsEmits {
  /** 按钮点击事件 */
  (e: 'action-click', action: ActionItem): void
  /** 下拉菜单项点击事件 */
  (e: 'dropdown-click', item: ActionDropdownItem, action: ActionItem): void
}
