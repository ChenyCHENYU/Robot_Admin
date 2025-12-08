/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-10-29 08:46:48
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-10-29 09:18:39
 * @FilePath: \Robot_Admin\src\config\keepAliveConfig.ts
 * @Description:  KeepAlive 缓存配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * 🎯 KeepAlive 缓存策略（极简版）
 *
 * 核心原则：明确配置，不做智能猜测
 * - meta.keepAlive === true  -> ✅ 缓存
 * - meta.keepAlive === false -> ❌ 不缓存
 * - meta.keepAlive === undefined -> ❌ 不缓存（默认）
 *
 * 优点：
 * 1. 规则简单清晰，不会产生意外
 * 2. 完全可控，想缓存就配置 true
 * 3. 无需维护复杂的排除规则
 */

/**
 * 最大缓存数量
 * - 建议值：10-30
 * - 每个页面约占 1-5MB 内存
 * - 可根据项目页面复杂度和目标设备性能调整
 */
export const MAX_CACHE_COUNT = 20

/**
 * 开发模式调试配置
 */
export const DEV_CONFIG = {
  // 是否在控制台输出缓存日志
  enableLog: true,

  // 是否暴露缓存管理方法到 window
  exposeToWindow: true,
}

/**
 * 💡 使用示例
 *
 * 1. 在后端返回的路由数据中配置：
 * ```ts
 * {
 *   path: '/home',
 *   name: 'Home',
 *   meta: {
 *     title: '首页',
 *     keepAlive: true  // ✅ 缓存
 *   }
 * }
 *
 * {
 *   path: '/user/form',
 *   name: 'UserForm',
 *   meta: {
 *     title: '用户表单',
 *     keepAlive: false  // ❌ 明确不缓存
 *   }
 * }
 *
 * {
 *   path: '/demo/table',
 *   name: 'DemoTable',
 *   meta: {
 *     title: '表格示例'
 *     // 未配置 keepAlive -> ❌ 默认不缓存
 *   }
 * }
 * ```
 *
 * 2. 开发调试：
 * ```js
 * window.__getCachedViews__()     // 查看当前缓存列表
 * window.__clearCache__()         // 清空所有缓存
 * window.__removeCache__('Home')  // 移除指定页面缓存
 * ```
 */
