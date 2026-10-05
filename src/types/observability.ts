/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\types\observability.ts
 * @Description: 项目构建分析与匿名使用统计的数据契约
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
export type TelemetryEventType =
  | 'page_view'
  | 'login_success'
  | 'login_failure'
  | 'company_switch'
  | 'feature_action'

export interface TelemetryEvent {
  id: string
  type: TelemetryEventType
  timestamp: number
  session: string
  route: string
  mode: 'mock' | 'remote'
  device: 'desktop' | 'tablet' | 'mobile'
  durationMs?: number
  action?: string
}

export interface UsageSummary {
  schemaVersion: 1
  scope: 'browser' | 'site'
  from: number
  to: number
  updatedAt: number
  totals: {
    views: number
    sessions: number
    loginSuccess: number
    loginFailure: number
    companySwitches: number
    actions: number
  }
  daily: Array<{ date: string; views: number; logins: number }>
  pages: Array<{
    route: string
    views: number
    p50Ms: number | null
    p95Ms: number | null
  }>
  events: Array<{ type: TelemetryEventType; count: number }>
  devices: Array<{ device: TelemetryEvent['device']; count: number }>
}

export interface ProjectMetrics {
  schemaVersion: 1
  generatedAt: string
  version: string
  inventory: {
    vueFiles: number
    components: number
    routes: Array<{ group: string; count: number }>
    routeNames: Array<{ name: string; title: string }>
  }
  build: null | {
    durationMs: number
    initialBytes: number
    initialGzipBytes: number
    entryBytes: number
    preloadBytes: number
    stylesheetBytes: number
    preloadCount: number
    budgetBytes: number
    assets: Array<{
      name: string
      bytes: number
      gzipBytes: number
      initial: boolean
      kind: 'js' | 'css'
    }>
  }
}
