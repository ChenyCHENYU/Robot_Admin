/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\src\stores\theme\index.ts
 * @Description: 主题管理与 Naive UI、菜单风格的应用级适配
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { computed, ref, watch, type WatchStopHandle } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import {
  useNaiveTheme,
  useThemeStore as useBaseThemeStore,
  type DesignStyle,
  type ThemeMode,
} from '@robot-admin/theme/naive'
import { adjustColor } from '@robot-admin/layout/naive'
import {
  darkThemeOverrides,
  lightThemeOverrides,
  type GlobalThemeOverrides,
} from '../../config/theme'
import { s_settingsStore } from '../settings'

/** 菜单风格标识。 */
export type MenuThemeType = 'signature' | 'standard'

const MENU_THEME_KEY = 'robot-admin-menu-theme'
const MENU_THEME_TYPES: ReadonlySet<string> = new Set(['signature', 'standard'])
const MENU_EFFECT_VARIABLES = [
  '--menu-selected-gradient-start',
  '--menu-selected-gradient-end',
  '--menu-selected-shadow',
  '--menu-selected-blur',
  '--menu-selected-saturate',
  '--menu-selected-border-width',
  '--menu-selected-border-color',
  '--menu-parent-blur',
  '--menu-parent-saturate',
  '--menu-parent-border-width',
  '--menu-parent-border-color',
  '--menu-border-radius',
] as const
const MENU_COLOR_VARIABLES = [
  '--app-bg-menu',
  '--app-menu-bg',
  '--app-menu-text',
  '--app-menu-text-sub',
  '--app-menu-border',
] as const
const STANDARD_MENU_OVERRIDES: NonNullable<GlobalThemeOverrides['Menu']> = {
  itemPadding: '0 16px',
  itemHeight: '44px',
  itemBorderRadius: '6px',
}

/** 判断未知值是否为支持的菜单风格。 */
function isMenuTheme(value: unknown): value is MenuThemeType {
  return typeof value === 'string' && MENU_THEME_TYPES.has(value)
}

/** 安全读取菜单风格，并清理历史脏值。 */
function readMenuTheme(): MenuThemeType {
  if (typeof window === 'undefined') return 'signature'
  try {
    const saved = window.localStorage.getItem(MENU_THEME_KEY)
    if (saved === null) return 'signature'
    if (isMenuTheme(saved)) return saved
    window.localStorage.removeItem(MENU_THEME_KEY)
  } catch {
    // 浏览器存储不可用时回退到内存默认值。
  }
  return 'signature'
}

/** 安全保存菜单风格。 */
function saveMenuTheme(theme: MenuThemeType): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MENU_THEME_KEY, theme)
  } catch {
    // 配额或隐私限制不得阻断菜单风格切换。
  }
}

/** 为标准菜单移除签名模式的颜色配置，仅保留结构属性。 */
function resolveMenuOverrides(
  overrides: GlobalThemeOverrides,
  menuTheme: MenuThemeType
): GlobalThemeOverrides {
  if (menuTheme === 'signature') return overrides
  return { ...overrides, Menu: STANDARD_MENU_OVERRIDES }
}

/**
 * 主题 Store：包内 Store 是明暗/设计风格唯一来源，本层只组合应用 Token 和菜单呈现。
 */
