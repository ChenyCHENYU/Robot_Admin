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

export default defineConfig(({ mode, command }: { mode: string; command: string }) => {
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
      // ⚡ preloader 仅在开发环境启用（生产环境 import() 无法加载原始 .vue 源文件）
      ...(command === 'serve'
        ? [
            preloader({
              routes: HEAVY_PAGE_ROUTES,
            }),
          ]
        : []),
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
      // ✅ 预构建大型依赖以提升启动速度
      // dev:components 模式下组件库走本地源码，不能预构建
      include: [
        'naive-ui',
        ...(process.env.USE_LOCAL_COMPONENTS === 'true'
          ? []
          : ['@robot-admin/naive-ui-components']),
        'vue-router',
        'pinia',
        '@vueuse/core',
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        '@antv/x6',
        'axios',
      ],
      // 🔧 排除 Vue 全家桶：esbuild 预构建时会将 Vue 内部模块拆成多个共享 chunk，
      // 导致 RefImpl / isFunction 等内部符号跨 chunk 引用断裂。
      // 生产环境不受影响（用的是 Rollup），仅影响 dev server（用的是 esbuild）。
      // 排除后 Vue 作为原生 ESM 由浏览器直接加载，不经过 esbuild 处理。
      exclude: [
        'vue',
        '@vue/shared',
        '@vue/reactivity',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/compiler-dom',
        '@vue/compiler-core',
        '@vue/compiler-sfc',
        'pinia-plugin-persistedstate',
      ],
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
