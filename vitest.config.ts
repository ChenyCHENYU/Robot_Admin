/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-08
 * @FilePath: \Robot_Admin\vitest.config.ts
 * @Description: 独立组件挂载测试，复用应用自动导入且不启动构建插件
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { createAutoImportConfig } from './src/config/vite/viteAutoImportConfig.ts'

export default defineConfig({
  plugins: [
    vue(),
    createAutoImportConfig(false),
    Components({ dts: false, dirs: [], resolvers: [NaiveUiResolver()] }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['vue'],
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/components/**/*.component.ts'],
    setupFiles: ['tests/components/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
})
