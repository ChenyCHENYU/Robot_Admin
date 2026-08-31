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
import { icons as carbonIcons } from '@iconify-json/carbon'
import { icons as icIcons } from '@iconify-json/ic'
import { icons as laIcons } from '@iconify-json/la'
import { icons as mdiIcons } from '@iconify-json/mdi'
import { icons as riIcons } from '@iconify-json/ri'

import { shortcutsArr } from './src/utils/unocss/shortcuts-arr'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        carbon: () => carbonIcons,
        ic: () => icIcons,
        la: () => laIcons,
        mdi: () => mdiIcons,
        ri: () => riIcons,
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  transformers: [transformerDirectives()],
  shortcuts: shortcutsArr,
  content: {
    // 扫描 Vite 管道内的模块（项目自身源码自动覆盖）
    pipeline: {
      include: [/\.(vue|ts|tsx|html)($|\?)/],
    },
    // 扫描文件系统中不经过 Vite 管道的外部包源码
    filesystem: [
      // @robot-admin/layout（本地 link 开发 + node_modules）
      '../robot-admin-packages/packages/layout/src/**/*.{vue,ts}',
      'node_modules/@robot-admin/layout/src/**/*.{vue,ts}',
      // naive-ui-components 已改用 C_Icon (Iconify runtime)，无需扫描
    ],
  },
})
