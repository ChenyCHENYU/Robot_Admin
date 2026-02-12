/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-04-18 10:03:23
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-03 17:45:03
 * @FilePath: \Robot_Admin\unocss.config.ts
 * @Description: unocss 主配置文件
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
} from 'unocss'

import { iconSafelist } from './src/utils/unocss/icon-safelist'
import { shortcutsArr } from './src/utils/unocss/shortcuts-arr'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives()],
  shortcuts: shortcutsArr,
  safelist: iconSafelist,

  // 扫描 @robot-admin/layout 包源码中的 UnoCSS 类名（图标、工具类等）
  content: {
    pipeline: {
      include: [
        /\.(vue|ts|tsx|html)($|\?)/,
        // 本地 link 开发时
        '../robot-admin-packages/packages/layout/src/**/*.{vue,ts}',
        // 发布安装后（node_modules 中）
        'node_modules/@robot-admin/layout/src/**/*.{vue,ts}',
      ],
    },
  },
})
