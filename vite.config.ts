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
import { getLocalPackageInfo } from './src/config/vite/localPackagesAlias.ts'

const ENV_DIR = 'envs'

type LocalPackageInfo = ReturnType<typeof getLocalPackageInfo>

/** 为不同依赖来源选择隔离的 Vite 缓存目录。 */
function getLocalCacheScope(info: LocalPackageInfo): string {
  if (info.enabled) return 'local'
  if (info.machTableMode) return 'table'
  if (info.standaloneMode) return 'components'
  if (info.selectiveMode) {
    return `packages-${info.selectedPackages.join('-') || 'selected'}`
  }
  return 'npm'
}

/** 阻止本地源码 alias 进入生产构建。 */
function assertPublishableDependencies(
  command: 'build' | 'serve',
  info: LocalPackageInfo
): void {
  if (
    command === 'build' &&
    (info.enabled ||
      info.selectiveMode ||
      info.standaloneMode ||
      info.machTableMode)
  ) {
    throw new Error(
      '生产构建禁止启用本地包 alias；请清除 USE_LOCAL_PACKAGES、USE_LOCAL_COMPONENTS 和 USE_LOCAL_MACH_TABLE。'
    )
  }
}

export default defineConfig(
  async ({ mode, command }: { mode: string; command: 'build' | 'serve' }) => {
    const env = loadEnv(mode, ENV_DIR, '')
    const validatedEnv = validateViteEnv(env, mode)
    process.env = { ...process.env, ...env }
    const localPackageInfo = getLocalPackageInfo()
    const localCacheScope = getLocalCacheScope(localPackageInfo)
    assertPublishableDependencies(command, localPackageInfo)
    const consolePlugins =
      process.env.VITE_CONSOLE_BANNER === 'false' ? [] : [viteConsolePlugin]
    const devToolsPlugins =
      process.env.VITE_DEVTOOLS === 'true'
        ? [(await import('vite-plugin-vue-devtools')).default()]
        : []

    return {
      // npm 与各本地源码联调模式使用独立缓存，切换命令不会复用错误产物。
      cacheDir: `node_modules/.vite/${localCacheScope}`,
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
        // 路由级依赖由浏览器按 ESM 直接加载，禁止首次进入新页面时再次发现、
        // 重打依赖并触发整页刷新；CJS 依赖统一维护在下方 include 白名单。
        noDiscovery: true,
        // 仅预构建首屏共享依赖；重量级页面保持路由级按需加载。
        include: [
          'naive-ui',
          'vue-router',
          'pinia',
          '@vueuse/core',
          // nprogress 仅发布 CommonJS 主入口；noDiscovery 模式必须显式预构建，
          // 否则浏览器会把原始文件当 ESM 加载并丢失 default export。
          'nprogress',
          // highlight.js 的 Core 与语言入口同样是 CommonJS。常用语言和插件允许
          // 懒加载的语言必须在 noDiscovery 下完整登记，避免首次打开代码页才报错。
          'highlight.js/lib/core',
          'highlight.js/lib/languages/javascript',
          'highlight.js/lib/languages/typescript',
          'highlight.js/lib/languages/json',
          'highlight.js/lib/languages/xml',
          'highlight.js/lib/languages/css',
          'highlight.js/lib/languages/bash',
          'highlight.js/lib/languages/cpp',
          'highlight.js/lib/languages/c',
          'highlight.js/lib/languages/php',
          'highlight.js/lib/languages/ruby',
          'highlight.js/lib/languages/rust',
          'highlight.js/lib/languages/swift',
          'highlight.js/lib/languages/kotlin',
          'highlight.js/lib/languages/scss',
          'highlight.js/lib/languages/less',
          'highlight.js/lib/languages/sql',
          'highlight.js/lib/languages/dockerfile',
          'highlight.js/lib/languages/powershell',
          'highlight.js/lib/languages/yaml',
          'highlight.js/lib/languages/markdown',
          'highlight.js/lib/languages/java',
          'highlight.js/lib/languages/csharp',
          'highlight.js/lib/languages/go',
          'highlight.js/lib/languages/python',
          // file-utils 主入口提供 ZIP 能力，jszip 是 CommonJS default export。
          'jszip',
          'echarts/core',
          'echarts/charts',
          'echarts/components',
          'echarts/renderers',
          // AntV X6 仍保持页面级按需加载，但其数百个内部模块应预构建为单一依赖产物。
          // 否则开发环境首次进入图编辑器时会产生大量级联 ESM 请求。
          '@antv/x6',
          'axios',
          // 组件库保持 ESM 直出；仅预构建其 CJS 或传递依赖含 CJS 的第三方包，
          // 为深层按需入口补齐 default export 互操作，且不触发组件库整体重优化。
          'leaflet',
          '@robot-admin/naive-ui-components > leaflet',
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
          // MachTable 是独立路由使用的标准 ESM，保持路由级加载，避免为单个
          // 演示页增加开发启动预构建和首次发现后的整页刷新。
          '@agile-team/mach-table',
          '@agile-team/mach-table-vue',
          // ALTCHA 是仅在生产安全模式启用的 ESM 动态能力；不参与启动预构建，
          // 避免默认拼图登录为未启用的验证码支付冷启动成本或触发整页刷新。
          'altcha',
          'altcha/i18n/zh-cn',
          'vue3-puzzle-vcode',
          'driver.js',
          'dompurify',
          // 甘特图依赖体积较大且是标准 ESM，保持页面级按需转换；若由运行时
          // 动态导入触发依赖发现，Vite 会强制整页刷新并中断当前路由。
          '@visactor/vtable',
          '@visactor/vtable-gantt',
        ],
      },

      server: { ...serverConfig, port: validatedEnv.port },
      build: buildConfig,
    }
  }
)
