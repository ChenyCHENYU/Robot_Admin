/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-10 08:08:33
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-12 14:35:29
 * @FilePath: \Robot_Admin\src\components\global\C_Settings\data.ts
 * @Description: 设置组件 - 静态数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { ThemePreset } from '@/stores/settings/types'
import { THEME_PRESETS } from '@/stores/settings/constants'

// 颜色快速选择
export const COLOR_SWATCHES = [
  '#409eff',
  '#f5222d',
  '#fa541c',
  '#faad14',
  '#52c41a',
  '#13c2c2',
  '#2f54eb',
  '#722ed1',
]

// 布局模式选项 - 完整的 6 种布局
export const LAYOUT_MODES = [
  {
    label: '左侧菜单（默认）',
    value: 'side',
    disabled: false,
    svg: `
      <rect x="0" y="0" width="16" height="48" rx="1" fill="currentColor" fill-opacity="0.9"/>
      <rect x="18" y="0" width="38" height="10" rx="1" fill="currentColor" fill-opacity="0.7"/>
      <rect x="18" y="12" width="38" height="34" rx="1" fill="currentColor" fill-opacity="0.4"/>
    `,
  },
  {
    label: '顶部菜单（清爽）',
    value: 'top',
    disabled: false,
    svg: `
      <rect x="0" y="0" width="56" height="10" rx="1" fill="currentColor" fill-opacity="0.9"/>
      <rect x="0" y="12" width="56" height="8" rx="1" fill="currentColor" fill-opacity="0.7"/>
      <rect x="0" y="22" width="56" height="24" rx="1" fill="currentColor" fill-opacity="0.4"/>
    `,
  },
  {
    label: '左侧混合（灵巧）',
    value: 'mix',
    disabled: false,
    svg: `
      <rect x="0" y="0" width="8" height="48" rx="1" fill="currentColor" fill-opacity="0.9"/>
      <rect x="10" y="0" width="14" height="48" rx="1" fill="currentColor" fill-opacity="0.7"/>
      <rect x="26" y="0" width="30" height="10" rx="1" fill="currentColor" fill-opacity="0.6"/>
      <rect x="26" y="12" width="30" height="34" rx="1" fill="currentColor" fill-opacity="0.4"/>
    `,
  },
  {
    label: '顶部混合（侧优）',
    value: 'mix-top',
    disabled: false,
    svg: `
      <rect x="0" y="0" width="8" height="48" rx="1" fill="currentColor" fill-opacity="0.9"/>
      <rect x="10" y="0" width="46" height="10" rx="1" fill="currentColor" fill-opacity="0.7"/>
      <rect x="10" y="12" width="46" height="34" rx="1" fill="currentColor" fill-opacity="0.4"/>
    `,
  },

  {
    label: '反转混合',
    value: 'reverse-horizontal-mix',
    disabled: false,
    svg: `
      <rect x="0" y="0" width="56" height="10" rx="1" fill="currentColor" fill-opacity="0.9"/>
      <rect x="44" y="12" width="12" height="34" rx="1" fill="currentColor" fill-opacity="0.7"/>
      <rect x="0" y="12" width="42" height="34" rx="1" fill="currentColor" fill-opacity="0.4"/>
    `,
  },
  {
    label: '双列菜单',
    value: 'two-column',
    disabled: true,
    svg: `
      <rect x="0" y="0" width="8" height="48" rx="1" fill="currentColor" fill-opacity="0.9"/>
      <rect x="10" y="0" width="16" height="48" rx="1" fill="currentColor" fill-opacity="0.7"/>
      <rect x="28" y="0" width="28" height="10" rx="1" fill="currentColor" fill-opacity="0.6"/>
      <rect x="28" y="12" width="28" height="34" rx="1" fill="currentColor" fill-opacity="0.4"/>
    `,
  },
]

// 主题预设方案
export { THEME_PRESETS }

// 主题预设方案类型
export type { ThemePreset }
