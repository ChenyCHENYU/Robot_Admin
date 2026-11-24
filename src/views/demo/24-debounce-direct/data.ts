/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-26 12:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-26 14:34:56
 * @FilePath: \Robot_Admin\src\views\demo\24-debounce-direct\data.ts
 * @Description: 防抖指令演示页面数据
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
 * * @description 演示配置常量
 */
export const DEMO_CONFIG = {
  // 防抖配置
  DEFAULT_DELAY: 300,
  SLOW_DELAY: 1000,
  IMMEDIATE_DELAY: 500,
  CALLBACK_DELAY: 800,

  // 动态配置范围
  DELAY_MIN: 100,
  DELAY_MAX: 3000,
  DELAY_STEP: 100,

  // 表单提交模拟延迟
  SUBMIT_DELAY: 1000,
  SUBMIT_RESPONSE_DELAY: 1000,
  SUCCESS_DISPLAY_DURATION: 2000,
} as const
