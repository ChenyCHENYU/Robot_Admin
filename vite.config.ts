/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-05
 * @FilePath: \Robot_Admin\vite.config.ts
 * @Description: 基于 Vite 8 (Rolldown/Oxc) 的优化配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { defineConfig, type PluginOption, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'

import {
  viteConsolePlugin,
  viteAutoImportPlugin,
  viteComponentsPlugin,
  resolveConfig,
  serverConfig,
  buildConfig,
  createI18nPlugin,
  createVuePluginOptions,
} from './src/config/vite/index.ts'
import { validateViteEnv } from './src/config/vite/viteEnvConfig.ts'

const ENV_DIR = 'envs'

export default defineConfig(async ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, ENV_DIR, '')
  const validatedEnv = validateViteEnv(env, mode)
  process.env = { ...process.env, ...env }
  const consolePlugins =
    process.env.VITE_CONSOLE_BANNER === 'false' ? [] : [viteConsolePlugin]
  const devToolsPlugins =
    process.env.VITE_DEVTOOLS === 'true'
      ? [(await import('vite-plugin-vue-devtools')).default()]
      : []

  return {
    plugins: [
      ...consolePlugins,
      Unocss(),
      vue(createVuePluginOptions()),
      ...devToolsPlugins,
      viteAutoImportPlugin,
      viteComponentsPlugin,
      createI18nPlugin(),
      ...(process.env.ANALYZE
        ? [
            (await import('rollup-plugin-visualizer')).visualizer({
              filename: 'dist/report.html',
              open: true,
              gzipSize: true,
              brotliSize: true,
            }) as PluginOption,
          ]
        : []),
    ].filter(Boolean),

    resolve: resolveConfig,
    envDir: ENV_DIR,

    optimizeDeps: {
      // 仅预构建首屏共享依赖；重量级页面保持路由级按需加载。
      include: [
        'naive-ui',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'axios',
        // 组件库保持 ESM 直出；仅预构建其 CJS 或传递依赖含 CJS 的第三方包，
        // 为深层按需入口补齐 default export 互操作，且不触发组件库整体重优化。
        'qrcode',
        '@robot-admin/naive-ui-components > qrcode',
        'spark-md5',
        '@robot-admin/naive-ui-components > spark-md5',
        'html2canvas',
        '@robot-admin/naive-ui-components > html2canvas',
        'jsbarcode',
        '@robot-admin/naive-ui-components > jsbarcode',
        'mammoth',
        '@robot-admin/naive-ui-components > mammoth',
        'xgplayer',
        '@robot-admin/naive-ui-components > xgplayer',
        'xgplayer-hls',
        '@robot-admin/naive-ui-components > xgplayer-hls',
        '@visactor/vutils > eventemitter3',
        'gifuct-js',
        '@visactor/vtable > gifuct-js',
        '@visactor/vrender-kits > gifuct-js',
        'lottie-web',
        '@visactor/vrender-kits > lottie-web',
        'cssfontparser',
        '@visactor/vtable > cssfontparser',
        'lodash/get',
        '@visactor/vtable > lodash/get',
        '@visactor/vdataset',
        '@visactor/vtable > @visactor/vdataset',
      ],
      // 🔧 排除 Vue 全家桶：预构建时会将 Vue 内部模块拆成多个共享 chunk，
      // 导致 RefImpl / isFunction 等内部符号跨 chunk 引用断裂。
      // Vite 8 使用 Rolldown 替代 esbuild 预构建，保留排除以确保稳定性。
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
        // 组件库已发布标准 ESM。排除后深层按需入口不会在登录后被 Vite
        // 重新发现、预构建和强制刷新，从而避免打断 C_Layout 动态导入。
        '@robot-admin/naive-ui-components',
        // 甘特图依赖体积较大且是标准 ESM，保持页面级按需转换；若由运行时
        // 动态导入触发依赖发现，Vite 会强制整页刷新并中断当前路由。
        '@visactor/vtable',
        '@visactor/vtable-gantt',
      ],
    },

    server: { ...serverConfig, port: validatedEnv.port },
    build: buildConfig,
  }
})
