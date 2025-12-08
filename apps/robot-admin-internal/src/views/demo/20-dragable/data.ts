/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-25 10:58:18
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-25 15:35:29
 * @FilePath: \Robot_Admin\src\views\demo\20-dragable\data.ts
 * @Description: 拖拽组件的演示页面 - 数据层
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

// 优先级类型定义
export type Priority = 'high' | 'medium' | 'low'

// 优先级配置
export const priorityConfig: Record<Priority, { type: string; text: string }> =
  {
    high: { type: 'error', text: '高优先级' },
    medium: { type: 'warning', text: '中优先级' },
    low: { type: 'success', text: '低优先级' },
  }

// 彩虹色彩数组
export const rainbowColors = [
  '#FF6B6B',
  '#FFB84D',
  '#FFD93D',
  '#6BCF7F',
  '#4ECDC4',
  '#45B7D1',
  '#9B59B6',
  '#F39C12',
  '#E74C3C',
  '#27AE60',
]

// 任务接口定义
export interface Task {
  id: number
  title: string
  priority: Priority
  date: string
  tag: string
  comments: number
  avatar: string
  name: string
}

// 看板数据结构 - 统一管理所有列
export const kanbanData = {
  todo: [
    {
      id: 1,
      title: 'Dashboard 页面重构',
      priority: 'high' as Priority,
      date: '2024-01-19',
      tag: 'web',
      comments: 28,
      avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/demo1.JPG',
      name: 'Alex',
    },
    {
      id: 2,
      title: '用户角色页面重构',
      priority: 'medium' as Priority,
      date: '2024-01-18',
      tag: 'web',
      comments: 15,
      avatar: 'https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/ip.jpg',
      name: 'CHENY',
    },
  ],
  progress: [
    {
      id: 3,
      title: '看板功能重构',
      priority: 'medium' as Priority,
      date: '2024-01-18',
      tag: 'web',
      comments: 22,
      avatar: 'https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/ip.jpg',
      name: 'CHENY',
    },
    {
      id: 4,
      title: 'UI 界面修复',
      priority: 'low' as Priority,
      date: '2024-01-19',
      tag: 'mobile',
      comments: 13,
      avatar: 'https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/ip.jpg',
      name: 'CHENY',
    },
  ],
  review: [
    {
      id: 5,
      title: '首页重构',
      priority: 'high' as Priority,
      date: '2024-01-19',
      tag: 'web',
      comments: 28,
      avatar: 'https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/ip.jpg',
      name: 'CHENY',
    },
    {
      id: 6,
      title: '分析页面重构',
      priority: 'high' as Priority,
      date: '2024-01-19',
      tag: 'web',
      comments: 28,
      avatar: 'https://cheny-chenyu.oss-cn-chengdu.aliyuncs.com/img/ip.jpg',
      name: 'CHENY',
    },
  ],
  done: [
    {
      id: 7,
      title: '拖拽组件开发',
      priority: 'low' as Priority,
      date: '2024-01-15',
      tag: 'web',
      comments: 28,
      avatar: 'https://07akioni.oss-cn-beijing.aliyuncs.com/demo1.JPG',
      name: 'David',
    },
  ],
}

// 看板列配置
export const kanbanColumnsConfig = [
  {
    key: 'todo' as keyof typeof kanbanData,
    title: 'TODO',
    headerClass: 'todo-header',
    emptyIcon: 'i-mdi:clipboard-list-outline',
    emptyText: '暂无任务',
  },
  {
    key: 'progress' as keyof typeof kanbanData,
    title: 'IN PROGRESS',
    headerClass: 'progress-header',
    emptyIcon: 'i-mdi:progress-clock',
    emptyText: '暂无进行中',
  },
  {
    key: 'review' as keyof typeof kanbanData,
    title: 'REVIEW',
    headerClass: 'review-header',
    emptyIcon: 'i-mdi:eye-check-outline',
    emptyText: '暂无待审核',
  },
  {
    key: 'done' as keyof typeof kanbanData,
    title: 'DONE',
    headerClass: 'done-header',
    emptyIcon: 'i-mdi:check-circle-outline',
    emptyText: '暂无已完成',
  },
]

// 技术栈数据
export const techCardsData = [
  {
    id: 1,
    name: 'Vue 3',
    logo: 'https://vuejs.org/logo.svg',
    link: 'https://vuejs.org/',
    description:
      'Vue 是一套用于构建用户界面的渐进式框架，设计为可以自底向上逐层应用。',
  },
  {
    id: 2,
    name: 'Naive UI',
    logo: 'https://www.naiveui.com/assets/naivelogo-BdDVTUmz.svg',
    link: 'https://www.naiveui.com/',
    description:
      '一个 Vue 3 组件库，比较完整，主题可调，使用 TypeScript，快且有趣。',
  },
  {
    id: 3,
    name: 'Vite',
    logo: 'https://vitejs.dev/logo.svg',
    link: 'https://vitejs.dev/',
    description: 'Vite 是一种新型前端构建工具，能够显著提升前端开发体验。',
  },
  {
    id: 4,
    name: 'TypeScript',
    logo: 'https://www.typescriptlang.org/favicon-32x32.png',
    link: 'https://www.typescriptlang.org/',
    description:
      'TypeScript 是 JavaScript 类型的超集，它可以编译成纯 JavaScript。',
  },
  {
    id: 5,
    name: 'UnoCSS',
    logo: 'https://unocss.dev/logo.svg',
    link: 'https://unocss.dev/',
    description: '即时的原子化 CSS 引擎，具有高性能且极具灵活性。',
  },
  {
    id: 6,
    name: 'Pinia',
    logo: 'https://pinia.vuejs.org/logo.svg',
    link: 'https://pinia.vuejs.org/',
    description: 'Vue 的状态管理库，直观、类型安全、轻便且灵活。',
  },
]

// 活动数据
export const activitiesData = [
  { id: '1', task: '可拖拽组件开发' },
  { id: '2', task: '监控页面开发' },
  { id: '3', task: '低代码平台开发' },
  { id: '4', task: '数据分析功能' },
  { id: '5', task: '用户权限管理' },
  { id: '6', task: '性能优化任务' },
]

// 新任务名称列表
export const taskNamesList = [
  '前端框架优化',
  '数据库设计',
  '接口文档编写',
  '测试用例完善',
  '代码重构任务',
  'UI设计评审',
  '产品需求分析',
  '性能监控配置',
]
