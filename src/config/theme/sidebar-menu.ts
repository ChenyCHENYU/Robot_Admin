/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-11-14
 * @FilePath: \Robot_Admin\src\config\theme\sidebar-menu.ts
 * @Description: 侧栏菜单实例配色；复用全局主色，不影响水平菜单与业务内菜单
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { MenuProps } from 'naive-ui'

/** 仅配置侧栏 NMenu 的有效主题字段，行高由同一个原生变量贯穿行与点击区域。 */
export function createSidebarMenuTheme(
  light: boolean,
  primary: string
): NonNullable<MenuProps['themeOverrides']> {
  const text = light ? '#475569' : '#bbc8dd'
  const strongText = light ? '#17263d' : '#f2f6fc'
  const icon = light ? '#718198' : '#8498b5'
  const accent = light ? primary : `color-mix(in srgb, ${primary} 68%, white)`
  const active = `color-mix(in srgb, ${primary} ${light ? 9 : 17}%, transparent)`
  const activeHover = `color-mix(in srgb, ${primary} ${light ? 13 : 22}%, transparent)`

  return {
    color: 'transparent',
    itemHeight: '36px',
    borderRadius: '8px',
    itemTextColor: text,
    itemTextColorHover: strongText,
    itemTextColorActive: light ? primary : strongText,
    itemTextColorActiveHover: light ? primary : strongText,
    itemTextColorChildActive: strongText,
    itemTextColorChildActiveHover: strongText,
    itemIconColor: icon,
    itemIconColorHover: strongText,
    itemIconColorActive: accent,
    itemIconColorActiveHover: accent,
    itemIconColorChildActive: text,
    itemIconColorChildActiveHover: strongText,
    itemIconColorCollapsed: icon,
    itemColorHover: light
      ? 'rgba(23, 38, 61, 0.045)'
      : 'rgba(225, 235, 250, 0.055)',
    itemColorActive: active,
    itemColorActiveHover: activeHover,
    itemColorActiveCollapsed: active,
    arrowColor: icon,
    arrowColorHover: text,
    arrowColorActive: accent,
    arrowColorActiveHover: accent,
    arrowColorChildActive: text,
    arrowColorChildActiveHover: strongText,
  }
}
