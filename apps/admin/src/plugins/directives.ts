/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 17:40:10
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 17:45:29
 * @FilePath: \Robot_Admin\src\plugins\directives.ts
 * @Description: 指令插件配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import { setupDirectives as installDirectives } from '@/directives'

/**
 * 配置指令插件
 * @param app Vue应用实例
 */
export function setupDirectives(app: App): void {
  installDirectives(app)
}
