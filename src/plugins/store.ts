/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:40:54
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-10
 * @FilePath: \Robot_Admin\src\plugins\store.ts
 * @Description: Pinia Store 插件配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type { App } from 'vue'

/**
 * @description: 创建并配置 Pinia 实例
 * @description: 集成持久化插件，自动保存 store 状态到 localStorage
 * @param {App} app Vue 应用实例
 * @return {void}
 */
export function setupStore(app: App) {
  const pinia = createPinia()

  // 添加持久化插件
  pinia.use(piniaPluginPersistedstate)

  app.use(pinia)
}
