/**
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-05
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-05
 * @FilePath: \Robot_Admin\src\views\demo\50-timeline\data.ts
 * @Description: 时间线组件演示数据
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

import type { TimelineItem } from '@/components/global/C_Timeline/types'

// ==================== 演示数据 ====================

/** 项目发布时间线 */
export const PROJECT_TIMELINE: TimelineItem[] = [
  {
    id: 1,
    title: 'v3.0 正式发布',
    content:
      '全新架构重构完成，采用 Vue 3.5 + Vite 7 + TypeScript 5.8 技术栈，包含 <b>48 个组件</b> 和 <b>12 个工具包</b>。',
    time: '2026-03-01 10:00',
    icon: 'mdi:rocket-launch',
    status: 'success',
    collapsible: true,
    defaultExpanded: true,
    tags: [
      { text: '里程碑', type: 'success' },
      { text: 'Major', type: 'info' },
    ],
  },
  {
    id: 2,
    title: 'RC 候选版本',
    content:
      '修复 23 个 Issue，优化构建体积 <b>减少 38%</b>，完成全量 E2E 测试覆盖。',
    time: '2026-02-20 14:30',
    icon: 'mdi:shield-check',
    status: 'info',
    collapsible: true,
    defaultExpanded: false,
    tags: [{ text: 'Pre-release', type: 'warning' }],
  },
  {
    id: 3,
    title: 'Beta 公测',
    content: '开放社区试用，收集反馈 150+ 条，重点优化了暗色主题和移动端适配。',
    time: '2026-02-01 09:00',
    icon: 'mdi:flask-outline',
    status: 'warning',
    collapsible: true,
  },
  {
    id: 4,
    title: 'Alpha 内测',
    content: '核心功能开发完成，内部团队开始使用并反馈。',
    time: '2026-01-15 16:00',
    icon: 'mdi:code-braces',
    status: 'default',
  },
  {
    id: 5,
    title: '项目立项',
    content: '确认技术方案，组建核心团队 5 人，规划 12 周迭代计划。',
    time: '2025-12-01 10:00',
    icon: 'mdi:flag-checkered',
    status: 'default',
  },
]

/** CI/CD 流水线时间线 */
export const CI_PIPELINE_TIMELINE: TimelineItem[] = [
  {
    id: 'ci-1',
    title: '代码检出',
    time: '00:03',
    icon: 'mdi:source-branch',
    status: 'success',
  },
  {
    id: 'ci-2',
    title: '依赖安装',
    time: '00:45',
    icon: 'mdi:package-variant-closed',
    status: 'success',
  },
  {
    id: 'ci-3',
    title: 'Lint & 类型检查',
    time: '00:22',
    icon: 'mdi:file-search-outline',
    status: 'success',
  },
  {
    id: 'ci-4',
    title: '单元测试',
    time: '01:15',
    icon: 'mdi:test-tube',
    status: 'success',
  },
  {
    id: 'ci-5',
    title: '构建',
    time: '00:55',
    icon: 'mdi:hammer-wrench',
    status: 'warning',
    content: '构建完成，Bundle size: 1.2MB（警告阈值 1MB）',
  },
  {
    id: 'ci-6',
    title: '部署',
    time: '运行中',
    icon: 'mdi:cloud-upload-outline',
    status: 'info',
  },
]

/** 订单物流时间线 */
export const ORDER_TIMELINE: TimelineItem[] = [
  {
    id: 'o-1',
    title: '订单已签收',
    content: '您的快递已由本人签收',
    time: '03-05 14:30',
    status: 'success',
  },
  {
    id: 'o-2',
    title: '正在派送中',
    content: '快递员张三正在为您派送',
    time: '03-05 09:15',
    status: 'info',
  },
  {
    id: 'o-3',
    title: '到达配送站',
    content: '已到达【北京朝阳营业部】',
    time: '03-05 07:00',
    status: 'default',
  },
  {
    id: 'o-4',
    title: '运输中',
    time: '03-04 22:00',
    status: 'default',
  },
  {
    id: 'o-5',
    title: '已发货',
    content: '卖家已发货，物流单号 SF1234567890',
    time: '03-03 16:00',
    status: 'default',
  },
]

// ==================== 场景 ====================

export const DEMO_SCENES = [
  {
    key: 'project',
    title: '项目发布',
    description: '自定义图标、颜色、可折叠详情',
    icon: 'mdi:timeline-text',
  },
  {
    key: 'pipeline',
    title: 'CI 流水线',
    description: '水平布局、状态着色',
    icon: 'mdi:pipe',
  },
  {
    key: 'order',
    title: '物流进度',
    description: '简洁样式、时间线跟踪',
    icon: 'mdi:truck-delivery',
  },
]

// ==================== 功能特性 ====================

export const FEATURE_LIST = [
  {
    icon: 'mdi:swap-vertical',
    title: '垂直 / 水平布局',
    desc: '通过 mode 一键切换排列方向',
    tag: '核心',
  },
  {
    icon: 'mdi:palette-outline',
    title: '自定义节点',
    desc: '图标、颜色、大小随心配置',
    tag: '核心',
  },
  {
    icon: 'mdi:unfold-more-horizontal',
    title: '可折叠详情',
    desc: '长文本内容支持展开/收起',
    tag: '交互',
  },
  {
    icon: 'mdi:tag-multiple-outline',
    title: '标签系统',
    desc: '节点内嵌标签组，便于分类',
    tag: '展示',
  },
  {
    icon: 'mdi:loading',
    title: 'Pending 状态',
    desc: '尾部加载指示，适合增量数据',
    tag: '交互',
  },
  {
    icon: 'mdi:brush-variant',
    title: 'CSS 变量主题',
    desc: '20+ 变量覆写，深度定制外观',
    tag: '主题',
  },
]

export const TAG_TYPE_MAP: Record<string, string> = {
  核心: 'success',
  交互: 'info',
  展示: 'warning',
  主题: 'default',
}
