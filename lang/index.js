/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-05
 * @FilePath: \Robot_Admin\lang\index.js
 * @Description: vite-auto-i18n-plugin 编译产物所需的全局运行时协议
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import { i18n } from '../src/utils/d_i18n'

i18n.installGlobals()

// 编译适配器让所有使用 $t 的模块依赖此入口；先准备语言，再执行模块级文案。
await i18n.initializeLanguage()
