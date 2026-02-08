/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-08 01:22:35
 * @FilePath: \Robot_Admin\src\main.ts
 * @Description: 根入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import '../lang/index.js'
import './utils/plugins/i18n-route.js' // 🌐 扩展路由翻译

// ⭐ 关键：首屏加载动画必须最先执行，确保极速显示（soybean-admin 优化方案）
import { setupLoading } from '@/plugins/loading'

import './assets/css/main.css'
import '@/styles/index.scss'
import 'virtual:uno.css'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@/router/permission'
import '@/api/generated/client-config' // 🆕 全局配置 SDK 客户端
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
  setupRequestCore, // 🆕 Request Core 插件
} from '@/plugins'
import { setupGlobalErrorHandler } from '@/utils/errorHandler'

/**
 * @description: 应用启动入口
 * @return {*}
 */
async function bootstrap() {
  // ⭐ 第零阶段：立即显示加载动画（innerHTML 方式，极速）
  setupLoading()

  // 第一阶段：创建Vue实例
  const app = createApp(App)

  // ⭐ 关键：全局错误处理必须最先设置，确保捕获所有错误
  setupGlobalErrorHandler(app)

  // 使用去除滚动警告的插件
  app.use(PassiveScrollPlugin)

  // 使用路由
  app.use(router)

  // 第二阶段：Vue相关插件（使用统一的插件化配置）
  setupStore(app) // 配置 Pinia（包含持久化插件）
  setupRequestCore(app) // 配置 Request Core（axios + 7 个插件 + CRUD）
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
