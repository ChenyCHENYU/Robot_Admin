// stores/theme.ts
import { darkTheme, lightTheme, type GlobalTheme } from 'naive-ui/es'
import {
  lightThemeOverrides,
  darkThemeOverrides,
  type GlobalThemeOverrides,
  THEME_TOKENS,
} from '@/config/theme'

// 本地存储键名常量
const THEME_MODE_KEY = 'theme-mode'
const THEME_OVERRIDES_KEY = 'theme-overrides'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // 立即获取系统主题状态
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  // 从 localStorage 读取保存的模式
  const savedMode = localStorage.getItem(THEME_MODE_KEY) as ThemeMode

  // 读取自定义主题配置
  let savedCustomOverrides = lightThemeOverrides
  const savedOverrides = localStorage.getItem(THEME_OVERRIDES_KEY)
  if (savedOverrides) {
    try {
      savedCustomOverrides = JSON.parse(savedOverrides)
    } catch (e) {
      console.error('Failed to parse saved theme overrides:', e)
    }
  }

  // State
  const mode = ref<ThemeMode>(savedMode || 'system')
  const systemIsDark = ref(mediaQuery.matches)
  const customOverrides = ref<GlobalThemeOverrides>(savedCustomOverrides)

  // Getters
  const currentTheme = computed<GlobalTheme>(() => {
    if (mode.value === 'system') {
      return systemIsDark.value ? darkTheme : lightTheme
    }
    return mode.value === 'dark' ? darkTheme : lightTheme
  })

  const isDark = computed(() => {
    return (
      mode.value === 'dark' || (mode.value === 'system' && systemIsDark.value)
    )
  })

  const darkModeBgColor = computed(() => THEME_TOKENS.background.dark.body)

  const themeOverridesComputed = computed<GlobalThemeOverrides>(() => {
    const baseOverrides = isDark.value
      ? darkThemeOverrides
      : lightThemeOverrides

    // 深度合并配置，customOverrides 优先级最高
    // 需要合并所有可能的组件配置
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

  // Actions
  const init = () => {
    // 确保状态同步
    systemIsDark.value = mediaQuery.matches

    // 同步 data-theme 属性到 html 元素
    syncThemeAttr()

    // 添加变化监听器
    mediaQuery.addEventListener('change', e => {
      systemIsDark.value = e.matches
      syncThemeAttr()
    })
  }

  /**
   * 同步主题属性到 HTML 元素
   * 设置 [data-theme] 属性，方便 CSS 使用
   * 优化版本：避免样式冲突，确保平滑过渡
   */
  const syncThemeAttr = () => {
    const themeValue = isDark.value ? 'dark' : 'light'
    const root = document.documentElement

    // 批量更新 DOM，减少 reflow
    requestAnimationFrame(() => {
      // 1. 先移除旧的 class（避免冲突）
      root.classList.remove('light', 'dark')

      // 2. 设置新的 data-theme
      root.setAttribute('data-theme', themeValue)

      // 3. 添加新的 class（向后兼容）
      root.classList.add(themeValue)
    })
  }

  const setMode = async (newMode: ThemeMode) => {
    // 检测浏览器是否支持 View Transition API
    const supportsViewTransition = 'startViewTransition' in document

    // 更新主题的核心逻辑
    const updateTheme = () => {
      mode.value = newMode
      localStorage.setItem(THEME_MODE_KEY, newMode)
      syncThemeAttr()
    }

    // 使用 View Transition API（现代浏览器）
    if (supportsViewTransition) {
      // @ts-ignore - View Transition API 尚未完全标准化
      await document.startViewTransition(() => {
        updateTheme()
      }).ready
      return
    }

    // 降级方案：传统过渡（兼容旧浏览器）
    const root = document.documentElement

    // 1. 添加过渡标记（CSS 中定义过渡样式）
    root.classList.add('theme-transitioning')

    // 2. 等待一帧，确保 CSS 类生效
    await new Promise(resolve => requestAnimationFrame(resolve))

    // 3. 更新主题
    updateTheme()

    // 4. 等待过渡完成（300ms，与 CSS 中定义的时间一致）
    await new Promise(resolve => setTimeout(resolve, 300))

    // 5. 移除过渡标记
    root.classList.remove('theme-transitioning')
  }

  const updateThemeOverrides = (overrides: Partial<GlobalThemeOverrides>) => {
    // 深度合并，确保不丢失已有配置
    const mergedOverrides: GlobalThemeOverrides = {
      ...customOverrides.value,
      ...overrides,
      common: {
        ...customOverrides.value.common,
        ...overrides.common,
      },
    }

    customOverrides.value = mergedOverrides

    // 将自定义主题保存到本地存储
    localStorage.setItem(THEME_OVERRIDES_KEY, JSON.stringify(mergedOverrides))
  }

  const resetThemeOverrides = () => {
    customOverrides.value = lightThemeOverrides
    localStorage.removeItem(THEME_OVERRIDES_KEY)
  }

  /**
   * 获取背景颜色（基于 Token）
   * @param key - 背景色键名
   * @returns 响应式的背景颜色值
   */
  const getBgColor = (key: keyof typeof THEME_TOKENS.background.light) => {
    return computed(() =>
      isDark.value
        ? THEME_TOKENS.background.dark[key]
        : THEME_TOKENS.background.light[key]
    )
  }

  /**
   * 获取菜单颜色（基于 Token）
   * @param key - 菜单色键名
   * @returns 响应式的菜单颜色值
   */
  const getMenuColor = (key: keyof typeof THEME_TOKENS.menu.light) => {
    return computed(() =>
      isDark.value ? THEME_TOKENS.menu.dark[key] : THEME_TOKENS.menu.light[key]
    )
  }

  return {
    // State
    mode,
    systemIsDark,
    customOverrides,

    // Getters
    currentTheme,
    isDark,
    darkModeBgColor,
    themeOverrides: themeOverridesComputed,

    // Actions
    init,
    setMode,
    updateThemeOverrides,
    resetThemeOverrides,

    // 新增工具方法
    getBgColor,
    getMenuColor,
    syncThemeAttr,
  }
})
