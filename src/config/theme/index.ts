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
 * 1. tokens.ts - 布局与领域样式的既有 Token
 * 2. component-colors.ts - 项目可选的扁平组件配色
 * 3. naive-overrides.ts - 菜单、Dialog 等应用细节，不重复生成通用主题
 * 4. index.ts (本文件) - 统一导出，由主题 Store 组合给现有 Provider
 *
 * 使用示例：
 * import { THEME_TOKENS, lightThemeOverrides, darkThemeOverrides } from '@/config/theme'
 */

// 导出所有 Token
export * from './tokens'
export { PROJECT_COMPONENT_COLORS } from './component-colors'

// 导出 Naive UI 覆盖配置
export {
  lightThemeOverrides,
  darkThemeOverrides,
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
