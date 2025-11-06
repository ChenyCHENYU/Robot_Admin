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
    return {
      ...baseOverrides,
      ...customOverrides.value,
      common: {
        ...baseOverrides.common,
        ...customOverrides.value.common,
        primaryColor:
          customOverrides.value.common?.primaryColor ||
          baseOverrides.common?.primaryColor,
        primaryColorHover:
          customOverrides.value.common?.primaryColorHover ||
          baseOverrides.common?.primaryColorHover,
      },
      Menu: {
        ...baseOverrides.Menu,
        ...customOverrides.value.Menu,
      },
    }
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
   */
  const syncThemeAttr = () => {
    const themeValue = isDark.value ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', themeValue)

    // 向后兼容：同时设置 class
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }

  const setMode = async (newMode: ThemeMode) => {
    // 预先创建丝滑过渡的style
    const transitionStyle = document.createElement('style')
    transitionStyle.textContent = `
      /* 添加全局过渡效果 */
      .layout-container :deep(.n-layout .n-layout-scroll-container),
      .layout-sider,
      .n-menu,
      .layout-header,
      .layout-footer,
      .light-theme,
      .dark-theme {
        transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* 减少内容闪烁 */
      .layout-container {
        opacity: 0.95;
        transition: opacity 0.35s ease-in-out;
      }
    `
    document.head.appendChild(transitionStyle)

    // 应用主题前等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 10))

    // 增加透明度过渡
    document
      .querySelector('.layout-container')
      ?.classList.add('theme-transitioning')

    // 设置主题
    mode.value = newMode
    localStorage.setItem(THEME_MODE_KEY, newMode)

    // 同步主题属性
    syncThemeAttr()

    // 确保DOM更新
    await new Promise(resolve => requestAnimationFrame(resolve))

    // 等待过渡完成后清理
    setTimeout(() => {
      // 恢复透明度
      document
        .querySelector('.layout-container')
        ?.classList.remove('theme-transitioning')

      // 移除临时样式
      setTimeout(() => {
        document.head.removeChild(transitionStyle)
      }, 400)
    }, 350)
  }

  const updateThemeOverrides = (overrides: Partial<GlobalThemeOverrides>) => {
    customOverrides.value = {
      ...customOverrides.value,
      ...overrides,
    }
    // 将自定义主题保存到本地存储
    localStorage.setItem(
      THEME_OVERRIDES_KEY,
      JSON.stringify(customOverrides.value)
    )
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
