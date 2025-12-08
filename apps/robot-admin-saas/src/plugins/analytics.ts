/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-09 14:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-07-09 15:01:12
 * @FilePath: \Robot_Admin\src\plugins\analytics.ts
 * @Description: Vercel Analytics 访问统计插件配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import { inject } from '@vercel/analytics'

/**
 * @description: 设置 Vercel Analytics 访问统计
 * @param {App} app - Vue 应用实例
 * @return {void}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setupAnalytics(app: App<Element>) {
  try {
    // 只在生产环境启用
    if (import.meta.env.PROD) {
      inject()
      console.log('✅ Vercel Analytics 访问统计已启用')
    } else {
      console.log('🔧 Vercel Analytics 开发环境已跳过')
    }
  } catch (error) {
    console.error('❌ Vercel Analytics 初始化失败:', error)
  }
}
