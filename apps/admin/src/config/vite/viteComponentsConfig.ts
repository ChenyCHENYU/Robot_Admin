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
import IconsResolver from 'unplugin-icons/resolver'

export default Components({
  dts: 'src/types/components.d.ts', // 生成类型声明文件
  dirs: ['src/components/global', 'src/components/local'], // 自动导入组件
  extensions: ['vue'], // 扩展名
  version: 3, // 明确指定 Vue 3.x 版本
  resolvers: [
    NaiveUiResolver(),
    componentName => {
      if (componentName.startsWith('C_')) {
        return {
          name: componentName.slice(2),
          // 使用别名@绝对路径
          from: `./src/components/global/${componentName}/index.vue`,
        }
      }
      if (componentName.startsWith('c_')) {
        return {
          name: componentName.slice(2),
          from: `./src/components/local/${componentName}/index.vue`,
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
  // 新增 globs 配置进行文件过滤
  globs: [
    'src/components/global/C_*/index.vue', // 匹配目录结构
    'src/components/local/c_*/index.vue',
  ],
  directives: true, // 自动导入指令，默认目录为 src/directives
})
