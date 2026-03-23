/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-15 00:17:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-04
 * @FilePath: \Robot_Admin\src\config\vite\viteResolveConfig.ts
 * @Description: Vite 路径解析配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
import { fileURLToPath, URL } from 'node:url'
import { getLocalPackagesAlias } from './localPackagesAlias'

/**
 * Vite resolve 配置
 *
 * @description
 * 配置路径别名和模块解析规则
 *
 * **别名优先级：**
 * 1. 本地包别名（仅在 dev:local 模式启用，包括 monorepo 包和独立本地包）
 * 2. 项目路径别名（@ 和 _views）
 */
export default {
  alias: [
    // 本地包调试别名（仅 dev:local 模式）
    ...getLocalPackagesAlias(),
    // 共享契约层别名
    {
      find: '@shared',
      replacement: fileURLToPath(new URL('../../../shared', import.meta.url)),
    },
    // 项目路径别名
    {
      find: '@',
      replacement: fileURLToPath(new URL('../../../src', import.meta.url)),
    },
    {
      find: '_views',
      replacement: fileURLToPath(
        new URL('../../../src/views', import.meta.url)
      ),
    },
  ],

  // ⚡ 扩展名解析优化
  // .ts 在 .vue 之前：确保目录导入时 index.ts（barrel 文件）优先于 index.vue（SFC）
  // Vue SFC 应始终使用显式 .vue 扩展名导入（Vue 3 最佳实践）
  extensions: ['.ts', '.tsx', '.vue', '.js', '.mjs', '.json'],
}
