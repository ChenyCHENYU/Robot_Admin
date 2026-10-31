/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-24
 * @FilePath: \Robot_Admin\vite.runtime-regression.config.ts
 * @Description: 隔离实验夹具生产构建，始终使用真实安装的组件包
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: resolve('e2e/fixtures/runtime'),
  publicDir: false,
  plugins: [vue()],
  resolve: { dedupe: ['vue', 'naive-ui'] },
  build: {
    outDir: resolve('node_modules/.cache/runtime-regression'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve('e2e/fixtures/runtime/index.html'),
        dense: resolve('e2e/fixtures/runtime/dense.html'),
      },
    },
  },
})
