/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\components\global\C_ContextMenu\types.ts
 * @Description: 右键菜单组件类型定义
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 菜单项 */
export interface ContextMenuItem {
  /** 唯一标识 */
  key: string
  /** 菜单文字 */
  label: string
  /** 图标（Iconify 图标名） */
  icon?: string
  /** 快捷键标注文字（仅展示，不绑定） */
  shortcut?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否隐藏 */
  hidden?: boolean
  /** 分割线（此项渲染为分割线，label 被忽略） */
  divider?: boolean
  /** 子菜单（支持无限嵌套） */
  children?: ContextMenuItem[]
  /** 自定义样式类 */
  className?: string
  /** 危险操作（红色高亮） */
  danger?: boolean
}

/** 菜单组（可按组分类） */
export interface ContextMenuGroup {
  /** 组标题（可选） */
  title?: string
  /** 组内菜单项 */
  items: ContextMenuItem[]
}

/** 组件 Props */
export interface ContextMenuProps {
  /** 菜单项列表 */
  items: ContextMenuItem[]
  /** 菜单最小宽度 */
  minWidth?: number
  /** 菜单最大宽度 */
  maxWidth?: number
  /** 子菜单展开方向 */
  subMenuPlacement?: 'right' | 'left'
  /** 点击菜单项后是否自动关闭 */
  autoClose?: boolean
  /** 是否禁用整个菜单 */
  disabled?: boolean
  /** 自定义 z-index */
  zIndex?: number
}

/** 默认 Props */
export const DEFAULT_CONTEXT_MENU_PROPS = {
  minWidth: 180,
  maxWidth: 280,
  subMenuPlacement: 'right' as const,
  autoClose: true,
  disabled: false,
  zIndex: 9999,
}
