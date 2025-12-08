/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-31 14:04:47
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-20 16:59:54
 * @FilePath: \Robot_Admin\src\types\modules\plugin.d.ts
 * @Description: 插件模块声明
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// =================== Vue 组件模块声明 ===================
declare module '*.vue' {
  const component: DefineComponent<object, object, unknown>
  export default component
}

// =================== 自定义模块声明 ===================
declare module '@/plugins/naive-ui' {
  export function setupNaiveUI(app: App): void
}

declare module 'naive-ui' {
  interface NAlertSlots {
    action?: () => VNode[]
  }
}

// =================== v-md-editor 模块声明 ===================

declare module '@kangc/v-md-editor' {
  const VMdEditor: any
  export default VMdEditor
}

declare module '@kangc/v-md-editor/lib/preview' {
  const VMdPreview: any
  export default VMdPreview
}

declare module '@kangc/v-md-editor/lib/theme/github.js' {
  const githubTheme: any
  export default githubTheme
}

declare module '@kangc/v-md-editor/lib/style/base-editor.css'
declare module '@kangc/v-md-editor/lib/style/preview.css'
declare module '@kangc/v-md-editor/lib/theme/style/github.css'
