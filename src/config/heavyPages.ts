/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\config\heavyPages.ts
 * @Description: 重量级页面配置（开发预热 + 生产运行时预取）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * 重量级页面路由列表（单一数据源）
 *
 * 用途：
 * 1. preloader 插件 / server.warmup - 开发环境预热
 * 2. routePrefetch - 生产环境登录后按网络与空闲状态渐进预取
 *
 * 原则：
 * - 只添加加载时间 > 2 秒的页面
 * - 只添加高频访问的页面
 * - 保持 5-10 个即可，不要贪多
 */
export const HEAVY_PAGE_ROUTES = [
  '/demo/13-calendar', // 日历组件（FullCalendar）
  '/demo/16-text-editor', // 富文本编辑器（WangEditor）
  '/demo/29-antv-x6-editor', // 流程图编辑器（AntV X6）
  '/demo/30-excel-all', // Excel 导入导出（xlsx）
  '/demo/33-v-table-gantt', // 甘特图（VTable Gantt）
  '/demo/28-work-flow-editor', // 工作流编辑器（Vue Flow）
] as const
