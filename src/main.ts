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
import './utils/plugins/i18n-route.ts' // 🌐 扩展路由翻译

// 键：首屏加载动画必须最先执行，确保极速显示
import { setupLoading } from '@/plugins/loading'

import './assets/css/main.css'
import '@/styles/index.scss'
import '@robot-admin/layout/style' // 布局包完整样式（组件 + 布局）
import '@robot-admin/naive-ui-components/style.css' // 📦 组件库样式
// 🔮 设计风格 CSS（通过 data-design-style 属性自动隔离，互不冲突）
import '@robot-admin/theme/styles/glass-morphism.css'
import '@robot-admin/theme/styles/corporate-minimal.css'
import '@robot-admin/theme/styles/dark-tech.css'
import 'virtual:uno.css'
// vue-flow 样式已移至使用页面按需加载（28-work-flow-editor）
import '@/router/permission'
import App from './App.vue'
import router from './router'
import { setupDirectives } from '@robot-admin/directives' // 👈 直接从包导入
import {
  setupStore,
  setupNaiveUI,
  setupDynamicComponents,
  PassiveScrollPlugin,
  setupHighlight,
  setupMarkdown,
  setupAnalytics,
  setupRequestCore, //  Request Core 插件
  setupLayoutSystem, // 🆕 布局系统插件
  setupFileUtils, // 🆕 文件处理工具包
} from '@/plugins'
// ✅ 移除 app.use(NaiveUIComponents)，由 RobotNaiveUiResolver 按需解析
import { setupGlobalErrorHandler } from '@/utils/errorHandler'

/**
 * @description: 应用启动入口
 * @return {*}
 */
async function bootstrap() {
  // 第零阶段：立即显示加载动画（innerHTML 方式，极速）
  setupLoading()

  // 第一阶段：创建Vue实例
  const app = createApp(App)

  // 关键：全局错误处理必须最先设置，确保捕获所有错误
  setupGlobalErrorHandler(app)

  // 使用去除滚动警告的插件
  app.use(PassiveScrollPlugin)

  // ✅ C_ 组件由 RobotNaiveUiResolver 按需自动解析，无需全局注册

  // 使用路由
  app.use(router)

  // 第二阶段：Vue相关插件（使用统一的插件化配置）
  setupStore(app) // 配置 Pinia（包含持久化插件）
  setupRequestCore(app) // 配置 Request Core（axios + 7 个插件 + CRUD）
  setupLayoutSystem(app) // 🆕 配置布局系统（设置管理 + 主题同步）
  setupNaiveUI(app)
  setupDynamicComponents(app)
  setupHighlight(app)
  setupMarkdown(app) // 🔄 已改为异步懒加载，不阻塞启动
  setupDirectives(app)
  setupFileUtils() // 初始化 file-utils（注入 naive-ui 消息系统）
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
