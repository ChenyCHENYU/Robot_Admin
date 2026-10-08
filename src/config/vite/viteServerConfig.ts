/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:47:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-04 14:00:40
 * @FilePath: \Robot_Admin\src\config\vite\viteServerConfig.ts
 * @Description: Vite 开发服务器配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { resolve } from 'node:path'
import type { ServerOptions } from 'vite'
import { DEV_WARMUP_FILES } from '../heavyPages.ts'
import { getLocalPackageInfo } from './localPackagesAlias.ts'

const localPackageInfo = getLocalPackageInfo()
const useLocalMonorepoRoots =
  localPackageInfo.enabled ||
  localPackageInfo.selectiveMode ||
  localPackageInfo.standaloneMode
const localPackageRoots = [
  ...(useLocalMonorepoRoots
    ? [
        resolve(process.cwd(), '../robot-admin-packages'),
        resolve(process.cwd(), '../naive-ui-components'),
      ]
    : []),
  ...(localPackageInfo.machTableMode ? [localPackageInfo.machTableRoot] : []),
]

/** 未配置时不代理；后端联调地址只在 Vite 服务端读取。 */
export default function createServerConfig(apiProxyTarget = ''): ServerOptions {
  const target = apiProxyTarget.trim()
  if (target) {
    const url = new URL(target)
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error(
        'API_PROXY_TARGET 必须是无凭据、查询或片段的 HTTP(S) 地址'
      )
    }
  }
  return {
    // 默认仅 localhost；dev:ip 一键开放局域网，启动横幅自动显示两个实际地址。
    host: 'localhost',
    port: 1988,
    strictPort: true,
    // 让热更新跟随页面访问地址，兼容 localhost、IPv4 与实际局域网 IP。
    hmr: { overlay: true },
    open: false,

    // 仅使用 Vite 原生 warmup 预转换冷启动最重的页面；运行时仍保持路由级按需加载。
    warmup: {
      clientFiles: DEV_WARMUP_FILES,
    },

    // 🚫 忽略 lang 目录的文件变化，避免自动刷新页面
    watch: {
      ignored: ['**/lang/**', '**/node_modules/**'],
    },

    // 仅允许当前联调命令声明的外部源码仓库。
    fs: {
      strict: true,
      allow: [resolve(process.cwd()), ...localPackageRoots],
    },

    proxy: target
      ? {
          '^/api': {
            target,
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api/, ''),
          },
        }
      : undefined,
  }
}
