/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-05
 * @FilePath: \Robot_Admin\vite.config.ts
 * @Description: 基于 Vite 7 实际特性的优化配置，移除负优化，保留有效优化
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
import federation from '@originjs/vite-plugin-federation'

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

export default defineConfig(({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }

  return {
    base: '/',
    plugins: [
      viteConsolePlugin,
      Unocss(),
      vue(createVuePluginOptions()),
      vueJsx(),
      ...(process.env.VITE_DEVTOOLS === 'true' ? [vueDevTools()] : []),
      Icons({ autoInstall: true }),
      viteAutoImportPlugin,
      viteComponentsPlugin,
      // 🔧 只在开发环境启用 preloader
      ...(mode === 'development'
        ? [
            preloader({
              routes: HEAVY_PAGE_ROUTES,
            }),
          ]
        : []),
      createI18nPlugin(),
      // 🆕 Module Federation 配置
      federation({
        name: 'robotAdmin',
        filename: 'remoteEntry.js',
        // 暴露组件给其他项目使用
        exposes: {
          './Table': './src/components/global/C_Table/index.vue',
          './Form': './src/components/global/C_Form/index.vue',
          './Tree': './src/components/global/C_Tree/index.vue',
          './Icon': './src/components/global/C_Icon/index.vue',
          './Editor': './src/components/global/C_Editor/index.vue',
        },
        // 引用其他项目的模块（未来添加）
        remotes: {},
        // 共享依赖
        shared: {
          vue: {
            singleton: true,
            requiredVersion: '^3.0.0',
          },
          'vue-router': {
            singleton: true,
          },
          pinia: {
            singleton: true,
          },
        },
      }),
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
      // ✅ 预构建大型依赖以提升启动速度
      include: [
        'naive-ui',
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        '@antv/x6',
        'driver.js',
        'axios',
      ],
      exclude: ['pinia-plugin-persistedstate'],
    },

    server: serverConfig,
    build: buildConfig,

    esbuild:
      process.env.NODE_ENV === 'production'
        ? {
            drop: ['console' as const, 'debugger' as const],
          }
        : undefined,
  }
})
