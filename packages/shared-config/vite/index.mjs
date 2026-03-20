/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @Description: 共享 Vite 配置工厂函数 — 统一 optimizeDeps / 构建分析 / env 加载
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { defineConfig, loadEnv } from 'vite'

/**
 * Vue 全家桶预构建排除列表
 *
 * @description
 * Vite 8 使用 Rolldown 替代 esbuild 预构建，但 Vue 相关包仍需排除：
 * 预构建会将 Vue 内部模块拆成多个共享 chunk，导致 RefImpl / isFunction
 * 等内部符号跨 chunk 引用断裂。
 */
export const VUE_OPTIMIZE_EXCLUDE = [
  'vue',
  '@vue/shared',
  '@vue/reactivity',
  '@vue/runtime-core',
  '@vue/runtime-dom',
  '@vue/compiler-dom',
  '@vue/compiler-core',
  '@vue/compiler-sfc',
  'pinia-plugin-persistedstate',
]

/**
 * 通用预构建依赖列表
 *
 * @description
 * 大型依赖预构建可显著提升冷启动速度。
 * 各 app 可通过 extraOptimizeInclude 追加自己的依赖。
 */
export const COMMON_OPTIMIZE_INCLUDE = [
  'naive-ui',
  'vue-router',
  'pinia',
  '@vueuse/core',
  'echarts/core',
  'echarts/charts',
  'echarts/components',
  'echarts/renderers',
  '@antv/x6',
  'axios',
]

/**
 * 创建 Vite 配置
 *
 * @description
 * 封装 defineConfig + loadEnv + optimizeDeps + analyzer 的公共逻辑，
 * 各 app 只需传入自己的插件/resolve/server/build 即可。
 *
 * @param {Function|Object} appOptions - 应用级配置（或 (env, command) => config 函数）
 * @param {Array} appOptions.plugins - Vite 插件数组
 * @param {Object} appOptions.resolve - resolve 配置（路径别名）
 * @param {Object} appOptions.server - server 配置（端口 / proxy）
 * @param {Object} appOptions.build - build 配置（分包策略）
 * @param {Array} [appOptions.extraOptimizeInclude] - 额外的 optimizeDeps.include
 */
export function createViteConfig(appOptions) {
  return defineConfig(async ({ mode, command }) => {
    const env = loadEnv(mode, process.cwd(), '')
    process.env = { ...process.env, ...env }

    const options = typeof appOptions === 'function'
      ? appOptions(env, command)
      : appOptions

    return {
      plugins: [
        ...options.plugins,
        // 构建分析（ANALYZE=true 时自动注入）
        ...(process.env.ANALYZE
          ? [
              (await import('rollup-plugin-visualizer')).visualizer({
                filename: 'dist/report.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
              }),
            ]
          : []),
      ].filter(Boolean),

      resolve: options.resolve,

      optimizeDeps: {
        include: [
          ...COMMON_OPTIMIZE_INCLUDE,
          // dev:components 模式下组件库走本地源码，不能预构建
          ...(process.env.USE_LOCAL_COMPONENTS === 'true'
            ? []
            : ['@robot-admin/naive-ui-components']),
          ...(options.extraOptimizeInclude ?? []),
        ],
        exclude: VUE_OPTIMIZE_EXCLUDE,
      },

      server: options.server,
      build: options.build,
    }
  })
}
