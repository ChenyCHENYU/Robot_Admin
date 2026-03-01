/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-17 15:23:35
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-17 16:48:21
 * @FilePath: \Robot_Admin\src\config\vite\viteComponentsConfig.ts
 * @Description: Vite 组件自动导入配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import {
  RobotNaiveUiResolver,
  componentNames,
} from '@robot-admin/naive-ui-components/resolver'
import IconsResolver from 'unplugin-icons/resolver'

/** 已迁移到组件库的组件集合 — fallback resolver 必须跳过 */
const libraryComponents = new Set<string>(componentNames)

export default Components({
  dts: 'src/types/components.d.ts', // 生成类型声明文件
  dirs: ['src/components/local'], // 仅扫描本地组件（C_ 全局组件通过 resolver 解析）
  extensions: ['vue'], // 扩展名
  version: 3, // 明确指定 Vue 3.x 版本
  resolvers: [
    NaiveUiResolver(),
    RobotNaiveUiResolver(),
    componentName => {
      // 已迁移到组件库的 → 由 RobotNaiveUiResolver 处理，此处跳过
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
