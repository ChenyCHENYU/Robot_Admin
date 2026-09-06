/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-09
 * @Description: 布局系统配置插件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import type { App } from 'vue'
import { setupLayout } from '@robot-admin/layout'
import { useThemeStore } from '@robot-admin/theme'
import { initSettingsStoreSync } from '@/stores/settings'

/**
 * 配置布局系统（包含设置管理）
 * @param app - Vue 应用实例
 */
export function setupLayoutSystem(app: App) {
  // 初始化布局系统；主题模式通过单一回调同步，避免重复 watcher。
  setupLayout(app, {
    onThemeModeChange: async mode => {
      const themeStore = useThemeStore()
      await themeStore.setMode(mode)
    },
    defaults: {
      layoutMode: 'side',
      primaryColor: '#409eff',
      showTagsView: true,
      fixedHeader: true,
    },
  })

  // 初始化 settings store 与 Naive UI 的同步
  initSettingsStoreSync()
}
