/**
 * 布局数据桥接层 - Layout Bridge
 *
 * 🎯 目标：将业务 Store 抽象成布局接口，实现布局和业务的解耦
 *
 * 📦 未来迁移计划：
 * - 布局组件（C_Layout/*）：搬到 @robot-admin/layout 包
 * - useLayoutBridge：留在主项目作为"适配器"
 *
 * 🔌 适配器模式：
 * ```
 * 业务 Stores (项目特定)
 *    ↓ 适配
 * LayoutBridgeData (标准接口)
 *    ↓ 使用
 * 布局组件 (通用)
 * ```
 */

import type { ComputedRef } from 'vue'
import { s_permissionStore } from '@/stores/permission'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'

/**
 * 布局桥接数据接口
 * 这是布局组件需要的最小数据集
 */
export interface LayoutBridgeData {
  // ============ 菜单数据 ============
  /** 菜单列表数据（已过滤 isHide 的项） */
  menus: ComputedRef<any[]>

  // ============ 主题状态 ============
  /** 是否为暗色模式 */
  isDark: ComputedRef<boolean>

  // ============ 布局配置 ============
  /** 当前布局模式 */
  layoutMode: ComputedRef<string>

  /** 侧边栏宽度 (px) */
  sidebarWidth: ComputedRef<number>

  /** 侧边栏折叠后宽度 (px) */
  sidebarCollapsedWidth: ComputedRef<number>

  /** 是否显示页脚 */
  showFooter: ComputedRef<boolean>

  /** 是否显示标签页 */
  showTagsView: ComputedRef<boolean>

  /** 标签页高度 (px) */
  tagsViewHeight: ComputedRef<number>

  /** 过渡动画名称 */
  transitionName: ComputedRef<string>
}

/**
 * 创建布局桥接数据
 *
 * 🔌 适配器函数：将业务 Store 转换成布局标准接口
 *
 * @example
 * ```vue
 * <script setup>
 * // ✅ 使用抽象接口（推荐）
 * const layout = useLayoutBridge()
 *
 * // 使用数据
 * const menus = layout.menus.value
 * const isDark = layout.isDark.value
 * </script>
 * ```
 *
 * @returns {LayoutBridgeData} 布局桥接数据
 */
export function useLayoutBridge(): LayoutBridgeData {
  // ============ 获取业务 Stores ============
  const permissionStore = s_permissionStore()
  const themeStore = useThemeStore()
  const settingsStore = useSettingsStore()

  // ============ 数据适配转换 ============
  return {
    // 菜单数据
    menus: computed(() => permissionStore.showMenuListGet),

    // 主题状态
    isDark: computed(() => themeStore.isDark),

    // 布局配置
    layoutMode: computed(() => settingsStore.layoutMode),
    sidebarWidth: computed(() => settingsStore.sidebarWidth),
    sidebarCollapsedWidth: computed(() => settingsStore.sidebarCollapsedWidth),
    showFooter: computed(() => settingsStore.showFooter),
    showTagsView: computed(() => settingsStore.showTagsView),
    tagsViewHeight: computed(() => settingsStore.tagsViewHeight),
    transitionName: computed(() => settingsStore.transitionName),
  }
}

/**
 * 📝 使用说明：
 *
 * 1. 在布局组件中使用：
 * ```typescript
 * const layout = useLayoutBridge()
 *
 * // 访问数据
 * <C_Menu :data="layout.menus.value" />
 * <div v-if="layout.showFooter.value">Footer</div>
 * ```
 *
 * 2. 未来迁移到包时：
 * - 布局组件使用 `props` 接收 LayoutBridgeData
 * - 主项目通过 useLayoutBridge 提供数据
 * - 布局包不依赖任何业务代码 ✓
 */
