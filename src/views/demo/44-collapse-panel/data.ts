/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-02-25 10:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-02-25 10:00:00
 * @FilePath: \Robot_Admin\src\views\demo\44-collapse-panel\data.ts
 * @Description: 折叠面板演示页数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { CollapsePanelItem } from '@robot-admin/naive-ui-components'

/** 基础用法 */
export const basicItems: CollapsePanelItem[] = [
  {
    key: 'info',
    title: '基本信息',
    icon: 'mdi:information-outline',
    content: '这是基本信息面板的内容。折叠面板用于组织和隐藏复杂的内容块。',
  },
  {
    key: 'detail',
    title: '详细设置',
    icon: 'mdi:cog-outline',
    content: '这是详细设置面板的内容。你可以在这里放置表单、配置项等。',
  },
  {
    key: 'advanced',
    title: '高级选项',
    icon: 'mdi:tune',
    subtitle: '谨慎修改',
    content: '这是高级选项面板的内容。通常放置不常用的高级配置项。',
  },
]

/** 手风琴 FAQ */
export const faqItems: CollapsePanelItem[] = [
  {
    key: 'q1',
    title: 'Vue 3 Composition API 有什么优势？',
    icon: 'mdi:frequently-asked-questions',
    content: 'Vue 3 的 Composition API 提供了更灵活的代码组织方式。',
  },
  {
    key: 'q2',
    title: 'Pinia 和 Vuex 有什么区别？',
    icon: 'mdi:frequently-asked-questions',
    content: 'Pinia 是 Vue 官方推荐的状态管理库，TypeScript 支持更好。',
  },
  {
    key: 'q3',
    title: '为什么选择 Vite 而不是 Webpack？',
    icon: 'mdi:frequently-asked-questions',
    content: 'Vite 利用浏览器原生 ES Module 支持实现极速冷启动。',
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
    content: '第一步：创建项目基础架构，配置 ESLint / Prettier / Husky。',
  },
  {
    key: 'step-2',
    title: '步骤二：核心开发',
    icon: 'mdi:numeric-2-circle-outline',
    content: '第二步：实现核心业务模块，包括用户认证、权限管理。',
  },
  {
    key: 'step-3',
    title: '步骤三：测试优化',
    icon: 'mdi:numeric-3-circle-outline',
    content: '第三步：性能优化与测试，懒加载、代码分割、单元测试。',
  },
  {
    key: 'step-4',
    title: '步骤四：部署上线',
    icon: 'mdi:numeric-4-circle-outline',
    content: '第四步：部署上线，CI/CD 流水线配置。',
  },
]

/** 懒渲染 + 持久化 */
export const lazyItems: CollapsePanelItem[] = [
  {
    key: 'lazy-normal',
    title: '默认渲染',
    icon: 'mdi:file-document-outline',
    content: '这个面板内容立即渲染（默认行为）。',
  },
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
  {
    key: 'enabled',
    title: '可操作面板',
    icon: 'mdi:check-circle-outline',
    content: '这个面板可以正常操作。',
  },
  {
    key: 'disabled-item',
    title: '禁用面板（不可展开）',
    icon: 'mdi:lock-outline',
    disabled: true,
    content: '这个内容不会被看到。',
  },
  {
    key: 'also-enabled',
    title: '另一个可操作面板',
    icon: 'mdi:check-circle-outline',
    content: '这个面板也可以正常操作。',
  },
]
