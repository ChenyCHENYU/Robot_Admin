/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-10-29
 * @FilePath: \Robot_Admin\src\views\production-sales\sales-orders\icons.ts
 * @Description: 工作台24×24几何图标，通过C_Icon原生SVG通道随路由加载
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 页内装饰资源，不注册全局图标，不增加首屏UnoCSS或网络请求。 */
export const WORKBENCH_ICONS = {
  orders:
    'M3 5h2v2H3V5m5 0h13v2H8V5M3 11h2v2H3v-2m5 0h13v2H8v-2M3 17h2v2H3v-2m5 0h13v2H8v-2Z',
  document:
    'M5 2h9l5 5v15H5V2m2 2v16h10V8h-4V4H7m8 1v1h1l-1-1M9 11h6v2H9v-2m0 4h6v2H9v-2Z',
  save: 'M3 3h14l4 4v14H3V3m2 2v14h14V8l-3-3H5m2-2h9v7H7V3m2 2v3h5V5H9M7 13h10v8H7v-8m2 2v4h6v-4H9Z',
  restore: 'M4 4v6h6V8H7a6 6 0 1 1-1 6H4a8 8 0 1 0 2-8V4H4Z',
  batch: 'M3 4h14v2H3V4m0 5h11v2H3V9m0 5h7v2H3v-2m10 4 7-7 2 2-7 7h-2v-2Z',
} as const
