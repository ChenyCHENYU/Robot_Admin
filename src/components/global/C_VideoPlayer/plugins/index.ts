/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-24 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-24 10:00:00
 * @FilePath: \Robot_Admin\src\components\global\C_VideoPlayer\plugins\index.ts
 * @Description: plugins 统一导出
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

export {
  loadHlsPlayer,
  mergeHlsConfig,
  DEFAULT_HLS_CONFIG,
} from './hls-adapter'
export type { HlsAdapterOptions } from './hls-adapter'

export {
  loadDashPlayer,
  mergeDashConfig,
  DEFAULT_DASH_CONFIG,
} from './dash-adapter'
export type { DashAdapterOptions } from './dash-adapter'

export { createAnalyticsPlugin } from './analytics-reporter'
