/**
 * 主题管理系统 - Naive UI 集成扩展
 * 基于 @robot-admin/theme 包，添加 Naive UI 主题配置功能
 * 包含菜单风格切换（个性 / 标准）
 */

import { computed, ref, watch } from 'vue'
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

/**
 * 菜单风格标识
 * - signature: 个性（深邃星空玻璃质感，项目原始风格）
 * - standard: 标准（白/黑自然跟随系统明暗主题）
 */
export type MenuThemeType = 'signature' | 'standard'

// 本地存储键名
const THEME_OVERRIDES_KEY = 'robot-admin-theme-overrides'
const MENU_THEME_KEY = 'robot-admin-menu-theme'

/**
 * 主题 Store（扩展版）
 * 包含基础主题功能 + Naive UI 集成 + 菜单风格切换
 */
export const s_themeStore = defineStore('theme-extended', () => {
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

  // ============ 菜单风格 ============

  const savedMenuTheme =
    (localStorage.getItem(MENU_THEME_KEY) as MenuThemeType) || 'signature'
  const menuTheme = ref<MenuThemeType>(savedMenuTheme)

  /**
   * 标准模式下菜单侧边栏是否为亮色（亮色主题时白底深字）
   * 个性模式永远深色侧边栏
   */
  const isMenuLight = computed(() => {
    if (menuTheme.value === 'signature') return false
    return !isDark.value
  })

  // ============ 计算属性 ============

  /**
   * 当前 Naive UI 主题对象
   */
  const currentTheme = computed<GlobalTheme>(() => {
    return isDark.value ? darkTheme : lightTheme
  })

  /**
   * Naive UI 主题覆盖配置（合并基础配置和自定义配置）
   *
   * 个性模式：完整使用 tokens 定义的 Menu 配色（原始行为，不做任何改动）
   * 标准模式：不覆盖 Menu 颜色，让 Naive UI 自然跟随 primaryColor
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
    const components =
      menuTheme.value === 'signature'
        ? ['Menu', 'Button', 'Radio', 'Card', 'Input']
        : ['Button', 'Radio', 'Card', 'Input']

    components.forEach(comp => {
      if (baseOverrides[comp] || customOverrides.value[comp]) {
        result[comp] = {
          ...baseOverrides[comp],
          ...customOverrides.value[comp],
        }
      }
    })

    // 标准模式：Menu 仅保留结构性覆盖，颜色让 Naive UI 自然适配
    if (menuTheme.value === 'standard') {
      result.Menu = {
        itemPadding: '0 16px',
        itemHeight: '44px',
        itemBorderRadius: '6px',
      }
    }

    return result
  })

  // ============ Actions ============

  /**
   * 初始化主题系统
   */
  const init = () => {
    baseThemeStore.init()
    _syncMenuCSSVariables()
  }

  /**
   * 设置主题模式
   */
  const setMode = async (newMode: ThemeMode) => {
    await baseThemeStore.setMode(newMode)
  }

  /**
   * * @description: 切换菜单风格
   * ? @param {MenuThemeType} theme 目标风格标识
   */
  const setMenuTheme = (theme: MenuThemeType) => {
    menuTheme.value = theme
    localStorage.setItem(MENU_THEME_KEY, theme)
    _syncMenuCSSVariables()
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

  /**
   * 同步菜单相关 CSS 变量（供布局包 CSS 消费）
   *
   * 两层覆盖策略：
   * 1. CSS 变量层 — 覆盖 layout 包 var() 的 fallback 值（渐变/阴影/模糊等）
   * 2. CSS 规则层 — 通过 data-menu-theme 属性在 custom.scss 中覆盖硬编码效果
   *
   * 个性模式：不设置任何 --menu-* 变量，让 layout 包使用原始 fallback（紫色玻璃质感）
   * 标准模式：设置 --menu-* 变量为中性值，消除玻璃/紫色装饰层
   */
  const _syncMenuCSSVariables = () => {
    const root = document.documentElement

    // 设置 data-menu-theme 属性，供 CSS 规则层作用域
    root.setAttribute('data-menu-theme', menuTheme.value)

    if (menuTheme.value === 'signature') {
      root.style.setProperty('--app-bg-menu', '#0d1425')
      root.style.setProperty('--app-menu-bg', '#0d1425')
      // 个性模式不需要文字/边框变量，由 SCSS 渐变样式自行控制
      root.style.removeProperty('--app-menu-text')
      root.style.removeProperty('--app-menu-text-sub')
      root.style.removeProperty('--app-menu-border')
      // 移除标准模式的 layout 包变量覆盖，让 fallback 生效
      _removeMenuEffectVars(root)
    } else {
      // 标准模式：背景、文字、边框全部跟随明暗主题
      const isLight = !isDark.value
      root.style.setProperty('--app-bg-menu', isLight ? '#ffffff' : '#1c1c1c')
      root.style.setProperty('--app-menu-bg', isLight ? '#ffffff' : '#1c1c1c')
      root.style.setProperty('--app-menu-text', isLight ? '#333333' : '#e0e0e0')
      root.style.setProperty(
        '--app-menu-text-sub',
        isLight ? '#999999' : '#888888'
      )
      root.style.setProperty(
        '--app-menu-border',
        isLight ? '#e5e7eb' : '#333333'
      )
      // 覆盖 layout 包 CSS 变量，消除紫色玻璃装饰
      _setStandardMenuVars(root)
    }
  }

  /** 移除标准模式对 layout 包 CSS 变量的覆盖 */
  const _removeMenuEffectVars = (root: HTMLElement) => {
    const vars = [
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
    ]
    vars.forEach(v => root.style.removeProperty(v))
  }

  /** 设置标准模式 layout 包 CSS 变量（中性值，消除玻璃质感） */
  const _setStandardMenuVars = (root: HTMLElement) => {
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

  // 监听暗色模式变化，自动同步
  watch(isDark, () => {
    _syncMenuCSSVariables()
  })

  return {
    // 基础主题状态（从包 re-export）
    mode,
    systemIsDark,
    isDark,

    // Naive UI 扩展状态
    customOverrides,
    currentTheme,
    themeOverrides,

    // 菜单风格
    menuTheme,
    isMenuLight,

    // Actions
    init,
    setMode,
    setMenuTheme,
    updateThemeOverrides,
    resetThemeOverrides,
  }
})

// 重新导出类型（保持兼容性）
export type { ThemeMode } from '@robot-admin/theme'
