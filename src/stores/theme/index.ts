// stores/theme.ts
import { darkTheme, lightTheme, type GlobalTheme } from 'naive-ui/es'
import {
  lightThemeOverrides,
  darkThemeOverrides,
  type GlobalThemeOverrides,
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
   */
  const syncThemeAttr = () => {
    const themeValue = isDark.value ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', themeValue)
  }

  const setMode = async (newMode: ThemeMode) => {
    // 记录切换前的视觉状态
    const oldDark = isDark.value

    // 更新状态
    mode.value = newMode
    localStorage.setItem(THEME_MODE_KEY, newMode)

    // 新的视觉状态
    const newDark = isDark.value

    // 如果视觉效果没变化，直接同步 DOM 即可（无需动画）
    if (oldDark === newDark) {
      syncThemeAttr()
      return
    }

    // 视觉有变化，执行过渡动画
    // 完全依赖 View Transition API（现代浏览器）
    if (document.startViewTransition) {
      const root = document.documentElement

      // 添加标记类，用于禁用所有 CSS transitions（防止冲突）
      root.classList.add('theme-transitioning')

      const transition = document.startViewTransition(() => {
        syncThemeAttr()
      })

      // 等待过渡完成后移除标记类
      await transition.finished
        .catch(() => {
          // 忽略用户中断过渡的错误
        })
        .finally(() => {
          root.classList.remove('theme-transitioning')
        })
    } else {
      // 降级方案：不支持的浏览器直接瞬间切换
      syncThemeAttr()
    }
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

  return {
    // State
    mode,
    systemIsDark,
    customOverrides,

    // Getters
    currentTheme,
    isDark,
    themeOverrides: themeOverridesComputed,

    // Actions
    init,
    setMode,
    updateThemeOverrides,
    resetThemeOverrides,
  }
})
