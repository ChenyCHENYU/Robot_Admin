/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-10 09:30:28
 * @FilePath: \Robot_Admin\src\config\theme\naive-overrides.ts
 * @Description: Naive UI 主题覆盖配置 - 基于 Token 系统
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { GlobalThemeOverrides } from '@robot-admin/theme/naive'
import {
  PRIMARY_COLORS,
  LIGHT_BACKGROUND,
  LIGHT_MENU,
  DARK_MENU,
} from './tokens'

export type { GlobalThemeOverrides } from '@robot-admin/theme/naive'

/**
 * 亮色模式菜单配置
 * 基于 Token 系统，消除硬编码
 */
const lightMenuConfig: GlobalThemeOverrides['Menu'] = {
  color: LIGHT_MENU.background,
  scrollbarColor: LIGHT_MENU.scrollbar,
  scrollbarColorHover: LIGHT_MENU.scrollbar,

  itemTextColor: LIGHT_MENU.itemText,
  itemTextColorHover: LIGHT_MENU.itemTextHover,
  itemTextColorActive: LIGHT_MENU.itemTextActive,
  itemTextColorActiveHover: LIGHT_MENU.itemTextActiveHover,
  itemTextColorChildActive: LIGHT_MENU.itemTextActive,

  itemIconColor: LIGHT_MENU.itemIcon,
  itemIconColorHover: LIGHT_MENU.itemIconHover,
  itemIconColorActive: LIGHT_MENU.itemIconActive,
  itemIconColorActiveHover: LIGHT_MENU.itemTextActiveHover,
  itemIconColorChildActive: LIGHT_MENU.itemIconActive,

  arrowColor: LIGHT_MENU.itemIcon,
  arrowColorHover: LIGHT_MENU.itemIconHover,
  arrowColorActive: LIGHT_MENU.itemIconActive,
  arrowColorChildActive: LIGHT_MENU.itemIconActive,

  itemColorActive: LIGHT_MENU.itemBgActive,
  itemColorActiveHover: LIGHT_MENU.itemBgActive,
  itemColorActiveCollapsed: LIGHT_MENU.itemBgActive,
  itemColorHover: LIGHT_MENU.itemBgHover,

  itemPadding: '0 16px',
  itemHeight: '44px',
  itemBorderRadius: '0',
}

/**
 * 暗色模式菜单配置
 * 基于 Token 系统，消除硬编码
 */
const darkMenuConfig: GlobalThemeOverrides['Menu'] = {
  itemTextColor: DARK_MENU.itemText,
  itemTextColorHover: DARK_MENU.itemTextHover,
  itemTextColorActive: DARK_MENU.itemTextActive,
  itemTextColorActiveHover: DARK_MENU.itemTextActiveHover,
  itemTextColorChildActive: DARK_MENU.itemTextActive,

  itemIconColor: DARK_MENU.itemIcon,
  itemIconColorHover: DARK_MENU.itemIconHover,
  itemIconColorActive: DARK_MENU.itemIconActive,
  itemIconColorActiveHover: DARK_MENU.itemIconHover,
  itemIconColorChildActive: DARK_MENU.itemIconActive,

  arrowColor: DARK_MENU.itemIcon,
  arrowColorHover: DARK_MENU.itemIconHover,
  arrowColorActive: DARK_MENU.itemIconActive,
  arrowColorChildActive: DARK_MENU.itemIconActive,

  itemColorActive: DARK_MENU.itemBgActive,
  itemColorActiveHover: DARK_MENU.itemBgActive,
  itemColorActiveCollapsed: DARK_MENU.itemBgActive,
  itemColorHover: DARK_MENU.itemBgHover,

  itemPadding: '0 16px',
  itemHeight: '44px',
  itemBorderRadius: '0',
}

/**
 * 亮色主题全局配置
 * 包含通用属性和各组件在亮色模式下的配置
 */
export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: PRIMARY_COLORS.default,
    primaryColorHover: PRIMARY_COLORS.hover,
    primaryColorPressed: PRIMARY_COLORS.pressed,
    primaryColorSuppl: PRIMARY_COLORS.suppl,
    infoColor: PRIMARY_COLORS.default,
    infoColorHover: PRIMARY_COLORS.hover,
    infoColorPressed: PRIMARY_COLORS.pressed,
    infoColorSuppl: PRIMARY_COLORS.suppl,
    bodyColor: LIGHT_BACKGROUND.body,
  },
  Menu: lightMenuConfig,

  // 扩展：Card 组件配置
  Card: {
    borderRadius: '8px',
    paddingMedium: '16px',
  },

  // 扩展：Button 组件配置
  Button: {
    borderRadiusMedium: '6px',
  },

  // 扩展：Input 组件配置
  Input: {
    borderRadius: '6px',
  },
}

/**
 * 暗色主题全局配置
 * 包含通用属性和各组件在暗色模式下的配置
 */
const darkThemeOverridesConfig: GlobalThemeOverrides = {
  common: {
    primaryColor: PRIMARY_COLORS.default,
    primaryColorHover: PRIMARY_COLORS.hover,
    primaryColorPressed: PRIMARY_COLORS.pressed,
    primaryColorSuppl: PRIMARY_COLORS.suppl,
    infoColor: PRIMARY_COLORS.default,
    infoColorHover: PRIMARY_COLORS.hover,
    infoColorPressed: PRIMARY_COLORS.pressed,
    infoColorSuppl: PRIMARY_COLORS.suppl,
  },
  Menu: darkMenuConfig,

  // 扩展：Card 组件配置
  Card: {
    borderRadius: '8px',
    paddingMedium: '16px',
  },

  // 扩展：Button 组件配置
  Button: {
    borderRadiusMedium: '6px',
  },

  // 扩展：Input 组件配置
  Input: {
    borderRadius: '6px',
  },
}

export const darkThemeOverrides = darkThemeOverridesConfig
