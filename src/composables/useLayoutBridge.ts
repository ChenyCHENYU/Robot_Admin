/**
 * 布局数据桥接层 - Layout Bridge
 *
 * 🎯 目标：将业务 Store 抽象成布局接口，实现布局和业务的解耦
 *
 * 🔌 适配器模式：
 * ```
 * 业务 Stores (项目特定)
 *    ↓ 适配
 * LayoutContext (包标准接口)
 *    ↓ provide/inject
 * @robot-admin/layout 布局骨架 (通用)
 * ```
 */

import { provideLayout, type LayoutContext } from '@robot-admin/layout/naive'
import { s_permissionStore } from '@/stores/permission'
import { s_themeStore } from '@/stores/theme'
import { s_settingsStore } from '@/stores/settings'
import { C_Icon } from '@robot-admin/naive-ui-components/C_Icon'

/**
 * 创建并提供布局桥接数据
 *
 * 🔌 适配器函数：将业务 Store 转换成 @robot-admin/layout 的 LayoutContext 接口
 *
 * @returns {LayoutContext} 布局上下文数据
 */
export function useLayoutBridge(): LayoutContext {
  // ============ 获取业务 Stores ============
  const permissionStore = s_permissionStore()
  const themeStore = s_themeStore()
  const settingsStore = s_settingsStore()

  // 包负责桥接标准设置字段，宿主只提供业务数据和品牌能力。
  return provideLayout({
    settings: settingsStore,
    menus: () => permissionStore.showMenuListGet,
    isDark: () => themeStore.isDark,
    brand: {
      name: 'Robot Admin',
      subtitle: '机器人管理系统',
      logoSrc: '/menu-too-logo.webm',
      logoType: 'video',
      logoSize: 36,
      homePath: '/home',
    },
    iconComponent: C_Icon,
  })
}
