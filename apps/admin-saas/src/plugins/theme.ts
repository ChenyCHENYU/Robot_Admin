/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-09-08
 * @FilePath: \Robot_Admin\src\plugins\theme.ts
 * @Description: 应用级主题生命周期初始化
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import { s_themeStore } from '@/stores/theme'

/**
 * * @description: 在 Pinia 和布局系统就绪后初始化主题，并注册应用卸载清理。
 * ? @param {App} app Vue 应用实例
 * ! @return {void}
 */
export function setupThemeSystem(app: App): void {
  const themeStore = s_themeStore()
  themeStore.init()

  // 首屏脚本写入的临时背景色到此已由正式主题 CSS 接管。
  if (typeof document !== 'undefined') {
    document.documentElement.style.removeProperty('background')
    document.documentElement.style.removeProperty('background-color')
  }

  app.onUnmount(() => themeStore.destroy())
  import.meta.hot?.dispose(() => themeStore.destroy())
}
