/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-08-06 22:40:02
 * @FilePath: \Robot_Admin\vite.config.ts
 * @Description: 基于 Vite 7 实际特性的优化配置，移除负优化，保留有效优化
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { defineConfig, PluginOption } from 'vite'
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
} from './src/config/vite'

export default defineConfig({
  plugins: [
    viteConsolePlugin,
    Unocss(),
    vue(),
    vueJsx(),
    vueDevTools(),
    Icons({ autoInstall: true }),
    viteAutoImportPlugin,
    viteComponentsPlugin,
    // ⚡ 预加载重量级组件（只预加载实际存在组件文件的路由）
    preloader({
      routes: [
        // 只预加载有实际组件文件的路由路径
        // ❌ 不要添加父路由（如 /dashboard），它们会重定向，没有对应组件
        '/demo/13-calendar', // ✅ 对应 /src/views/demo/13-calendar/index.vue
        '/demo/16-text-editor', // ✅ 对应 /src/views/demo/16-text-editor/index.vue
        '/demo/29-antv-x6-editor', // ✅ 对应 /src/views/demo/29-antv-x6-editor/index.vue
      ],
    }),
    // 可视化分析 vite 打包结果
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
  ],

  resolve: resolveConfig,

  // 简化的依赖优化
  optimizeDeps: {
    // 只包含确实需要强制预构建的核心依赖
    include: [
      'naive-ui', // UI 框架通常需要预构建
    ],
    // 只排除真正有问题的包
    exclude: [
      'pinia-plugin-persistedstate', // 有特殊加载逻辑
    ],
  },

  server: serverConfig,
  build: buildConfig,

  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
