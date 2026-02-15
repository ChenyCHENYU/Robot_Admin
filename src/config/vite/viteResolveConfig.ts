/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-15 00:17:15
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-15
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
 * 1. 本地包别名（仅在 dev:local 模式启用）
 * 2. 项目路径别名（@ 和 _views）
 */
export default {
  alias: [
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
    // 本地包调试别名（仅 dev:local 模式）
    ...getLocalPackagesAlias(),
  ],

  // ⚡ 扩展名解析优化（按使用频率排序）
  extensions: ['.vue', '.ts', '.tsx', '.js', '.mjs', '.json'],
}
