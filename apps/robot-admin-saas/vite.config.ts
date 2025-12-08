/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-12-08
 * @FilePath: \Robot_Admin\apps\robot-admin-saas\vite.config.ts
 * @Description: Robot Admin SaaS - Vite 配置（继承根目录基础配置）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { defineConfig, type PluginOption, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import preloader from 'vite-plugin-preloader'

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

// SaaS 版本特定配置
const SAAS_PORT = 1989

export default defineConfig(({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }

  return {
    plugins: [
      viteConsolePlugin,
      Unocss(),
      vue(createVuePluginOptions()),
      vueJsx(),
      ...(process.env.VITE_DEVTOOLS === 'true' ? [vueDevTools()] : []),
      Icons({ autoInstall: true }),
      viteAutoImportPlugin,
      viteComponentsPlugin,
      preloader({
        routes: HEAVY_PAGE_ROUTES,
      }),
      createI18nPlugin(),
      ...(process.env.ANALYZE
        ? [
            visualizer({
              filename: 'dist/report.html',
              open: true,
              gzipSize: true,
              brotliSize: true,
            }) as PluginOption,
          ]
        : []),
    ].filter(Boolean),

    resolve: resolveConfig,

    optimizeDeps: {
      exclude: [
        'pinia-plugin-persistedstate',
        'echarts',
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'date-fns',
        'date-fns-tz',
      ],
    },

    server: {
      ...serverConfig,
      port: SAAS_PORT, // SaaS 版本端口
    },

    build: buildConfig,

    esbuild:
      process.env.NODE_ENV === 'production'
        ? {
            drop: ['console' as const, 'debugger' as const],
          }
        : undefined,
  }
})
