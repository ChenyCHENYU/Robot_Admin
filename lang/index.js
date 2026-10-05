/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\lang\index.js
 * @Description: vite-auto-i18n-plugin 编译产物所需的全局运行时协议
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { translateKey, initializeLanguage } from '../src/utils/d_i18n'

globalThis.$t = translateKey
globalThis.$changeLang = initializeLanguage
/** 标记不参与翻译的原始文本。 */
globalThis.$$t = value => value
/** 保留插件的深度扫描标记函数。 */
globalThis.$deepScan = value => value
/** 插值匹配同时兼容半角和历史有道翻译的全角花括号。 */
globalThis.$iS = (value, args) =>
  typeof value === 'string' && Array.isArray(args)
    ? value.replace(/\$(?:\{|｛)(\d+)(?:\}|｝)/g, (match, index) =>
        args[Number(index)] !== undefined ? String(args[Number(index)]) : match
      )
    : value

// 编译适配器让所有使用 $t 的模块依赖此入口；先准备语言，再执行模块级文案。
await initializeLanguage()
