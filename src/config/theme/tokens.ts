/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-06
 * @FilePath: \Robot_Admin\src\config\theme\tokens.ts
 * @Description: 主题设计 Token 系统 - 统一颜色和样式常量管理
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * 主题设计 Token 系统
 *
 * 核心思想：单一数据源（SSOT）
 * - 所有颜色值只在这里定义一次
 * - 其他文件通过导入引用，避免硬编码
 * - 便于维护和主题扩展
 */

/* =================
   1. 主色系定义
   ======================== */

/**
 * 应用主色调配置
 * 基于 Naive UI 的蓝色系
 */
export const PRIMARY_COLORS = {
  /** 主色 - 默认状态 */
  default: '#2080f0',
  /** 主色 - 悬停状态 */
  hover: '#4098fc',
  /** 主色 - 按下状态 */
  pressed: '#1060c9',
  /** 主色 - 补充色 */
  suppl: '#4098fc',
} as const

/* =================
   2. 背景色系定义
   ======================== */

/**
 * 亮色主题背景色配置
 */
export const LIGHT_BACKGROUND = {
  /** 页面主背景色 */
  body: '#ffffff',
  /** 表面背景色（卡片、面板等） */
  surface: '#f4f7f9',
  /** 侧边栏菜单背景色 */
  menu: '#0d1425',
  /** 内容区域背景色 */
  content: '#ffffff',
  /** 布局容器背景色 */
  layout: '#f4f7f9',
} as const

/**
 * 暗色主题背景色配置
 */
export const DARK_BACKGROUND = {
  /** 页面主背景色 */
  body: '#1c1c1c',
  /** 表面背景色（卡片、面板等） */
  surface: '#121212',
  /** 侧边栏菜单背景色 */
  menu: '#1c1c1c',
  /** 内容区域背景色 */
  content: '#1c1c1c',
  /** 布局容器背景色 */
  layout: '#121212',
} as const

/* =================
   3. 文本色系定义
   ======================== */

/**
 * 亮色主题文本色配置
 */
export const LIGHT_TEXT = {
  /** 主要文本颜色 */
  primary: '#000000',
  /** 次要文本颜色 */
  secondary: '#666666',
  /** 禁用文本颜色 */
  disabled: '#c0c0c0',
  /** 占位符文本颜色 */
  placeholder: '#999999',
} as const

/**
 * 暗色主题文本色配置
 */
export const DARK_TEXT = {
  /** 主要文本颜色 */
  primary: '#ffffff',
  /** 次要文本颜色 */
  secondary: '#9ca3af',
  /** 禁用文本颜色 */
  disabled: '#4a5568',
  /** 占位符文本颜色 */
  placeholder: '#6b7280',
} as const

/* =================
   4. 菜单色系定义
   ======================== */

/**
 * 亮色主题菜单配置
 */
export const LIGHT_MENU = {
  /** 菜单背景色 */
  background: '#0d1425',
  /** 菜单项文本颜色 - 默认 */
  itemText: '#e5e7eb',
  /** 菜单项文本颜色 - 悬停 */
  itemTextHover: '#f8fafc',
  /** 菜单项文本颜色 - 激活 */
  itemTextActive: '#e5e7eb',
  /** 菜单项文本颜色 - 激活悬停 */
  itemTextActiveHover: '#ffffff',
  /** 菜单项图标颜色 - 默认 */
  itemIcon: '#e5e7eb',
  /** 菜单项图标颜色 - 悬停 */
  itemIconHover: '#f8fafc',
  /** 菜单项图标颜色 - 激活 */
  itemIconActive: '#e5e7eb',
  /** 菜单项背景色 - 激活 */
  itemBgActive: '#2080F0',
  /** 菜单项背景色 - 悬停 */
  itemBgHover: 'rgba(255, 255, 255, 0.1)',
  /** 滚动条颜色 */
  scrollbar: '#0d1425',
} as const

/**
 * 暗色主题菜单配置
 */
