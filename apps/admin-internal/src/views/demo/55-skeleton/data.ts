/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2026-03-06
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2026-03-11
 * @FilePath: \Robot_Admin\src\views\demo\55-skeleton\data.ts
 * @Description: C_Skeleton 骨架屏演示页面 - 数据配置
 * Copyright (c) 2026 by CHENY, All Rights Reserved 😎.
 */

/** 演示场景 */
export const DEMO_SCENES = [
  {
    key: 'text',
    title: '文本骨架',
    icon: 'mdi:text',
    description: '适用于文章 / 描述段落的加载占位',
    badge: 'info',
    badgeText: '基础',
  },
  {
    key: 'avatar',
    title: '头像骨架',
    icon: 'mdi:account-circle',
    description: '适用于用户信息卡片的加载占位',
    badge: 'info',
    badgeText: '基础',
  },
  {
    key: 'card',
    title: '卡片骨架',
    icon: 'mdi:card-outline',
    description: '适用于信息卡片、商品卡片等的加载占位',
    badge: 'success',
    badgeText: '常用',
  },
  {
    key: 'image',
    title: '图片骨架',
    icon: 'mdi:image',
    description: '适用于图片 / 封面图的加载占位',
    badge: 'info',
    badgeText: '基础',
  },
  {
    key: 'table',
    title: '表格骨架',
    icon: 'mdi:table',
    description: '适用于数据表格的加载占位，支持表头和操作列',
    badge: 'warning',
    badgeText: '业务',
  },
  {
    key: 'form',
    title: '表单骨架',
    icon: 'mdi:form-textbox',
    description: '适用于表单页面的加载占位，支持多列布局',
    badge: 'warning',
    badgeText: '业务',
  },
  {
    key: 'list',
    title: '列表骨架',
    icon: 'mdi:format-list-bulleted',
    description: '适用于消息列表、通知列表的加载占位',
    badge: 'success',
    badgeText: '常用',
  },
  {
    key: 'detail',
    title: '详情骨架',
    icon: 'mdi:text-box-outline',
    description: '适用于详情页、描述列表的加载占位',
    badge: 'warning',
    badgeText: '业务',
  },
] as const

/** 动画类型选项 */
export const ANIMATION_OPTIONS = [
  { label: '波浪动画', value: 'wave' },
  { label: '脉冲动画', value: 'pulse' },
  { label: '无动画', value: 'none' },
]

/** 模拟已加载的内容 */
export const LOADED_CONTENT = {
  text: {
    title: 'Robot Admin 框架介绍',
    content:
      'Robot Admin 是一个企业级后台管理系统生态，基于 Vue 3 + TypeScript + Naive UI 构建，提供 49 个业务组件和 7 个独立 npm 包。',
  },
  avatar: {
    name: 'ChenYu',
    role: '全栈工程师',
    desc: '专注于 Vue 生态和企业级中后台架构设计',
  },
  table: {
    columns: ['姓名', '部门', '职位', '入职日期', '操作'],
    rows: [
      ['张三', '研发部', '前端工程师', '2025-03-15'],
      ['李四', '产品部', '产品经理', '2024-11-20'],
      ['王五', '设计部', 'UI 设计师', '2025-01-08'],
      ['赵六', '研发部', '后端工程师', '2025-06-01'],
    ],
  },
  list: [
    {
      title: '系统更新通知',
      desc: '框架已升级至 Vue 3.5.30，请及时更新依赖',
      time: '2 分钟前',
    },
    {
      title: '新组件发布',
      desc: 'C_Skeleton 骨架屏组件已发布，支持 8 种预设模式',
      time: '1 小时前',
    },
    {
      title: '安全提醒',
      desc: '检测到异常登录行为，已自动锁定账户',
      time: '3 小时前',
    },
  ],
}
