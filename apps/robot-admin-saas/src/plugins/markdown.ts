/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-20 16:10:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-18 14:36:25
 * @FilePath: \Robot_Admin\src\plugins\markdown.ts
 * @Description: Markdown 编辑器插件配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import VMdEditor from '@kangc/v-md-editor'
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'

// 代码高亮
import hljs from 'highlight.js'

/**
 * @description: 设置 Markdown 编辑器
 * @param {App} app - Vue 应用实例
 * @return {void}
 */
export function setupMarkdown(app: App<Element>) {
  try {
    // 配置编辑器主题
    VMdEditor.use(githubTheme, {
      Hljs: hljs,
    })

    // 注册编辑器组件
    app.use(VMdEditor)

    // 注册预览组件（只用一种方式即可）
    app.use(VMdPreview)
  } catch (error) {
    console.error('❌ Markdown 组件注册失败:', error)
  }
}
