/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\router\routePrefetchPolicy.ts
 * @Description: 重量级路由预取的网络策略
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export interface NetworkInformationLike {
  effectiveType?: string
  saveData?: boolean
}

/**
 * 省流量或慢速网络下不主动下载大型页面，避免优化反而抢占关键请求。
 */
export const shouldPrefetchHeavyRoutes = (
  connection?: NetworkInformationLike
): boolean => {
  if (connection?.saveData) return false
  return !['slow-2g', '2g'].includes(connection?.effectiveType ?? '')
}
