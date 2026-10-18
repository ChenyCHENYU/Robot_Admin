/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-19 12:30:00
 * @FilePath: \Robot_Admin\src\plugins\highlight.ts
 * @Description: 复用组件库的应用级代码高亮，语言缓存按应用隔离
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { HighlightPluginOptions } from '@robot-admin/naive-ui-components'

export {
  createHighlight as initializeHighlight,
  useHighlight,
  setupHighlight,
} from '@robot-admin/naive-ui-components'
export type {
  HighlightAPI,
  HighlightPluginOptions,
} from '@robot-admin/naive-ui-components'

// 与 C_Code 的公开注入协议一致，不再维护第二份管理器。
export const HIGHLIGHT_MANAGER_KEY = 'highlightManager'

export const defaultHighlightOptions: HighlightPluginOptions = {
  autoDetect: false,
  extraLanguages: [],
}
