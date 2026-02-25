/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\44-collapse-panel\data.ts
 * @Description: 折叠面板演示页数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { CollapsePanelItem } from '@/types/modules/collapse-panel'

/** 基础用法 */
export const basicItems: CollapsePanelItem[] = [
  { key: 'info', title: '基本信息', icon: 'mdi:information-outline' },
  { key: 'detail', title: '详细设置', icon: 'mdi:cog-outline' },
  {
    key: 'advanced',
    title: '高级选项',
    icon: 'mdi:tune',
    subtitle: '谨慎修改',
  },
]

/** 手风琴 FAQ */
export const faqItems: CollapsePanelItem[] = [
  {
    key: 'q1',
    title: 'Vue 3 Composition API 有什么优势？',
    icon: 'mdi:frequently-asked-questions',
  },
  {
    key: 'q2',
    title: 'Pinia 和 Vuex 有什么区别？',
    icon: 'mdi:frequently-asked-questions',
  },
  {
    key: 'q3',
    title: '为什么选择 Vite 而不是 Webpack？',
    icon: 'mdi:frequently-asked-questions',
  },
]

/** 卡片变体 */
export const cardItems: CollapsePanelItem[] = [
  { key: 'overview', title: '数据概览', icon: 'mdi:chart-box-outline' },
  { key: 'chart', title: '趋势图表', icon: 'mdi:chart-line' },
  { key: 'recent', title: '最近活动', icon: 'mdi:history' },
]

/** 幽灵变体 */
export const ghostItems: CollapsePanelItem[] = [
  { key: 'filter-status', title: '状态筛选', icon: 'mdi:filter-outline' },
  { key: 'filter-date', title: '时间范围', icon: 'mdi:calendar-range' },
  { key: 'filter-category', title: '分类筛选', icon: 'mdi:tag-outline' },
]

/** 图标右侧 + Extra */
export const iconRightItems: CollapsePanelItem[] = [
  { key: 'user', title: '用户信息', icon: 'mdi:account-outline' },
  { key: 'permission', title: '权限配置', icon: 'mdi:shield-key-outline' },
]

/** 编程控制步骤 */
export const stepItems: CollapsePanelItem[] = [
  {
    key: 'step-1',
    title: '步骤一：项目初始化',
    icon: 'mdi:numeric-1-circle-outline',
  },
  {
    key: 'step-2',
    title: '步骤二：核心开发',
    icon: 'mdi:numeric-2-circle-outline',
  },
  {
    key: 'step-3',
    title: '步骤三：测试优化',
    icon: 'mdi:numeric-3-circle-outline',
  },
  {
    key: 'step-4',
    title: '步骤四：部署上线',
    icon: 'mdi:numeric-4-circle-outline',
  },
]

/** 懒渲染 + 持久化 */
export const lazyItems: CollapsePanelItem[] = [
  { key: 'lazy-normal', title: '默认渲染', icon: 'mdi:file-document-outline' },
  {
    key: 'lazy-deferred',
    title: '懒渲染面板',
    icon: 'mdi:flash-outline',
    lazy: true,
  },
  {
    key: 'lazy-destroy',
    title: '折叠后销毁',
    icon: 'mdi:recycle',
    destroyOnCollapse: true,
  },
]

/** 禁用面板 */
export const disabledItems: CollapsePanelItem[] = [
  { key: 'enabled', title: '可操作面板', icon: 'mdi:check-circle-outline' },
  {
    key: 'disabled-item',
    title: '禁用面板（不可展开）',
    icon: 'mdi:lock-outline',
    disabled: true,
  },
  {
    key: 'also-enabled',
    title: '另一个可操作面板',
    icon: 'mdi:check-circle-outline',
  },
]
