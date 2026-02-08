/**
 * 主题管理系统 - Naive UI 集成扩展
 * 基于 @robot-admin/theme 包，添加 Naive UI 主题配置功能
 */

import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { darkTheme, lightTheme, type GlobalTheme } from 'naive-ui/es'
import {
  useThemeStore as useBaseThemeStore,
  type ThemeMode,
} from '@robot-admin/theme'
import {
  lightThemeOverrides,
  darkThemeOverrides,
  type GlobalThemeOverrides,
} from '@/config/theme'

// 本地存储键名
const THEME_OVERRIDES_KEY = 'robot-admin-theme-overrides'

/**
 * 主题 Store（扩展版）
 * 包含基础主题功能 + Naive UI 集成
 */
export const useThemeStore = defineStore('theme-extended', () => {
  // ============ 基础主题 Store ============
  const baseThemeStore = useBaseThemeStore()
  const { mode, systemIsDark, isDark } = storeToRefs(baseThemeStore)

  // ============ Naive UI 主题配置 ============

  // 读取自定义主题覆盖配置
  let savedCustomOverrides = lightThemeOverrides
  const savedOverrides = localStorage.getItem(THEME_OVERRIDES_KEY)
  if (savedOverrides) {
    try {
      savedCustomOverrides = JSON.parse(savedOverrides)
    } catch (e) {
      console.error('Failed to parse saved theme overrides:', e)
    }
  }

  const customOverrides = ref<GlobalThemeOverrides>(savedCustomOverrides)

  // ============ 计算属性 ============

  /**
   * 当前 Naive UI 主题对象
   */
  const currentTheme = computed<GlobalTheme>(() => {
    return isDark.value ? darkTheme : lightTheme
  })

  /**
   * Naive UI 主题覆盖配置（合并基础配置和自定义配置）
   */
  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    const baseOverrides = isDark.value
      ? darkThemeOverrides
      : lightThemeOverrides

    // 深度合并配置，customOverrides 优先级最高
    const result: GlobalThemeOverrides = {
      ...baseOverrides,
      ...customOverrides.value,
      common: {
        ...baseOverrides.common,
        ...customOverrides.value.common,
      },
    }

    // 合并组件级别的配置
    const components = ['Menu', 'Button', 'Radio', 'Card', 'Input']
    components.forEach(comp => {
      if (baseOverrides[comp] || customOverrides.value[comp]) {
        result[comp] = {
          ...baseOverrides[comp],
          ...customOverrides.value[comp],
        }
      }
    })

    return result
  })

  // ============ Actions ============

  /**
   * 初始化主题系统
   */
  const init = () => {
    baseThemeStore.init()
  }

  /**
   * 设置主题模式
   */
  const setMode = async (newMode: ThemeMode) => {
    await baseThemeStore.setMode(newMode)
  }

  /**
   * 更新 Naive UI 主题覆盖配置
   */
  const updateThemeOverrides = (overrides: Partial<GlobalThemeOverrides>) => {
    const mergedOverrides: GlobalThemeOverrides = {
      ...customOverrides.value,
      ...overrides,
      common: {
        ...customOverrides.value.common,
        ...overrides.common,
      },
    }

    customOverrides.value = mergedOverrides
    localStorage.setItem(THEME_OVERRIDES_KEY, JSON.stringify(mergedOverrides))
  }

  /**
   * 重置主题覆盖配置
   */
  const resetThemeOverrides = () => {
    customOverrides.value = lightThemeOverrides
    localStorage.removeItem(THEME_OVERRIDES_KEY)
  }

  return {
    // 基础主题状态（从包 re-export）
    mode,
    systemIsDark,
    isDark,

    // Naive UI 扩展状态
    customOverrides,
    currentTheme,
    themeOverrides,

    // Actions
    init,
    setMode,
    updateThemeOverrides,
    resetThemeOverrides,
  }
})

// 重新导出类型（保持兼容性）
export type { ThemeMode } from '@robot-admin/theme'
