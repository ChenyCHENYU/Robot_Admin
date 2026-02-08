/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-05-12 22:40:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-08 10:00:00
 * @FilePath: \Robot_Admin\src\plugins\index.ts
 * @Description: 插件入口文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
export * from './loading'
export * from './store'
export * from './naive-ui-plugin'
export * from './dynamic-components'
export * from './passive-scroll'
export * from './markdown'
export * from './directives'
export * from './analytics'
export * from './request-core' // 🆕 Request Core 插件
export * from './layout' // 🆕 布局系统插件

export {
  setupHighlight,
  useHighlight,
  defaultHighlightOptions,
  type HighlightPluginOptions,
} from './highlight'
