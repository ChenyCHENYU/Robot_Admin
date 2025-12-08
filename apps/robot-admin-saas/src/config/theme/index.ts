/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-06
 * @FilePath: \Robot_Admin\src\config\theme\index.ts
 * @Description: 主题系统统一导出入口
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * 主题系统导出
 *
 * 架构说明：
 * 1. tokens.ts - 设计 Token，所有颜色和样式常量的单一数据源
 * 2. naive-overrides.ts - Naive UI 主题覆盖配置，基于 Token 构建
 * 3. index.ts (本文件) - 统一导出，便于外部引用
 *
 * 使用示例：
 * import { THEME_TOKENS, themeOverrides, darkThemeOverrides } from '@/config/theme'
 */

// 导出所有 Token
export * from './tokens'

// 导出 Naive UI 覆盖配置
export {
  lightThemeOverrides,
  themeOverrides,
  darkThemeOverrides,
  themeConstants,
  type GlobalThemeOverrides,
} from './naive-overrides'

// 导出类型
export type {
  ThemeTokens,
  PrimaryColors,
  BackgroundColors,
  TextColors,
  MenuColors,
} from './tokens'
