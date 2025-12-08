/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-11-04 13:55:07
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-11-04 14:02:00
 * @FilePath: \Robot_Admin\src\config\vite\heavyPages.ts
 * @Description: 重量级页面配置（预加载 + 预热双向同步）
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * 重量级页面路由列表（单一数据源）
 *
 * 用途：
 * 1. preloader 插件 - 直接使用（生产环境预加载）
 * 2. server.warmup - 映射为文件路径（开发环境预热）
 *
 * 原则：
 * - 只添加加载时间 > 2 秒的页面
 * - 只添加高频访问的页面
 * - 保持 5-10 个即可，不要贪多
 */
export const HEAVY_PAGE_ROUTES = [
  '/demo/13-calendar', // 日历组件（FullCalendar，体积大）
  '/demo/16-text-editor', // 富文本编辑器（WangEditor，体积大）
  '/demo/29-antv-x6-editor', // 流程图编辑器（AntV X6，体积大）
]
