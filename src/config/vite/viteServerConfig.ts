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

export default {
  // 固定 IPv4 回环地址，避免 Windows 上 localhost 在 ::1 / 127.0.0.1
  // 之间切换后，旧页面的动态模块或 HMR 请求偶发 ERR_CONNECTION_REFUSED。
  host: '127.0.0.1',
  port: 1988,
  strictPort: true,
  hmr: { host: '127.0.0.1', overlay: true },
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

  proxy: {
    '^/api': {
      target: 'https://apifoxmock.com/m1/4902805-4559325-default', //代理接口
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  },
}
