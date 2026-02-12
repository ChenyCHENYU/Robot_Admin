/**
 * 布局数据桥接层 - Layout Bridge
 *
 * 🎯 目标：将业务 Store 抽象成布局接口，实现布局和业务的解耦
 *
 * � 适配器模式：
 * ```
 * 业务 Stores (项目特定)
 *    ↓ 适配
 * LayoutContext (包标准接口)
 *    ↓ provide/inject
 * @robot-admin/layout 布局骨架 (通用)
 * ```
 */

import type { LayoutContext } from '@robot-admin/layout'
import { s_permissionStore } from '@/stores/permission'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'
import C_Icon from '@/components/global/C_Icon/index.vue'

/**
 * 创建布局桥接数据
 *
 * 🔌 适配器函数：将业务 Store 转换成 @robot-admin/layout 的 LayoutContext 接口
 *
 * @returns {LayoutContext} 布局上下文数据
 */
export function useLayoutBridge(): LayoutContext {
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
    headerHeight: computed(() => settingsStore.headerHeight),
    showFooter: computed(() => settingsStore.showFooter),
    showBreadcrumb: computed(() => settingsStore.showBreadcrumb),
    showBreadcrumbIcon: computed(() => settingsStore.showBreadcrumbIcon),
    showTagsView: computed(() => settingsStore.showTagsView),
    tagsViewHeight: computed(() => settingsStore.tagsViewHeight),
    fixedHeader: computed(() => settingsStore.fixedHeader),
    transitionName: computed(() => settingsStore.transitionName),

    // 品牌配置
    brand: {
      name: 'Robot Admin',
      subtitle: '机器人管理系统',
      logoSrc: '/menu-too-logo.webm',
      logoType: 'video',
      logoSize: 36,
      homePath: '/home',
    },

    // 图标组件 - 用于布局内部渲染菜单图标
    iconComponent: C_Icon,
  }
}
