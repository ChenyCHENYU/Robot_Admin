/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\src\config\theme\component-colors.ts
 * @Description: 项目级组件配色；缺省角色沿用正式组件库标准
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type {
  ComponentColorMode,
  ComponentThemeColors,
} from '@robot-admin/naive-ui-components/config'
import { DARK_BACKGROUND, LIGHT_BACKGROUND } from './tokens'

/**
 * 项目只在这里覆盖需要改变的角色，支持 #RGB / #RRGGBB。
 * 主色和圆角仍由设置 Store 管理；此处不保存第二份用户偏好。
 */
export const PROJECT_COMPONENT_COLORS: Record<
  ComponentColorMode,
  Partial<ComponentThemeColors>
> = {
  light: { bgBody: LIGHT_BACKGROUND.body },
  dark: { bgBody: DARK_BACKGROUND.body },
}
