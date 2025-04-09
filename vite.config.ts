/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-03-30 17:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-04-09 17:10:36
 * @FilePath: \bun_vite_uno_naive\vite.config.ts
 * @Description: vite 配置文件，团队协作中莫要乱改乱动，修改前记得通知维护者。
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@vueuse/core': ['useMouse', 'useLocalStorage'],
        },
      ],
      dts: 'types/auto-imports.d.ts', // 生成类型声明文件
      dirs: ['src/stores', 'src/composables', 'src/hooks'], // 自动导入自定义组合式函数
      vueTemplate: true, // 支持模板自动导入
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
