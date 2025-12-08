/**
 * 主题配置系统 - Store
 * 管理所有主题和布局相关的配置
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  SettingsState,
  ThemePreset,
  ThemeMode,
  LayoutMode,
  TransitionType,
  BorderRadiusSize,
  TagsViewStyle,
} from './types'
import {
  DEFAULT_SETTINGS,
  BORDER_RADIUS_MAP,
  TRANSITION_MAP,
} from './constants'

/**
 * 调整颜色亮度
 * @param color - 十六进制颜色值
 * @param amount - 调整量，正数变亮，负数变暗
 */
function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export const useSettingsStore = defineStore(
  'settings',
  () => {
    // ============ 状态定义 ============

    // 外观设置
    const themeMode = ref<ThemeMode>(DEFAULT_SETTINGS.themeMode)
    const primaryColor = ref<string>(DEFAULT_SETTINGS.primaryColor)
    const borderRadius = ref<BorderRadiusSize>(DEFAULT_SETTINGS.borderRadius)
    const transitionType = ref<TransitionType>(DEFAULT_SETTINGS.transitionType)
    const enableTransition = ref<boolean>(DEFAULT_SETTINGS.enableTransition)

    // 布局设置
    const layoutMode = ref<LayoutMode>(DEFAULT_SETTINGS.layoutMode)
    const fixedHeader = ref<boolean>(DEFAULT_SETTINGS.fixedHeader)

    // 开发环境：输出当前布局模式，用于调试
    if (import.meta.env.DEV) {
      console.log('[Settings Store] 初始化布局模式:', layoutMode.value)

      // 监听布局模式变化
      watch(layoutMode, (newMode, oldMode) => {
        console.log('[Settings Store] 布局模式变化:', oldMode, '->', newMode)
      })
    }
    const showBreadcrumb = ref<boolean>(DEFAULT_SETTINGS.showBreadcrumb)
    const showBreadcrumbIcon = ref<boolean>(DEFAULT_SETTINGS.showBreadcrumbIcon)
    const showTagsView = ref<boolean>(DEFAULT_SETTINGS.showTagsView)
    const tagsViewHeight = ref<number>(DEFAULT_SETTINGS.tagsViewHeight)
    const tagsViewStyle = ref<TagsViewStyle>(DEFAULT_SETTINGS.tagsViewStyle)
    const showFooter = ref<boolean>(DEFAULT_SETTINGS.showFooter)
    const sidebarWidth = ref<number>(DEFAULT_SETTINGS.sidebarWidth)
    const sidebarCollapsedWidth = ref<number>(
      DEFAULT_SETTINGS.sidebarCollapsedWidth
    )
    const headerHeight = ref<number>(DEFAULT_SETTINGS.headerHeight)

    // 高级设置
    const enableHotkeys = ref<boolean>(DEFAULT_SETTINGS.enableHotkeys)
    const version = ref<string>(DEFAULT_SETTINGS.version)

    // ============ 计算属性 ============

    /** 获取圆角值 */
    const borderRadiusValue = computed(
      () => BORDER_RADIUS_MAP[borderRadius.value]
    )

    /** 获取动画类名 */
    const transitionName = computed(() => {
      // 如果禁用动画，返回空字符串
      if (!enableTransition.value || transitionType.value === 'none') {
        return ''
      }
      return TRANSITION_MAP[transitionType.value]
    })

    /** 是否启用动画 */
    const shouldEnableTransition = computed(
      () => enableTransition.value && transitionType.value !== 'none'
    )

    /** 获取所有配置状态 */
    const settingsState = computed<SettingsState>(() => ({
      themeMode: themeMode.value,
      primaryColor: primaryColor.value,
      borderRadius: borderRadius.value,
      transitionType: transitionType.value,
      enableTransition: enableTransition.value,
      layoutMode: layoutMode.value,
      fixedHeader: fixedHeader.value,
      showBreadcrumb: showBreadcrumb.value,
      showBreadcrumbIcon: showBreadcrumbIcon.value,
      showTagsView: showTagsView.value,
      tagsViewHeight: tagsViewHeight.value,
      tagsViewStyle: tagsViewStyle.value,
      showFooter: showFooter.value,
      sidebarWidth: sidebarWidth.value,
      sidebarCollapsedWidth: sidebarCollapsedWidth.value,
      headerHeight: headerHeight.value,
      enableHotkeys: enableHotkeys.value,
      version: version.value,
    }))

    // ============ 方法 ============

    /**
     * 同步 CSS Variables
     */
    const syncCSSVariables = () => {
      const root = document.documentElement

      // 主题色
      root.style.setProperty('--primary-color', primaryColor.value)

      // 圆角
      root.style.setProperty('--border-radius', borderRadiusValue.value)

      // 尺寸
      root.style.setProperty('--sidebar-width', `${sidebarWidth.value}px`)
      root.style.setProperty(
        '--sidebar-collapsed-width',
        `${sidebarCollapsedWidth.value}px`
      )
      root.style.setProperty('--header-height', `${headerHeight.value}px`)
      root.style.setProperty('--tags-view-height', `${tagsViewHeight.value}px`)
    }

    /**
     * 应用主题预设方案
     */
    const applyPreset = (preset: ThemePreset) => {
      // 应用预设配置
      primaryColor.value = preset.primaryColor
      layoutMode.value = preset.layoutMode

      // 应用其他配置（如果存在）
      if (preset.settings) {
        if (preset.settings.borderRadius)
          borderRadius.value = preset.settings.borderRadius
        if (preset.settings.transitionType)
          transitionType.value = preset.settings.transitionType
        if (preset.settings.showBreadcrumb !== undefined)
          showBreadcrumb.value = preset.settings.showBreadcrumb
        if (preset.settings.showTagsView !== undefined)
          showTagsView.value = preset.settings.showTagsView
        if (preset.settings.tagsViewStyle)
          tagsViewStyle.value = preset.settings.tagsViewStyle
      }
    }

    /**
     * 重置配置
     */
    const resetSettings = () => {
      themeMode.value = DEFAULT_SETTINGS.themeMode
      primaryColor.value = DEFAULT_SETTINGS.primaryColor
      borderRadius.value = DEFAULT_SETTINGS.borderRadius
      transitionType.value = DEFAULT_SETTINGS.transitionType
      enableTransition.value = DEFAULT_SETTINGS.enableTransition

      layoutMode.value = DEFAULT_SETTINGS.layoutMode
      fixedHeader.value = DEFAULT_SETTINGS.fixedHeader
      showBreadcrumb.value = DEFAULT_SETTINGS.showBreadcrumb
      showBreadcrumbIcon.value = DEFAULT_SETTINGS.showBreadcrumbIcon
      showTagsView.value = DEFAULT_SETTINGS.showTagsView
      tagsViewHeight.value = DEFAULT_SETTINGS.tagsViewHeight
      tagsViewStyle.value = DEFAULT_SETTINGS.tagsViewStyle
      showFooter.value = DEFAULT_SETTINGS.showFooter
      sidebarWidth.value = DEFAULT_SETTINGS.sidebarWidth
      sidebarCollapsedWidth.value = DEFAULT_SETTINGS.sidebarCollapsedWidth
      headerHeight.value = DEFAULT_SETTINGS.headerHeight

      enableHotkeys.value = DEFAULT_SETTINGS.enableHotkeys
    }

    // ============ 监听器 ============

    // 监听配置变化，同步 CSS Variables
    watch(
      [
        primaryColor,
        borderRadiusValue,
        sidebarWidth,
        sidebarCollapsedWidth,
        headerHeight,
        tagsViewHeight,
      ],
      () => {
        syncCSSVariables()
      },
      { immediate: true }
    )

    // 监听主题色变化，同步到 Naive UI
    watch(
      primaryColor,
      newColor => {
        const themeStore = useThemeStore()

        // 更新 Naive UI 主题覆盖
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
      borderRadiusValue,
      newRadius => {
        const themeStore = useThemeStore()

        // Naive UI 圆角主要通过 common 全局控制
        // 只需要特殊处理个别组件即可
        themeStore.updateThemeOverrides({
          common: {
            borderRadius: newRadius,
            borderRadiusSmall: newRadius,
            borderRadiusMedium: newRadius,
            borderRadiusLarge: newRadius,
          },
          // 特殊处理：RadioButton 需要单独设置
          Radio: {
            buttonBorderRadius: newRadius,
          },
        })
      },
      { immediate: true }
    )

    // 监听主题模式变化（自动模式处理）
    watch(
      themeMode,
      mode => {
        const themeStore = useThemeStore()

        if (mode === 'auto') {
          // 自动模式：跟随系统
          themeStore.setMode('system')
        } else {
          // 深色/浅色模式
          themeStore.setMode(mode)
        }
      },
      { immediate: true }
    )

    // ============ 返回 ============

    return {
      // 状态
      themeMode,
      primaryColor,
      borderRadius,
      transitionType,
      enableTransition,
      layoutMode,
      fixedHeader,
      showBreadcrumb,
      showBreadcrumbIcon,
      showTagsView,
      tagsViewHeight,
      tagsViewStyle,
      showFooter,
      sidebarWidth,
      sidebarCollapsedWidth,
      headerHeight,
      enableHotkeys,
      version,

      // 计算属性
      borderRadiusValue,
      transitionName,
      shouldEnableTransition,
      settingsState,

      // 方法
      syncCSSVariables,
      applyPreset,
      resetSettings,
    }
  },
  {
    // 使用 pinia-plugin-persistedstate 实现持久化
    // 所有的 ref 状态（包括 layoutMode）都会自动保存到 localStorage
    // 刷新页面后会自动恢复
    persist: {
      key: 'robot-admin-settings',
      storage: localStorage,
    },
  }
)

// 导入 themeStore（避免循环依赖，这里延迟导入）
import { useThemeStore } from '@/stores/theme'
