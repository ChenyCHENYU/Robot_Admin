/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-06
 * @FilePath: \Robot_Admin\apps\admin-saas\vite.config.ts
 * @Description: admin-saas — 基于 shared-config 工厂的 Vite 配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import preloader from 'vite-plugin-preloader'
import { createViteConfig } from '@robot-admin/shared-config/vite'

import {
  viteConsolePlugin,
  viteAutoImportPlugin,
  viteComponentsPlugin,
  resolveConfig,
  serverConfig,
  buildConfig,
  createI18nPlugin,
  createVuePluginOptions,
} from './src/config/vite'
import { HEAVY_PAGE_ROUTES } from './src/config/vite/heavyPages'

export default createViteConfig((_env, command) => ({
  plugins: [
    viteConsolePlugin,
    Unocss(),
    vue(createVuePluginOptions()),
    vueJsx(),
    ...(process.env.VITE_DEVTOOLS === 'true' ? [vueDevTools()] : []),
    Icons({ autoInstall: true }),
    viteAutoImportPlugin,
    viteComponentsPlugin,
    ...(command === 'serve' ? [preloader({ routes: HEAVY_PAGE_ROUTES })] : []),
    createI18nPlugin(),
  ],
  resolve: resolveConfig,
  server: serverConfig,
  build: buildConfig,
}))
