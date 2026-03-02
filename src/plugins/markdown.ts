/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-20 16:10:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-02 18:30:00
 * @FilePath: \Robot_Admin\src\plugins\markdown.ts
 * @Description: Markdown 编辑器插件配置（异步懒加载，减少主包体积）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'

/** 标记是否已注册，避免重复加载 */
let isRegistered = false

/**
 * @description: 设置 Markdown 编辑器（异步懒加载）
 * @param {App} app - Vue 应用实例
 * @return {void}
 */
export function setupMarkdown(app: App<Element>) {
  // 异步加载，不阻塞应用启动，用户导航到 Markdown 页面前完成注册
  loadMarkdownPlugins(app)
}

/**
 * @description: 异步加载 Markdown 编辑器相关模块
 * @param {App} app - Vue 应用实例
 */
async function loadMarkdownPlugins(app: App<Element>) {
  if (isRegistered) return

  try {
    const [
      { default: VMdEditor },
      { default: VMdPreview },
      { default: githubTheme },
      hljs,
    ] = await Promise.all([
      import('@kangc/v-md-editor'),
      import('@kangc/v-md-editor/lib/preview'),
      import('@kangc/v-md-editor/lib/theme/github.js'),
      import('highlight.js'),
    ])

    // 并行加载 CSS
    await Promise.all([
      import('@kangc/v-md-editor/lib/style/base-editor.css'),
      import('@kangc/v-md-editor/lib/style/preview.css'),
      import('@kangc/v-md-editor/lib/theme/style/github.css'),
    ])

    // 配置编辑器主题
    VMdEditor.use(githubTheme, {
      Hljs: hljs.default || hljs,
    })

    // 注册编辑器组件
    app.use(VMdEditor)
    app.use(VMdPreview)

    isRegistered = true
  } catch (error) {
    console.error('❌ Markdown 组件异步加载失败:', error)
  }
}
