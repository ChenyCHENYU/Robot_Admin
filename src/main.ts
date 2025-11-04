/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-10-28
 * @FilePath: \Robot_Admin\src\main.ts
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// ⭐ 关键：首屏加载动画必须最先执行，确保极速显示（soybean-admin 优化方案）
import { setupLoading } from '@/plugins/loading'

import './assets/css/main.css'
import '@/styles/index.scss'
import 'virtual:uno.css'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@/router/permission'
import '@/api/generated/client-config' // 🆕 全局配置 SDK 客户端
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import {
  setupStore,
  setupNaiveUI,
  setupDynamicComponents,
  PassiveScrollPlugin,
  setupHighlight,
  setupMarkdown,
  setupDirectives,
  setupAnalytics,
} from '@/plugins'

/**
 * @description: 应用启动入口
 * @return {*}
 */
async function bootstrap() {
  // ⭐ 第零阶段：立即显示加载动画（innerHTML 方式，极速）
  setupLoading()

  // 第一阶段：创建Vue实例，初始化Pinia
  const app = createApp(App)
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  // 使用去除滚动警告的插件
  app.use(PassiveScrollPlugin)

  // 使用路由
  app.use(router)

  // 第二阶段：Vue相关插件
  setupStore(app)
  setupNaiveUI(app)
  setupDynamicComponents(app)
  setupHighlight(app)
  setupMarkdown(app)
  setupDirectives(app)
  setupAnalytics(app)

  // 第三阶段：等待路由就绪
  await router.isReady()

  // 第四阶段：挂载应用
  app.mount('#app')

  // 注意：移除加载动画的逻辑已移至 App.vue 的 onMounted 中
  // 确保首屏内容真正渲染完成后才移除
}

// 启动应用
bootstrap().catch(error => console.error('应用启动失败:', error))
