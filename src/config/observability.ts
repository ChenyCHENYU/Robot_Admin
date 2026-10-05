/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-06
 * @FilePath: \Robot_Admin\src\config\observability.ts
 * @Description: 匿名统计的扁平配置，默认只保留本机真实记录
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */
const enabled = import.meta.env.VITE_OBSERVABILITY_ENABLED !== 'false'
export const observabilityConfig = {
  enabled,
  storageKey: 'robot-admin:observability:v1',
  retentionDays: 7,
  maxEvents: 1000,
  collectEndpoint:
    import.meta.env.VITE_TELEMETRY_COLLECT_ENDPOINT?.trim() ?? '',
  summaryEndpoint:
    import.meta.env.VITE_TELEMETRY_SUMMARY_ENDPOINT?.trim() ?? '',
  vercelEnabled:
    enabled &&
    import.meta.env.PROD &&
    import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
}
