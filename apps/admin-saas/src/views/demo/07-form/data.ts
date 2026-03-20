/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-06 16:24:01
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-10 00:27:35
 * @FilePath: \Robot_Admin\src\views\demo\07-form-module\form\data.ts
 * @Description: 表单演示页面入口文件  - 基本数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */
import type { LayoutType } from '@robot-admin/naive-ui-components'

/**
 * 布局选项配置
 */
export const layoutOptions = [
  { label: '默认布局', value: 'default' as const },
  { label: '内联布局', value: 'inline' as const },
  { label: '网格布局', value: 'grid' as const },
  { label: '卡片布局', value: 'card' as const },
  { label: '标签页布局', value: 'tabs' as const },
  { label: '步骤布局', value: 'steps' as const },
  { label: '动态布局', value: 'dynamic' as const },
  { label: '自定义渲染', value: 'custom' as const },
] as const

/**
 * 布局描述信息映射表
 */
export const layoutDescriptions: Record<
  LayoutType,
  { title: string; content: string }
> = {
  default: {
    title: '默认布局',
    content:
      '标准的垂直表单布局，适用于大多数场景，支持富文本编辑器等复杂组件。',
  },
  inline: {
    title: '内联布局',
    content: '水平排列的表单布局，适用于简单表单或搜索条件，自动过滤复杂组件。',
  },
  grid: {
    title: '网格布局',
    content: '基于栅格系统的响应式布局，可以灵活控制每个表单项的宽度和位置。',
  },
  card: {
    title: '卡片布局',
    content: '将表单项按功能分组，每个分组显示在独立的卡片中，层次清晰。',
  },
  tabs: {
    title: '标签页布局',
    content: '将表单项分散到不同的标签页中，适用于内容较多的表单。',
  },
  steps: {
    title: '步骤布局',
    content: '引导用户按步骤填写表单，适用于注册、向导等场景。',
  },
  dynamic: {
    title: '动态布局',
    content: '支持动态添加、删除、显示/隐藏字段的表单布局。',
  },
  custom: {
    title: '自定义渲染',
    content: '支持自定义渲染效果和高级控件的表单布局。',
  },
}

/**
 * 测试数据配置
 */
const baseTestData = {
  username: 'cheny_888',
  realName: 'CHENY',
  age: 28,
  gender: 'male',
  email: 'demo@cheny-test.com',
  phone: '16888888888',
  password: 'Demo123456',
  address: '西安市未央区某某街道188号',
  description: '',
}

const extendedTestData = {
  hobbies: ['reading', 'music'],
  newsletter: true,
  satisfaction: 4.5,
  birthday: '1995-06-15',
  wechat: 'demo_cheny',
  volume: 60,
  description: '<p>这是<strong>富文本编辑器</strong>示例</p>',
}

/**
 * 测试数据配置管理器
 */
export const testDataConfig = {
  /**
   * 获取测试数据
   */
  getTestData(layoutType: LayoutType): Record<string, any> {
    const baseData = { ...baseTestData }

    // 根据布局类型添加对应的扩展数据
    const needsExtended = ['card', 'tabs', 'steps', 'dynamic', 'custom']
    if (needsExtended.includes(layoutType)) {
      Object.assign(baseData, extendedTestData)
    }

    // 默认布局添加富文本内容
    if (layoutType === 'default') {
      baseData.description = extendedTestData.description
    }

    return baseData
  },
}