export const s_themeStore = defineStore('theme-extended', () => {
  const baseThemeStore = useBaseThemeStore()
  const settingsStore = s_settingsStore()
  const { mode, systemIsDark, isDark, designStyle, currentDesignStyleConfig } =
    storeToRefs(baseThemeStore)

  const menuTheme = ref<MenuThemeType>(readMenuTheme())

  /** 标准模式随明暗主题变化；签名模式始终使用深色菜单。 */
  const isMenuLight = computed(
    () => menuTheme.value === 'standard' && !isDark.value
  )

  /** 设置项直接派生为增量覆盖，避免维护第二份持久化主题状态。 */
  const settingsOverrides = computed<GlobalThemeOverrides>(() => {
    const { primaryColor, borderRadiusValue: borderRadius } = settingsStore
    return {
      common: {
        primaryColor,
        primaryColorHover: adjustColor(primaryColor, 10),
        primaryColorPressed: adjustColor(primaryColor, -10),
        primaryColorSuppl: primaryColor,
        borderRadius,
        borderRadiusSmall: borderRadius,
        borderRadiusMedium: borderRadius,
        borderRadiusLarge: borderRadius,
      },
      Radio: {
        buttonBorderRadius: borderRadius,
      },
    }
  })

  const lightOverrides = computed(() =>
    resolveMenuOverrides(lightThemeOverrides, menuTheme.value)
  )
  const darkOverrides = computed(() =>
    resolveMenuOverrides(darkThemeOverrides, menuTheme.value)
  )
  const { currentTheme, themeOverrides } = useNaiveTheme({
    isDark,
    lightOverrides,
    darkOverrides,
    overrides: settingsOverrides,
  })

  let stopThemeSync: WatchStopHandle | null = null
  let removeMenuStorageListener: (() => void) | null = null

  /** 移除标准菜单对布局包变量的覆盖。 */
  const removeMenuEffectVariables = (root: HTMLElement): void => {
    for (const variable of MENU_EFFECT_VARIABLES) {
      root.style.removeProperty(variable)
    }
  }

  /** 设置标准菜单的中性布局变量。 */
  const setStandardMenuVariables = (root: HTMLElement): void => {
    root.style.setProperty('--menu-selected-gradient-start', 'transparent')
    root.style.setProperty('--menu-selected-gradient-end', 'transparent')
    root.style.setProperty('--menu-selected-shadow', 'none')
    root.style.setProperty('--menu-selected-blur', '0px')
    root.style.setProperty('--menu-selected-saturate', '100%')
    root.style.setProperty('--menu-selected-border-width', '0px')
    root.style.setProperty('--menu-selected-border-color', 'transparent')
    root.style.setProperty('--menu-parent-blur', '0px')
    root.style.setProperty('--menu-parent-saturate', '100%')
    root.style.setProperty('--menu-parent-border-width', '0px')
    root.style.setProperty('--menu-parent-border-color', 'transparent')
    root.style.setProperty('--menu-border-radius', '6px')
  }

  /** 同步菜单属性和布局包消费的 CSS 变量。 */
  const syncMenuPresentation = (): void => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.setAttribute('data-menu-theme', menuTheme.value)

    if (menuTheme.value === 'signature') {
      root.style.setProperty('--app-bg-menu', '#0d1425')
      root.style.setProperty('--app-menu-bg', '#0d1425')
      root.style.removeProperty('--app-menu-text')
      root.style.removeProperty('--app-menu-text-sub')
      root.style.removeProperty('--app-menu-border')
      removeMenuEffectVariables(root)
      return
    }

    const light = !isDark.value
    root.style.setProperty('--app-bg-menu', light ? '#ffffff' : '#1c1c1c')
    root.style.setProperty('--app-menu-bg', light ? '#ffffff' : '#1c1c1c')
    root.style.setProperty('--app-menu-text', light ? '#333333' : '#e0e0e0')
    root.style.setProperty('--app-menu-text-sub', light ? '#999999' : '#888888')
    root.style.setProperty('--app-menu-border', light ? '#e5e7eb' : '#333333')
    setStandardMenuVariables(root)
  }

  /** 清理本层写入的菜单 DOM 状态。 */
  const clearMenuPresentation = (): void => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.removeAttribute('data-menu-theme')
    for (const variable of MENU_COLOR_VARIABLES) {
      root.style.removeProperty(variable)
    }
    removeMenuEffectVariables(root)
  }

  /** 将包内主题模式投影到布局设置，保持设置抽屉与快捷入口一致。 */
  const syncSettingsMode = (): void => {
    if (settingsStore.themeMode !== mode.value) {
      settingsStore.themeMode = mode.value
    }
  }

  /** 响应其他同源标签页的菜单风格变化。 */
  const handleMenuStorage = (event: StorageEvent): void => {
    if (event.key !== MENU_THEME_KEY) return
    const nextTheme = event.newValue === null ? 'signature' : event.newValue
    if (!isMenuTheme(nextTheme)) return
    menuTheme.value = nextTheme
    syncMenuPresentation()
  }

  /** 初始化主题系统和应用级同步，重复调用安全。 */
  const init = (): void => {
    baseThemeStore.init()
    syncSettingsMode()
    syncMenuPresentation()

    if (!stopThemeSync) {
      stopThemeSync = watch([mode, isDark], () => {
        syncSettingsMode()
        syncMenuPresentation()
      })
    }

    if (
      !removeMenuStorageListener &&
      typeof window !== 'undefined' &&
      typeof window.addEventListener === 'function'
    ) {
      window.addEventListener('storage', handleMenuStorage)
      removeMenuStorageListener = () =>
        window.removeEventListener('storage', handleMenuStorage)
    }
  }

  /** 释放主题监听并清理本层写入的菜单 DOM 状态。 */
  const destroy = (): void => {
    stopThemeSync?.()
    stopThemeSync = null
    removeMenuStorageListener?.()
    removeMenuStorageListener = null
    clearMenuPresentation()
    baseThemeStore.destroy()
  }

  /** 设置主题模式，并立即同步布局设置投影。 */
  const setMode = async (newMode: ThemeMode): Promise<void> => {
    await baseThemeStore.setMode(newMode)
    syncSettingsMode()
  }

  /** 循环切换主题模式。 */
  const toggleMode = async (): Promise<void> => {
    await baseThemeStore.toggleMode()
    syncSettingsMode()
  }

  /** 在亮色和暗色之间切换。 */
  const toggleDark = async (): Promise<void> => {
    await baseThemeStore.toggleDark()
    syncSettingsMode()
  }

  /** 设置设计风格，并同步可能被兼容性规则归一化的主题模式。 */
  const setDesignStyle = async (style: DesignStyle): Promise<void> => {
    await baseThemeStore.setDesignStyle(style)
    syncSettingsMode()
  }

  /** 循环切换设计风格。 */
  const toggleDesignStyle = async (): Promise<void> => {
    await baseThemeStore.toggleDesignStyle()
    syncSettingsMode()
  }

  /** 设置菜单风格并同步 DOM。 */
  const setMenuTheme = (theme: MenuThemeType): void => {
    if (!isMenuTheme(theme)) {
      throw new RangeError(`未知的菜单风格: ${String(theme)}`)
    }
    menuTheme.value = theme
    saveMenuTheme(theme)
    syncMenuPresentation()
  }

  return {
    mode,
    systemIsDark,
    isDark,
    designStyle,
    currentDesignStyleConfig,
    currentTheme,
    themeOverrides,
    menuTheme,
    isMenuLight,
    init,
    destroy,
    setMode,
    toggleMode,
    toggleDark,
    setDesignStyle,
    toggleDesignStyle,
    setMenuTheme,
  }
})

export type { DesignStyle, ThemeMode } from '@robot-admin/theme/core'
