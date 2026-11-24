/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 12:16:30
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 14:42:25
 * @FilePath: \Robot_Admin\src\views\demo\25-throttle-direct\data.ts
 * @Description: 节流指令演示页面数据
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

/**
 * * @description Tab 标题映射常量
 */
export const TAB_TITLES = {
  basic: '基础用法',
  config: '配置选项',
  callback: '回调函数',
  dynamic: '动态配置',
  scenarios: '实际应用场景',
} as const

/**
 * * @description 演示配置常量，定义各种延迟时间和参数
 */
export const DEMO_CONFIG = {
  // 节流配置
  DEFAULT_DELAY: 300,
  SLOW_DELAY: 1000,
  LEADING_DELAY: 500,
  TRAILING_DELAY: 600,

  // 动态配置范围
  DELAY_MIN: 100,
  DELAY_MAX: 3000,
  DELAY_STEP: 100,

  // 应用场景延迟
  SEARCH_DELAY: 500,
  LOAD_DELAY: 800,
  LIKE_DELAY: 400,
  SHARE_DELAY: 600,
  DOWNLOAD_DELAY: 1000,
  SEARCH_RESPONSE_DELAY: 800,
  LOAD_RESPONSE_DELAY: 1000,
} as const

export const SEARCH_EXAMPLES = [
  {
    id: 1,
    title: 'Vue 3 节流指令使用指南',
    description: '深入了解 Vue 3 节流指令的使用方法和最佳实践',
  },
  {
    id: 2,
    title: 'JavaScript 节流与防抖详解',
    description: '详细对比节流和防抖的区别，及其在实际项目中的应用',
  },
  {
    id: 3,
    title: '前端性能优化之函数节流',
    description: '使用函数节流技术优化前端应用性能的实践方案',
  },
  {
    id: 4,
    title: 'React 中的节流处理',
    description: '在 React 应用中实现函数节流的多种方案对比',
  },
  {
    id: 5,
    title: '移动端滚动优化实践',
    description: '使用节流技术优化移动端滚动事件的性能表现',
  },
  {
    id: 6,
    title: 'API 请求频率控制',
    description: '通过节流机制控制API请求频率，提升用户体验',
  },
] as const
