/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 16:11:12
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 16:38:49
 * @FilePath: \Robot_Admin\src\directives\install.ts
 * @Description: 指令安装器
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'

// 指令模块接口
interface DirectiveModule {
  default: any
}

// 自动导入所有指令模块
const directiveModules = import.meta.glob('./modules/*.ts', { eager: true })

/**
 * 安装所有指令的插件函数
 * @param app Vue 应用实例
 */
export function setupDirectives(app: App): void {
  // console.log('🚀 开始安装指令插件...')

  let registeredCount = 0

  Object.entries(directiveModules).forEach(([path, module]) => {
    const directiveName = path.match(/\/([^/]+)\.ts$/)?.[1]
    const directiveModule = module as DirectiveModule

    if (directiveName && directiveModule.default) {
      try {
        // 注册指令，添加 v- 前缀
        app.directive(directiveName, directiveModule.default)
        registeredCount++
        // console.log(`📌 指令注册成功: v-${directiveName}`)
      } catch (error) {
        console.error(`❌ 指令注册失败: v-${directiveName}`, error)
      }
    } else {
      console.warn(`⚠️  指令模块无效: ${path}`)
    }
  })

  console.log(`✅ 指令插件安装完成，共注册 ${registeredCount} 个指令`)
}
