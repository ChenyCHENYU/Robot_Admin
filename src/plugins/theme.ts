/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\src\plugins\theme.ts
 * @Description: 应用级主题生命周期初始化
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import type { GlobalThemeOverrides } from '@robot-admin/theme/naive'
import { s_themeStore } from '@/stores/theme'

// 应用页面只消费 --app-*；组件包的 --c-* 留给实例覆盖，避免两套主题相互遮蔽。
const APP_THEME_FIELDS = {
  '--app-primary': 'primaryColor',
  '--app-primary-hover': 'primaryColorHover',
  '--app-primary-pressed': 'primaryColorPressed',
  '--app-primary-suppl': 'primaryColorSuppl',
  '--app-success': 'successColor',
  '--app-warning': 'warningColor',
  '--app-error': 'errorColor',
  '--app-info': 'infoColor',
  '--app-bg-body': 'bodyColor',
  '--app-bg-content': 'cardColor',
  '--app-bg-surface': 'actionColor',
  '--app-bg-layout': 'bodyColor',
  '--app-bg-deep': 'tableHeaderColor',
  '--app-bg-surface-hover': 'hoverColor',
  '--app-hover-bg': 'hoverColor',
  '--app-text-primary': 'textColor1',
  '--app-text-secondary': 'textColor2',
  '--app-text-tertiary': 'textColor3',
  '--app-text-quaternary': 'textColorDisabled',
  '--app-text-disabled': 'textColorDisabled',
  '--app-text-placeholder': 'placeholderColor',
  '--app-border-default': 'borderColor',
  '--app-border-light': 'dividerColor',
  '--app-border-deep': 'borderColor',
  '--app-shadow-sm': 'boxShadow1',
  '--app-shadow-md': 'boxShadow2',
  '--app-shadow-lg': 'boxShadow3',
  '--app-radius': 'borderRadius',
} as const satisfies Record<
  string,
  keyof NonNullable<GlobalThemeOverrides['common']>
>

/** 将最终 Provider 颜色单向投影给应用页面，卸载后恢复原有内联值。 */
function bindAppThemeVariables(themeStore: ReturnType<typeof s_themeStore>) {
  if (typeof document === 'undefined') return () => undefined
  const { style } = document.documentElement
  const previous = Object.keys(APP_THEME_FIELDS).map(name => ({
    name,
    value: style.getPropertyValue(name),
    priority: style.getPropertyPriority(name),
  }))
  const stop = watch(
    () => themeStore.themeOverrides.common,
    common => {
      for (const [name, field] of Object.entries(APP_THEME_FIELDS)) {
        const value = common?.[field]
        if (typeof value === 'string') style.setProperty(name, value)
        else style.removeProperty(name)
      }
    },
    { immediate: true, flush: 'post' }
  )
  return () => {
    stop()
    for (const { name, value, priority } of previous) {
      if (value) style.setProperty(name, value, priority)
      else style.removeProperty(name)
    }
  }
}

/**
 * * @description: 在 Pinia 和布局系统就绪后初始化主题，并注册应用卸载清理。
 * ? @param {App} app Vue 应用实例
 * ! @return {void}
 */
export function setupThemeSystem(app: App): void {
  const themeStore = s_themeStore()
  themeStore.init()
  const restoreAppTheme = bindAppThemeVariables(themeStore)

  // 首屏脚本写入的临时背景色到此已由正式主题 CSS 接管。
  if (typeof document !== 'undefined') {
    document.documentElement.style.removeProperty('background')
    document.documentElement.style.removeProperty('background-color')
  }

  app.onUnmount(() => {
    restoreAppTheme()
    themeStore.destroy()
  })
  // 主题属于应用生命周期；模块热替换不等于应用卸载。
  // 在模块 dispose 中恢复 Token 会让仍在运行的 Provider 与根 DOM 脱节。
}
