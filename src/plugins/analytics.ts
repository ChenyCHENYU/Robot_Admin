/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-07-09 14:45:29
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-04-20
 * @FilePath: \Robot_Admin\src\plugins\analytics.ts
 * @Description: Vercel Analytics 访问统计 + Speed Insights 性能监控
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { Router } from 'vue-router'
import { inject, pageview, track } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import { telemetry } from '@/utils/d_telemetry'
import { observabilityConfig } from '@/config/observability'

/**
 * @description: 设置 Vercel Analytics 访问统计 + Speed Insights 性能监控
 * @param {Router} router - 应用路由
 * @return {void}
 */
export function setupAnalytics(router: Router) {
  try {
    // 必须由部署环境显式同意，避免模板默认采集访问数据
    if (observabilityConfig.vercelEnabled) {
      inject({
        disableAutoTrack: true,
        debug: false,
        beforeSend: event => ({
          ...event,
          url:
            new URL(event.url).origin +
            `/${String(router.currentRoute.value.name ?? 'application')}`,
        }),
      })
      injectSpeedInsights()
      // Hash 路由不能依赖 URL pathname 自动统计；使用已脱敏的路由名称。
      const stop = telemetry.subscribe(event => {
        if (!event) return
        if (event.type === 'page_view')
          pageview({ route: event.route, path: `/${event.route}` })
        else
          track(event.type, { mode: event.mode, action: event.action ?? null })
      })
      import.meta.hot?.dispose(stop)
    }
  } catch (error) {
    console.error('❌ Vercel Analytics 初始化失败:', error)
  }
}
