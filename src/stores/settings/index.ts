/**
 * 主题配置系统 - Store
 * 重新导出 @robot-admin/layout 的 settings store
 * 并添加同步到 Naive UI 的逻辑
 */

import { watch } from 'vue'
import {
  useSettingsStore as useLayoutSettingsStore,
  adjustColor,
} from '@robot-admin/layout'
import { useThemeStore } from '@/stores/theme'

/**
 * 初始化 settings store 与 Naive UI 的同步
 * 在 app setup 后调用
 */
export function initSettingsStoreSync() {
  const settingsStore = useLayoutSettingsStore()
  const themeStore = useThemeStore()

  // 监听主题色变化，同步到 Naive UI
  watch(
    () => settingsStore.primaryColor,
    newColor => {
      themeStore.updateThemeOverrides({
        common: {
          primaryColor: newColor,
          primaryColorHover: adjustColor(newColor, 10),
          primaryColorPressed: adjustColor(newColor, -10),
          primaryColorSuppl: newColor,
        },
      })
    },
    { immediate: true }
  )

  // 监听圆角大小变化，同步到 Naive UI
  watch(
    () => settingsStore.borderRadiusValue,
    newRadius => {
      themeStore.updateThemeOverrides({
        common: {
          borderRadius: newRadius,
          borderRadiusSmall: newRadius,
          borderRadiusMedium: newRadius,
          borderRadiusLarge: newRadius,
        },
        Radio: {
          buttonBorderRadius: newRadius,
        },
      })
    },
    { immediate: true }
  )

  // 监听主题模式变化
  watch(
    () => settingsStore.themeMode,
    mode => {
      if (mode === 'auto') {
        themeStore.setMode('system')
      } else {
        themeStore.setMode(mode)
      }
    },
    { immediate: true }
  )

  // 开发环境：监听布局模式变化
  if (import.meta.env.DEV) {
    console.log(
      '[Settings Store] 初始化布局包 store，当前布局模式:',
      settingsStore.layoutMode
    )
    watch(
      () => settingsStore.layoutMode,
      (newMode, oldMode) => {
        console.log('[Settings Store] 布局模式变化:', oldMode, '->', newMode)
      }
    )
  }
}

/**
 * 导出布局包的 settings store
 * 保持与原有 API 兼容
 */
export const useSettingsStore = useLayoutSettingsStore

// 重新导出类型（从布局包导出，避免类型重复定义）
export type {
  ThemePreset,
  LayoutMode,
  TransitionType,
  BorderRadiusSize,
  TagsViewStyle,
  SettingsState,
  SettingsStoreOptions,
  LayoutInfo,
  PresetColor,
} from '@robot-admin/layout'

export type { ThemeMode } from '@robot-admin/theme'
