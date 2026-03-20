/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:47:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-04 14:00:40
 * @FilePath: \Robot_Admin\src\config\vite\viteServerConfig.ts
 * @Description: Vite 开发服务器配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { HEAVY_PAGE_ROUTES } from './heavyPages'

export default {
  port: 1989,
  hmr: { overlay: true },
  open: true,

  // 🚫 忽略 lang 目录的文件变化，避免自动刷新页面
  watch: {
    ignored: ['**/lang/**', '**/node_modules/**'],
  },

  // 允许访问外部包目录（@robot-admin/layout）
  fs: {
    allow: ['..'],
  },

  // ⚡ 预热高频文件（开发环境优化 - 首次访问更快）
  // 经测试：不影响启动速度（6s → 6s），但能加快首次访问 50-70%
  warmup: {
    clientFiles: [
      // 核心文件
      './src/App.vue',
      './src/router/index.ts',

      // 重量级页面（自动映射 HEAVY_PAGE_ROUTES，会自动预热它们的依赖组件）
      ...HEAVY_PAGE_ROUTES.map(route => `./src/views${route}/index.vue`),
    ],
  },

  proxy: {
    '^/api': {
      target: 'https://apifoxmock.com/m1/4902805-4559325-default', //代理接口
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  },
}