export const DARK_MENU = {
  /** 菜单背景色 */
  background: '#1c1c1c',
  /** 菜单项文本颜色 - 默认 */
  itemText: '#e5e7eb',
  /** 菜单项文本颜色 - 悬停 */
  itemTextHover: '#f8fafc',
  /** 菜单项文本颜色 - 激活 */
  itemTextActive: '#e5e7eb',
  /** 菜单项文本颜色 - 激活悬停 */
  itemTextActiveHover: '#ffffff',
  /** 菜单项图标颜色 - 默认 */
  itemIcon: '#9ca3af',
  /** 菜单项图标颜色 - 悬停 */
  itemIconHover: '#d1d5db',
  /** 菜单项图标颜色 - 激活 */
  itemIconActive: '#9ca3af',
  /** 菜单项背景色 - 激活 */
  itemBgActive: 'rgba(32, 128, 240, 0.2)',
  /** 菜单项背景色 - 悬停 */
  itemBgHover: 'rgba(255, 255, 255, 0.08)',
  /** 滚动条颜色 */
  scrollbar: '#1c1c1c',
} as const

/* =================
   5. 边框和分割线
   ======================== */

/**
 * 亮色主题边框配置
 */
export const LIGHT_BORDER = {
  /** 默认边框颜色 */
  default: '#e5e7eb',
  /** 浅色边框 */
  light: '#f3f4f6',
  /** 深色边框 */
  deep: '#d1d5db',
} as const

/**
 * 暗色主题边框配置
 */
export const DARK_BORDER = {
  /** 默认边框颜色 */
  default: 'rgba(255, 255, 255, 0.15)',
  /** 浅色边框 */
  light: 'rgba(255, 255, 255, 0.08)',
  /** 深色边框 */
  deep: 'rgba(255, 255, 255, 0.25)',
} as const

/* =================
   6. 阴影定义
   ======================== */

/**
 * 通用阴影配置
 */
export const SHADOWS = {
  /** 小阴影 - 用于卡片、按钮 */
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  /** 中等阴影 - 用于下拉菜单 */
  md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  /** 大阴影 - 用于模态框 */
  lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  /** 超大阴影 - 用于抽屉 */
  xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
} as const

/* =================
   7. 间距系统
   ======================== */

/**
 * 间距配置（基于 4px 网格）
 */
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const

/* =================
   8. 圆角系统
   ======================== */

/**
 * 圆角配置
 */
export const RADIUS = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

/* =================
   9. 过渡动画
   ======================== */

/**
 * 过渡动画配置
 */
export const TRANSITIONS = {
  /** 快速过渡 - 用于按钮、链接 */
  fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  /** 标准过渡 - 用于大多数交互 */
  base: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  /** 慢速过渡 - 用于主题切换 */
  slow: '0.35s cubic-bezier(0.4, 0, 0.2, 1)',
} as const

/* =================
   10. 组合导出
   ======================== */

/**
 * 所有主题 Token 的统一导出
 * 方便在其他文件中一次性导入
 */
export const THEME_TOKENS = {
  primary: PRIMARY_COLORS,
  background: {
    light: LIGHT_BACKGROUND,
    dark: DARK_BACKGROUND,
  },
  text: {
    light: LIGHT_TEXT,
    dark: DARK_TEXT,
  },
  menu: {
    light: LIGHT_MENU,
    dark: DARK_MENU,
  },
  border: {
    light: LIGHT_BORDER,
    dark: DARK_BORDER,
  },
  shadow: SHADOWS,
  spacing: SPACING,
  radius: RADIUS,
  transition: TRANSITIONS,
} as const

/**
 * 导出类型定义
 * 用于 TypeScript 类型推断
 */
export type ThemeTokens = typeof THEME_TOKENS
export type PrimaryColors = typeof PRIMARY_COLORS
export type BackgroundColors = typeof LIGHT_BACKGROUND | typeof DARK_BACKGROUND
export type TextColors = typeof LIGHT_TEXT | typeof DARK_TEXT
export type MenuColors = typeof LIGHT_MENU | typeof DARK_MENU
