/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-08-09
 * @FilePath: \Robot_Admin\src\config\heavyPages.ts
 * @Description: 重量级页面配置（开发预热 + 登录后的运行时预取）
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/**
 * 重量级页面路由列表（单一数据源）
 *
 * 用途：
 * routePrefetch - 登录后按网络与空闲状态渐进预取
 *
 * 原则：
 * - 只添加加载时间 > 2 秒的页面
 * - 只添加高频访问的页面
 * - 保持 5-10 个即可，不要贪多
 */
export const HEAVY_PAGES = [
  {
    routePath: '/editor/antv-x6-editor',
    viewPath: '/demo/29-antv-x6-editor',
    reason: 'AntV X6（冷启动成本最高）',
    priority: 1,
  },
  {
    routePath: '/plugins/calendar',
    viewPath: '/demo/13-calendar',
    reason: 'FullCalendar',
    priority: 2,
  },
  {
    routePath: '/editor/text-editor',
    viewPath: '/demo/16-text-editor',
    reason: 'WangEditor',
    priority: 2,
  },
  {
    routePath: '/hooks/excel-all',
    viewPath: '/demo/30-excel-all',
    reason: 'Excel',
    priority: 3,
  },
  {
    routePath: '/plugins/v-table-gantt',
    viewPath: '/demo/33-v-table-gantt',
    reason: 'VTable Gantt',
    priority: 3,
  },
  {
    routePath: '/editor/work-flow-editor',
    viewPath: '/demo/28-work-flow-editor',
    reason: 'Vue Flow',
    priority: 3,
  },
] as const

export const HEAVY_PAGE_ROUTES = HEAVY_PAGES.map(page => page.routePath)

/** 开发服务器只预热最高优先级页面，避免用启动速度换取低频页面的偶发收益。 */
export const DEV_WARMUP_FILES = HEAVY_PAGES.filter(
  page => page.priority === 1
).map(page => `./src/views${page.viewPath}/index.vue`)
