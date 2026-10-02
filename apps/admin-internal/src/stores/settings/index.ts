/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\src\stores\settings\index.ts
 * @Description: 布局设置 Store 的应用级兼容导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { useSettingsStore as useLayoutSettingsStore } from '@robot-admin/layout/naive'

/**
 * 布局设置 Store 兼容名称。
 * 主题模式由 s_themeStore 统一投影，颜色和圆角由主题适配层响应式消费。
 */
export const s_settingsStore = useLayoutSettingsStore

export type {
  BorderRadiusSize,
  LayoutInfo,
  LayoutMode,
  PresetColor,
  SettingsState,
  SettingsStoreOptions,
  TagsViewStyle,
  ThemeMode,
  ThemePreset,
  TransitionType,
} from '@robot-admin/layout/naive'
