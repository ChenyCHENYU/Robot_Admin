/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-09 14:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-04-20
 * @FilePath: \Robot_Admin\src\plugins\analytics.ts
 * @Description: Vercel Analytics 访问统计 + Speed Insights 性能监控
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { App } from 'vue'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'

/**
 * @description: 设置 Vercel Analytics 访问统计 + Speed Insights 性能监控
 * @param {App} app - Vue 应用实例
 * @return {void}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setupAnalytics(app: App<Element>) {
  try {
    // 只在生产环境启用
    if (import.meta.env.PROD) {
      inject()
      injectSpeedInsights()
    }
  } catch (error) {
    console.error('❌ Vercel Analytics 初始化失败:', error)
  }
}
