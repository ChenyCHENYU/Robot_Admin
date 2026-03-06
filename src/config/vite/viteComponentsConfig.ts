/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:23:35
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-17 16:48:21
 * @FilePath: \Robot_Admin\src\config\vite\viteComponentsConfig.ts
 * @Description: Vite 组件自动导入配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import { resolve } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import {
  RobotNaiveUiResolver,
  componentNames,
} from '@robot-admin/naive-ui-components/resolver'
import IconsResolver from 'unplugin-icons/resolver'

const PKG = '@robot-admin/naive-ui-components'

const isLocalMode =
  process.env.USE_LOCAL_COMPONENTS === 'true' ||
  process.env.USE_LOCAL_PACKAGES === 'true'

/**
 * 优先扫描本地组件目录（源码最新，npm 版本可能滞后于本地构建）。
 * 本地目录不存在时（CI/纯 npm 环境）回退到已安装包的 componentNames。
 * 无论哪种模式均保持 libraryComponents 与实际组件集同步。
 */
const libraryComponentNames: readonly string[] = (() => {
  const dir = resolve(process.cwd(), '../naive-ui-components/src/components')
  if (existsSync(dir)) {
    return readdirSync(dir).filter(
      n => n.startsWith('C_') && !n.startsWith('_')
    )
  }
  return componentNames
})()

/** 已迁移到组件库的组件集合 — fallback resolver 必须跳过 */
const libraryComponents = new Set<string>(libraryComponentNames)

export default Components({
  dts: 'src/types/components.d.ts', // 生成类型声明文件
  dirs: ['src/components/local'], // 仅扫描本地组件（C_ 全局组件通过 resolver 解析）
  extensions: ['vue'], // 扩展名
  version: 3, // 明确指定 Vue 3.x 版本
  resolvers: [
    NaiveUiResolver(),
    // dev:local: 用目录扫描的全量组件名构建 resolver（不受 npm 版本滞后影响）
    // 正式模式: 使用已发布的 RobotNaiveUiResolver
    isLocalMode
      ? (name: string) =>
          libraryComponents.has(name) ? { name, from: PKG } : undefined
      : RobotNaiveUiResolver(),
    componentName => {
      // 已迁移到组件库的 → 由上方 resolver 处理，此处跳过
      if (libraryComponents.has(componentName)) return null
      // 未迁移的 C_ 组件（布局/业务组件）→ 继续从本地解析
      if (componentName.startsWith('C_')) {
        return {
          name: 'default',
          from: `@/components/global/${componentName}/index.vue`,
        }
      }
      if (componentName.startsWith('c_')) {
        return {
          name: 'default',
          from: `@/components/local/${componentName}/index.vue`,
        }
      }
      return null
    },
    IconsResolver({
      prefix: 'icon',
    }),
    componentName => {
      if (componentName === 'Icon') {
        return {
          name: 'Icon',
          from: '@iconify/vue',
        }
      }
    },
  ],
  directives: true, // 自动导入指令，默认目录为 src/directives
})
